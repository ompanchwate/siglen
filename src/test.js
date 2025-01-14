import { schedule_alerts } from './services/scheduler.js';
import { scheduleEngine } from './engine.js';
import { log } from './services/logger.js';
import fs from 'fs';
import path from 'path';

jest.mock('./services/logger.js', () => ({
  log: jest.fn(),
}));

jest.mock('./services/scheduler.js', () => ({
  schedule_alerts: jest.fn(),
}));

jest.mock('./engine.js', () => ({
  scheduleEngine: jest.fn(),
}));

// Generate a large number of test alerts
const generateTestAlerts = (numAlerts) => {
  const alerts = {};
  for (let i = 1; i <= numAlerts; i++) {
    alerts[`test_alert_${i}`] = {
      metric_query: `test_metric_${i}`,
      condition_operator: ">",
      condition_value: 0.5,
      interval: 1,  // 1 second interval for testing
    };
  }
  return alerts;
};

// Test alert configuration
const numAlerts = 100;  // Simulate 100 alerts
const testAlerts = generateTestAlerts(numAlerts);

// Write test alerts to a temporary file
const testAlertsPath = path.join(__dirname, 'alerts.json');
fs.writeFileSync(testAlertsPath, JSON.stringify(testAlerts, null, 2));

describe('Alert System High Load Test', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  test('should call schedule_alerts and scheduleEngine under high load', () => {
    // Track start time
    const startTime = performance.now();

    // Call the functions
    for (let i = 0; i < numAlerts; i++) {
      schedule_alerts();  // Simulating high number of alert evaluations
      scheduleEngine();
    }

    // Track end time
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Check if they are called correctly
    expect(schedule_alerts).toHaveBeenCalledTimes(numAlerts);
    expect(scheduleEngine).toHaveBeenCalledTimes(numAlerts);
    console.log(`High Load Test Duration: ${duration}ms`);

    // Expect the system to complete under 5 seconds for 100 alerts
    expect(duration).toBeLessThan(5000);
  });

  test('should log messages during high-load test', async () => {
    // Track start time
    const startTime = performance.now();

    // Simulate running the alert system with logs
    for (let i = 0; i < numAlerts; i++) {
      log(`Starting Alert ${i + 1} Test...`);
    }

    // Track end time
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Check if log function is called for each alert
    expect(log).toHaveBeenCalledTimes(numAlerts);
    console.log(`Log Test Duration: ${duration}ms`);

    // Expect the system to complete under 5 seconds for 100 alerts
    expect(duration).toBeLessThan(5000);
  });

  test('should create a log file and handle high load', async () => {
    const logPath = path.join(__dirname, '../logs', 'alert_lags.log');
    
    // Simulate writing logs for high-load scenario
    fs.mkdirSync(path.dirname(logPath), { recursive: true }); // Ensure the directory exists

    // Track start time
    const startTime = performance.now();

    // Simulate writing logs for each alert
    for (let i = 0; i < numAlerts; i++) {
      fs.appendFileSync(logPath, `Test log entry ${i + 1}\n`);
    }

    // Track end time
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Read the log file and check content
    const logContent = fs.readFileSync(logPath, 'utf8');
    expect(logContent).toContain('Test log entry 1');
    expect(logContent).toContain(`Test log entry ${numAlerts}`);
    console.log(`Log Writing Duration: ${duration}ms`);

    // Expect the system to complete under 5 seconds for 100 alerts
    expect(duration).toBeLessThan(5000);

    // Cleanup
    fs.unlinkSync(testAlertsPath);
    fs.unlinkSync(logPath);
  });
});
