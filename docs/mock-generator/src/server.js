import Fastify from 'fastify';
import dotenv from 'dotenv';
import simulateRoutes from './routes/simulate.js';

dotenv.config();

const fastify = Fastify({
  logger: true
});

// Routes
fastify.register(simulateRoutes, { prefix: '/simulate' });

// Global Error Handler
fastify.setErrorHandler((error, request, reply) => {
  console.error('[MOCK GEN ERROR]', error);
  reply.status(500).send({ error: error.message });
});

// Start Server
const start = async () => {
  try {
    const port = process.env.PORT || 8003;
    await fastify.listen({ port: parseInt(port), host: '0.0.0.0' });
    console.log(`Mock Generator service running on port ${port}`);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();
