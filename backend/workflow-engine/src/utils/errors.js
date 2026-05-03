export class RCARequiredError extends Error {
  constructor(message) {
    super(message);
    this.name = 'RCARequiredError';
    this.statusCode = 422;
  }
}
