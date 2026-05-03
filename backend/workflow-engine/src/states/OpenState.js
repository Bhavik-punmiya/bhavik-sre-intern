import { IncidentState } from './IncidentState.js';
import { InvestigatingState } from './InvestigatingState.js';

export class OpenState extends IncidentState {
  getName() { return 'OPEN'; }
  async investigate(context) {
    await context.updateStatus('INVESTIGATING');
    context.setState(new InvestigatingState());
  }
}
