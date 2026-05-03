import { pgPool } from '../db/postgres.js';
import { v4 as uuidv4 } from 'uuid';

export default async function userRoutes(fastify) {
  
  // Ensure users table exists
  await pgPool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      role TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Seed default users if empty
  const countRes = await pgPool.query('SELECT COUNT(*) FROM users');
  if (parseInt(countRes.rows[0].count) === 0) {
    await pgPool.query(`
      INSERT INTO users (id, name, email, role, status) VALUES 
      ($1::UUID, $2, $3, $4, $5),
      ($6::UUID, $7, $8, $9, $5)
    `, [
      uuidv4(), 'Bhavik Punmiya', 'bhavik@ims.local', 'Admin', 'Active',
      uuidv4(), 'On-Call Bot', 'alerts@ims.local', 'Service Account'
    ]);
  }

  // GET /users
  fastify.get('/', async (request, reply) => {
    const res = await pgPool.query('SELECT * FROM users ORDER BY created_at DESC');
    return res.rows;
  });

  // POST /users
  fastify.post('/', async (request, reply) => {
    const { name, email, role } = request.body;
    const id = uuidv4();
    try {
      const res = await pgPool.query(
        'INSERT INTO users (id, name, email, role, status) VALUES ($1::UUID, $2, $3, $4, $5) RETURNING *',
        [id, name, email, role, 'Active']
      );
      return res.rows[0];
    } catch (err) {
      if (err.code === '23505') return reply.status(400).send({ error: 'Email already exists' });
      throw err;
    }
  });

  // DELETE /users/:id
  fastify.delete('/:id', async (request, reply) => {
    const { id } = request.params;
    await pgPool.query('DELETE FROM users WHERE id = $1::UUID', [id]);
    return { status: 'deleted' };
  });
}
