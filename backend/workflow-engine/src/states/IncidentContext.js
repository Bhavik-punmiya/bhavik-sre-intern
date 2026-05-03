import { OpenState } from './OpenState.js';
import { InvestigatingState } from './InvestigatingState.js';
import { ResolvedState } from './ResolvedState.js';
import { ClosedState } from './ClosedState.js';

export class IncidentContext {
  constructor(incidentRow, pgPool) {
    this.incident = incidentRow;
    this.pgPool = pgPool;
    this.state = this.resolveState(incidentRow.status);
  }

  resolveState(status) {
    const map = {
      OPEN:          new OpenState(),
      INVESTIGATING: new InvestigatingState(),
      RESOLVED:      new ResolvedState(),
      CLOSED:        new ClosedState()
    };
    return map[status] ?? new OpenState();
  }

  setState(newState) { this.state = newState; }
  getCurrentState() { return this.state.getName(); }

  async updateStatus(status, extra = {}) {
    const client = await this.pgPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(
        `UPDATE work_items
         SET status = $1, updated_at = NOW(), end_time = $2, mttr_minutes = $3
         WHERE id = $4`,
        [status, extra.end_time ?? null, extra.mttr_minutes ?? null, this.incident.id]
      )
      await client.query('COMMIT');
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }

  async getRCA() {
    const result = await this.pgPool.query(
      'SELECT * FROM rca_records WHERE work_item_id = $1',
      [this.incident.id]
    );
    return result.rows[0] ?? null;
  }

  async investigate() { await this.state.investigate(this); }
  async resolve()     { await this.state.resolve(this); }
  async close()       { await this.state.close(this); }
}
