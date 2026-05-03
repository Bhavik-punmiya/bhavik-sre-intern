import { IncidentState } from './IncidentState.js';
import { ResolvedState } from './ResolvedState.js';

export class InvestigatingState extends IncidentState {
  getName() { return 'INVESTIGATING'; }
  async resolve(context) {
    await context.updateStatus('RESOLVED');
    context.setState(new ResolvedState());
  }
}
