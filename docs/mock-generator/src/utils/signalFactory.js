/**
 * Factory for creating realistic signal payloads
 */
export const createSignal = (componentId, componentType, severity, errorCode, message) => ({
  component_id: componentId,
  component_type: componentType,
  severity: severity,
  error_code: errorCode,
  message: message,
  timestamp: new Date().toISOString(),
  metadata: {
    generated_by: 'mock-generator',
    environment: 'production-sim'
  }
});

export const PRESETS = {
  RDBMS_OUTAGE: () => createSignal(
    'DB_PRIMARY_01', 
    'RDBMS', 
    'P0', 
    'CONNECTION_POOL_EXHAUSTED', 
    'Critical failure: Primary database connection pool exhausted. Incoming requests failing.'
  ),
  CACHE_BURST: () => createSignal(
    'CACHE_CLUSTER_01', 
    'CACHE', 
    'P2', 
    'CACHE_MISS_SPIKE', 
    'Warning: Cache cluster 01 experiencing high miss rate. Latency increasing.'
  ),
  API_FAILURE: () => createSignal(
    'API_GATEWAY_MAIN', 
    'API', 
    'P1', 
    'LATENCY_THRESHOLD_EXCEEDED', 
    'Error: API Gateway latency above 5000ms threshold. Circuit breaker open.'
  )
};
