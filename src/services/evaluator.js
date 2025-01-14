import { log } from './logger.js';

const run_metric_query = async (metricQuery) => {
  return new Promise((resolve) => {
    const result = Math.random() > 0.5;
    const delay = Math.floor(Math.random() * 1000); // Simulate lag
    setTimeout(() => resolve(result), delay);
  });
};

export const evaluate_alert = async (alertId, alertConfig) => {
  const start = Date.now();
  const result = await run_metric_query(alertConfig.metric_query);
  const conditionMet = eval(`${result} ${alertConfig.condition_operator} ${alertConfig.condition_value}`);
  const duration = Date.now() - start;

  log(`Alert ID: ${alertId}, Condition Met: ${conditionMet}, Evaluation Time: ${duration}ms`);
  return { alertId, conditionMet, duration };
};

