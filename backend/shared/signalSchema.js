import { COMPONENT_TYPES, SEVERITIES } from './constants.js';

export const signalSchema = {
  type: 'object',
  required: ['component_id', 'component_type', 'severity', 'error_code', 'message', 'timestamp'],
  properties: {
    component_id: { type: 'string', minLength: 1 },
    component_type: { 
      type: 'string', 
      enum: COMPONENT_TYPES 
    },
    severity: { 
      type: 'string', 
      enum: SEVERITIES 
    },
    error_code: { type: 'string', minLength: 1 },
    message: { type: 'string', minLength: 1 },
    timestamp: { type: 'string', format: 'date-time' },
    metadata: { type: 'object' }
  },
  additionalProperties: false
};
