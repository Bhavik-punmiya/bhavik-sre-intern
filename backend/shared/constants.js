export const COMPONENT_TYPES = ['RDBMS', 'CACHE', 'API', 'QUEUE', 'MCP', 'NOSQL'];
export const SEVERITIES = ['P0', 'P1', 'P2', 'P3'];
export const WORK_ITEM_STATUS = {
  OPEN: 'OPEN',
  ACKNOWLEDGED: 'ACKNOWLEDGED',
  RESOLVED: 'RESOLVED',
  CLOSED: 'CLOSED'
};
export const INCIDENT_EXPIRY = 10; // 10 seconds for debounce
