

import { log } from './logger.js';
import { evaluate_alert } from './evaluator.js';
import { logToFile } from './alertsLoggerFile.js';
import alerts from '../../alerts.json' assert { type: 'json' };

const CRITICAL_LAG_THRESHOLD = 500; // ms
const WARNING_LAG_THRESHOLD = 200; // ms

export const schedule_alerts = () => {
  const scheduledTasks = new Map(); // Track scheduled tasks
  
  Object.entries(alerts).forEach(([alertId, alertConfig]) => {
    const evaluateAndSchedule = async () => {
      const scheduledTime = Date.now();
      
      // Track scheduling accuracy
      const actualScheduleTime = Date.now();
      const scheduleAccuracy = actualScheduleTime - scheduledTime;
      
      if (scheduleAccuracy > WARNING_LAG_THRESHOLD) {
        const accuracyMessage = `Schedule accuracy warning - Alert ${alertId}: ${scheduleAccuracy}ms delay`;
        log(accuracyMessage);
        logToFile(accuracyMessage);
      }
      
      setTimeout(async () => {
        const executionStart = Date.now();
        const initialLag = executionStart - scheduledTime;
        
        // Lag detection before execution
        if (initialLag > CRITICAL_LAG_THRESHOLD) {
          const lagMessage = `CRITICAL: Initial lag detected for Alert ${alertId}: ${initialLag}ms`;
          log(lagMessage);
          logToFile(lagMessage);
        }
        
        try {
          const result = await evaluate_alert(alertId, alertConfig);
          const totalExecutionTime = Date.now() - executionStart;
          
          // Log execution metrics
          logToFile(`Alert ${alertId} execution complete:
            Initial Lag: ${initialLag}ms
            Execution Time: ${totalExecutionTime}ms
            Condition Met: ${result.conditionMet}`);
          
          // Track task completion
          scheduledTasks.set(alertId, {
            lastExecution: Date.now(),
            executionTime: totalExecutionTime
          });
          
        } catch (error) {
          const errorMessage = `Alert ${alertId} execution failed: ${error.message}`;
          log(errorMessage);
          logToFile(errorMessage);
        }
      }, alertConfig.interval * 1000);
    };
    
    // Initial execution
    evaluateAndSchedule();
    
    // Schedule periodic execution
    const intervalId = setInterval(() => {
      const lastExecution = scheduledTasks.get(alertId)?.lastExecution;
      if (lastExecution) {
        const timeSinceLastExecution = Date.now() - lastExecution;
        if (timeSinceLastExecution > alertConfig.interval * 1000 * 1.5) {
          const driftMessage = `WARNING: Alert ${alertId} showing scheduling drift: ${timeSinceLastExecution}ms since last execution`;
          log(driftMessage);
          logToFile(driftMessage);
        }
      }
      evaluateAndSchedule();
    }, alertConfig.interval * 1000);
    
    // Store interval ID for potential cleanup
    scheduledTasks.set(`${alertId}_interval`, intervalId);
  });
  
  // Return cleanup function
  return () => {
    for (const [key, value] of scheduledTasks.entries()) {
      if (key.endsWith('_interval')) {
        clearInterval(value);
      }
    }
    scheduledTasks.clear();
  };
};
