import { IncidentState } from './IncidentState.js';
import { ClosedState } from './ClosedState.js';
import { RCARequiredError } from '../utils/errors.js';

export class ResolvedState extends IncidentState {
  getName() { return 'RESOLVED'; }
  async close(context) {
    // Step 1: Check RCA exists and is complete
    const rca = await context.getRCA();
    if (!rca) {
      throw new RCARequiredError('Cannot close incident: RCA record is missing');
    }
    
    const missing = [];
    if (!rca.root_cause_category) missing.push('root_cause_category');
    if (!rca.fix_applied)         missing.push('fix_applied');
    if (!rca.prevention_steps)    missing.push('prevention_steps');
    if (!rca.incident_start)      missing.push('incident_start');
    if (!rca.incident_end)        missing.push('incident_end');
    
    if (missing.length > 0) {
      throw new RCARequiredError(`Cannot close incident: RCA incomplete. Missing: ${missing.join(', ')}`);
    }

    // Step 2: Calculate MTTR
    const mttrMinutes = Math.round(
      (new Date(rca.incident_end) - new Date(rca.incident_start)) / 60000
    );

    // Step 3: Close with MTTR
    await context.updateStatus('CLOSED', {
      end_time: new Date(),
      mttr_minutes: mttrMinutes
    });
    context.setState(new ClosedState());
  }
}
