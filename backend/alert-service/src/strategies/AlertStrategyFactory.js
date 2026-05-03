import { RDBMSAlertStrategy } from './RDBMSAlertStrategy.js';
import { CacheAlertStrategy } from './CacheAlertStrategy.js';
import { APIAlertStrategy } from './APIAlertStrategy.js';
import { QueueAlertStrategy } from './QueueAlertStrategy.js';
import { MCPAlertStrategy } from './MCPAlertStrategy.js';
import { NoSQLAlertStrategy } from './NoSQLAlertStrategy.js';

export class AlertStrategyFactory {
  static create(componentType, config) {
    const strategies = {
      RDBMS: RDBMSAlertStrategy,
      CACHE: CacheAlertStrategy,
      API:   APIAlertStrategy,
      QUEUE: QueueAlertStrategy,
      MCP:   MCPAlertStrategy,
      NOSQL: NoSQLAlertStrategy,
    };
    
    const StrategyClass = strategies[componentType];
    if (!StrategyClass) {
      throw new Error(`No strategy found for component type: ${componentType}`);
    }
    
    return new StrategyClass(config);
  }
}
