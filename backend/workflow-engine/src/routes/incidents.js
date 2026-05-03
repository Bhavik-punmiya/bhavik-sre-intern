import { IncidentContext } from '../states/IncidentContext.js';
import { pgPool } from '../db/postgres.js';
import { Signal } from '../db/mongo.js';
import { rebuildDashboardCache } from '../utils/dashboardCache.js';
import { RCARequiredError } from '../utils/errors.js';

export default async function incidentRoutes(fastify) {
  
  // NEW: Get all unique log groups (service types)
  fastify.get('/logs/groups', async (request, reply) => {
    const groups = await Signal.aggregate([
      { $group: { 
          _id: "$component_type", 
          count: { $sum: 1 },
          lastSeen: { $max: "$timestamp" }
      }},
      { $sort: { _id: 1 } }
    ]);
    return groups.map(g => ({
      type: g._id,
      count: g.count,
      lastSeen: g.lastSeen
    }));
  });

  // NEW: Get all unique log streams for a specific group (component_type)
  fastify.get('/logs/streams/:type', async (request, reply) => {
    const { type } = request.params;
    const streams = await Signal.aggregate([
      { $match: { component_type: type.toUpperCase() } },
      { $group: { 
          _id: "$component_id", 
          lastEvent: { $max: "$timestamp" }
      }},
      { $sort: { lastEvent: -1 } }
    ]);
    return streams.map(s => ({
      id: s._id,
      lastEvent: s.lastEvent
    }));
  });

  // NEW: Global audit logs from MongoDB
  fastify.get('/logs', async (request, reply) => {
    const { component_id, component_type, search } = request.query;
    let query = {};
    if (component_id) query.component_id = component_id;
    if (component_type) query.component_type = component_type;
    if (search) query.message = { $regex: search, $options: 'i' };

    return await Signal.find(query).sort({ timestamp: -1 }).limit(500);
  });
  
  const loadIncident = async (id) => {
    const res = await pgPool.query('SELECT * FROM work_items WHERE id = $1', [id]);
    if (res.rows.length === 0) throw new Error('Incident not found');
    return res.rows[0];
  };

  // GET /incidents - List all incidents
  fastify.get('/', async (request, reply) => {
    const { rows } = await pgPool.query('SELECT * FROM work_items ORDER BY created_at DESC');
    return rows;
  });

  // GET /incidents/:id
  fastify.get('/:id', async (request, reply) => {
    const { id } = request.params;
    const incident = await loadIncident(id);
    
    const rcaRes = await pgPool.query('SELECT * FROM rca_records WHERE work_item_id = $1', [id]);
    const signalCount = await Signal.countDocuments({ incident_id: id });
    
    const context = new IncidentContext(incident, pgPool);

    return {
      incident,
      rca: rcaRes.rows[0] || null,
      signal_count: signalCount,
      current_state: context.getCurrentState()
    };
  });

  // PATCH /incidents/:id/investigate
  fastify.patch('/:id/investigate', async (request, reply) => {
    const { id } = request.params;
    const incident = await loadIncident(id);
    const context = new IncidentContext(incident, pgPool);
    
    await context.investigate();
    await rebuildDashboardCache();
    
    return { status: 'INVESTIGATING', incident_id: id };
  });

  // PATCH /incidents/:id/resolve
  fastify.patch('/:id/resolve', async (request, reply) => {
    const { id } = request.params;
    const incident = await loadIncident(id);
    const context = new IncidentContext(incident, pgPool);
    
    await context.resolve();
    await rebuildDashboardCache();
    
    return { status: 'RESOLVED', incident_id: id };
  });

  // POST /incidents/:id/rca
  fastify.post('/:id/rca', async (request, reply) => {
    const { id } = request.params;
    const { root_cause_category, fix_applied, prevention_steps, incident_start, incident_end } = request.body;

    // Strict Validation
    const missing = [];
    if (!root_cause_category) missing.push('root_cause_category');
    if (!fix_applied || fix_applied.length < 10) missing.push('fix_applied (min 10 chars)');
    if (!prevention_steps || prevention_steps.length < 10) missing.push('prevention_steps (min 10 chars)');
    if (!incident_start) missing.push('incident_start');
    if (!incident_end) missing.push('incident_end');

    if (missing.length > 0) {
      return reply.code(400).send({ error: `Missing or invalid fields: ${missing.join(', ')}` });
    }

    if (new Date(incident_end) <= new Date(incident_start)) {
      return reply.code(400).send({ error: 'incident_end must be after incident_start' });
    }

    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      const res = await client.query(
        `INSERT INTO rca_records (work_item_id, root_cause_category, fix_applied, prevention_steps, incident_start, incident_end)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (work_item_id) DO UPDATE SET 
            root_cause_category = EXCLUDED.root_cause_category,
            fix_applied = EXCLUDED.fix_applied,
            prevention_steps = EXCLUDED.prevention_steps,
            incident_start = EXCLUDED.incident_start,
            incident_end = EXCLUDED.incident_end
         RETURNING id`,
        [id, root_cause_category, fix_applied, prevention_steps, incident_start, incident_end]
      );
      await client.query('COMMIT');
      return reply.code(201).send({ rca_id: res.rows[0].id, work_item_id: id });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  });

  // PATCH /incidents/:id/close
  fastify.patch('/:id/close', async (request, reply) => {
    const { id } = request.params;
    try {
      const incident = await loadIncident(id);
      const context = new IncidentContext(incident, pgPool);
      
      await context.close();
      await rebuildDashboardCache();
      
      const updatedIncident = await loadIncident(id);
      return { 
        status: 'CLOSED', 
        mttr_minutes: updatedIncident.mttr_minutes, 
        incident_id: id 
      };
    } catch (err) {
      if (err instanceof RCARequiredError) {
        return reply.code(422).send({ error: err.message });
      }
      throw err;
    }
  });

  // GET /incidents/:id/signals (Paginated)
  fastify.get('/:id/signals', async (request, reply) => {
    const { id } = request.params;
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 50;
    const skip = (page - 1) * limit;

    const [signals, total] = await Promise.all([
      Signal.find({ incident_id: id }).sort({ timestamp: -1 }).skip(skip).limit(limit),
      Signal.countDocuments({ incident_id: id })
    ]);

    return { signals, total, page, limit };
  });
}
