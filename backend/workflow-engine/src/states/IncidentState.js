export class IncidentState {
  async investigate(context) {
    throw new Error(`Cannot transition to INVESTIGATING from ${this.constructor.name}`);
  }
  async resolve(context) {
    throw new Error(`Cannot transition to RESOLVED from ${this.constructor.name}`);
  }
  async close(context) {
    throw new Error(`Cannot transition to CLOSED from ${this.constructor.name}`);
  }
  getName() {
    throw new Error('getName() must be implemented');
  }
}
