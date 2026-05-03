import axios from 'axios';

const API_KEY = 'frontend-key-web';

const createClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    headers: {
      'X-API-Key': API_KEY,
      'Content-Type': 'application/json',
    },
  });

  return client;
};

export const ingesterApi = createClient('http://localhost:8001');
export const workflowApi = createClient('http://localhost:8002');
export const alertApi = createClient('http://localhost:8004');
export const mockApi = createClient('http://localhost:8003');
