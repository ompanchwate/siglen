import { evaluate_alert } from './services/evaluator.js';
import { log } from './services/logger.js';
import alerts from '../alerts.json' assert { type: 'json' };
import pLimit from 'p-limit'; // Control concurrency


// Configure maximum concurrency
const MAX_CONCURRENT_TASKS = 5;
const limit = pLimit(MAX_CONCURRENT_TASKS);

const processAlerts = async () => {
  log('Starting Parallelized Evaluation Engine...');

  // Convert alerts to an array of tasks
  const tasks = Object.entries(alerts).map(([alertId, alertConfig]) => {
    return limit(async () => {
      const start = Date.now(); // Task start time
      try {
        const result = await evaluate_alert(alertId, alertConfig);
        const duration = Date.now() - start; // Time taken for the task
        log(`Alert ID: ${alertId}, Condition Met: ${result.conditionMet}, Evaluation Time: ${duration}ms`);
      } catch (error) {
        const duration = Date.now() - start; // Time taken before error
        log(`[ERROR] Alert ID: ${alertId} failed. Error: ${error.message}. Time Elapsed: ${duration}ms`);
      }
    });
  });

  // Process all tasks in parallel with a concurrency limit
  await Promise.all(tasks);
  log('All alerts processed.');
};

// Schedule the evaluation engine to run periodically
export const scheduleEngine = () => {
  const EVALUATION_INTERVAL = 60000; // 60 seconds
  setInterval(processAlerts, EVALUATION_INTERVAL);
};

// Start the engine
scheduleEngine();
