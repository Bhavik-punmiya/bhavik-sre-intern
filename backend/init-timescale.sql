CREATE TABLE signal_metrics (
  time TIMESTAMPTZ NOT NULL,
  component_id VARCHAR(100),
  severity VARCHAR(10),
  component_type VARCHAR(50)
);

SELECT create_hypertable('signal_metrics', 'time');
CREATE INDEX idx_metrics_component ON signal_metrics(component_id, time DESC);
