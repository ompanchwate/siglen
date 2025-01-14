import { log } from './logger.js';
import { evaluate_alert } from './evaluator.js';
import alerts from '../../alerts.json' assert { type: 'json' };
import { logToFile } from './alertsLoggerFile.js';
export const schedule_alerts = () => {
    Object.entries(alerts).forEach(([alertId, alertConfig]) => {
        // console.log(alertId, alertConfig)
      const evaluateAndSchedule = async () => {
        const scheduledTime = Date.now(); // Secheduled Evaluation time
        setTimeout(async () => {
          const start = Date.now(); // evaluation start time
          const lag = start - scheduledTime;
  
          const LAG_THRESHOLD = 200; // Lag threshold
  
          if (lag > LAG_THRESHOLD) {
            const errorMessage = `[ERROR] Alert ID: ${alertId} has lagged by ${lag}ms, exceeding the threshold of ${LAG_THRESHOLD}ms.`;
            log(`[ERROR] ${errorMessage}`);
            // logToFile(errorMessage);
          }
  
          // alert evaluation
          await evaluate_alert(alertId, alertConfig);
        }, alertConfig.interval * 1000);
      };
  
      evaluateAndSchedule();
      // again calls it to evaluate periodically
      setInterval(evaluateAndSchedule, alertConfig.interval * 1000);
    });
  };
  

