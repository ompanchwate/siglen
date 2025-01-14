import { evaluate_alert } from './services/evaluator.js';
import { log } from './services/logger.js';
import { logToFile } from './services/alertsLoggerFile.js';
import alerts from '../alerts.json' assert { type: 'json' };
import pLimit from 'p-limit';

// Configure maximum concurrency
const MAX_CONCURRENT_TASKS = 5;
const limit = pLimit(MAX_CONCURRENT_TASKS);

// Group alerts by interval for efficient batch processing
const groupAlertsByInterval = (alerts) => {
  const groups = {};
  Object.entries(alerts).forEach(([alertId, config]) => {
    const interval = config.interval;
    if (!groups[interval]) {
      groups[interval] = [];
    }
    groups[interval].push({ alertId, config });
  });
  return groups;
};

// Process a batch of alerts
const processBatch = async (batch) => {
  const tasks = batch.map(({ alertId, config }) => {
    return limit(async () => {
      const scheduledTime = Date.now();
      try {
        const result = await evaluate_alert(alertId, config);
        const executionTime = Date.now() - scheduledTime;
        
        // Log execution metrics
        logToFile(`Batch Processing - Alert ID: ${alertId}, Execution Time: ${executionTime}ms`);
        
        // Check for lag
        if (executionTime > config.interval * 1000) {
          const lagMessage = `CRITICAL: Alert ${alertId} execution time (${executionTime}ms) exceeded interval (${config.interval * 1000}ms)`;
          log(lagMessage);
          logToFile(lagMessage);
        }
        
        return result;
      } catch (error) {
        const errorMessage = `Batch Processing Error - Alert ID: ${alertId}: ${error.message}`;
        log(errorMessage);
        logToFile(errorMessage);
        throw error;
      }
    });
  });
  
  return Promise.all(tasks);
};

// Enhanced processing engine with interval-based scheduling
const processAlerts = async () => {
  log('Starting Enhanced Parallel Evaluation Engine...');
  
  // Group alerts by interval
  const groupedAlerts = groupAlertsByInterval(alerts);
  
  // Process each interval group
  Object.entries(groupedAlerts).forEach(([interval, alertGroup]) => {
    const intervalMs = parseInt(interval) * 1000;
    
    // Schedule interval-specific batch processing
    setInterval(async () => {
      const batchStart = Date.now();
      try {
        await processBatch(alertGroup);
        const batchDuration = Date.now() - batchStart;
        
        // Monitor batch processing time
        if (batchDuration > intervalMs * 0.8) { // Alert if batch takes >80% of interval
          const warningMessage = `WARNING: Batch processing time (${batchDuration}ms) approaching interval time (${intervalMs}ms)`;
          log(warningMessage);
          logToFile(warningMessage);
        }
      } catch (error) {
        const errorMessage = `Batch Processing Failed - Interval ${interval}s: ${error.message}`;
        log(errorMessage);
        logToFile(errorMessage);
      }
    }, intervalMs);
  });
};

// Schedule the evaluation engine
export const scheduleEngine = () => {
  processAlerts().catch(error => {
    const errorMessage = `Engine Startup Failed: ${error.message}`;
    log(errorMessage);
    logToFile(errorMessage);
  });
};
