import dotenv from 'dotenv';
dotenv.config();

const VALID_KEYS = new Set((process.env.VALID_API_KEYS || '').split(',').map(k => k.trim()));

export const apiKeyAuth = async (request, reply) => {
  const apiKey = request.headers['x-api-key'];

  if (!apiKey || !VALID_KEYS.has(apiKey)) {
    reply.code(401).send({ error: 'Unauthorized: Invalid or missing API Key' });
    return;
  }
};
