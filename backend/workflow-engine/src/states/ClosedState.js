import { IncidentState } from './IncidentState.js';

export class ClosedState extends IncidentState {
  getName() { return 'CLOSED'; }
  async investigate(context) { throw new Error('Incident is already CLOSED'); }
  async resolve(context)     { throw new Error('Incident is already CLOSED'); }
  async close(context)       { throw new Error('Incident is already CLOSED'); }
}
