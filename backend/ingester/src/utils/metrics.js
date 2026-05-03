/**
 * Simple metrics tracker for signals
 */
class MetricsTracker {
  constructor() {
    this.totalSignals = 0;
    this.signalsInCurrentWindow = 0;
    this.lastWindowTimestamp = Date.now();
    this.signalsPerSec = 0;
  }

  increment() {
    this.totalSignals++;
    this.signalsInCurrentWindow++;
  }

  getSnapshot() {
    return {
      total: this.totalSignals,
      perSec: this.signalsPerSec
    };
  }

  resetWindow() {
    const now = Date.now();
    const elapsedSec = (now - this.lastWindowTimestamp) / 1000;
    
    if (elapsedSec > 0) {
      this.signalsPerSec = parseFloat((this.signalsInCurrentWindow / elapsedSec).toFixed(2));
    }
    
    this.signalsInCurrentWindow = 0;
    this.lastWindowTimestamp = now;
    
    console.log(`[METRICS] ${new Date().toISOString()} | signals/sec: ${this.signalsPerSec} | total: ${this.totalSignals}`);
  }
}

export const metrics = new MetricsTracker();
