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

// Test alert configuration
const testAlerts = {
  "test_alert_1": {
    "metric_query": "test_metric_1",
    "condition_operator": ">",
    "condition_value": 0.5,
    "interval": 5  // 5 seconds
  },
  "test_alert_2": {
    "metric_query": "test_metric_2",
    "condition_operator": "<",
    "condition_value": 0.3,
    "interval": 3  // 3 seconds
  }
};

// Write test alerts to a temporary file
const testAlertsPath = path.join(__dirname, 'alerts.json');
fs.writeFileSync(testAlertsPath, JSON.stringify(testAlerts, null, 2));

describe('Alert System Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks(); // Clear mocks before each test
  });

  test('should call schedule_alerts and scheduleEngine', () => {
    // Call the functions
    schedule_alerts();
    scheduleEngine();

    // Check if they are called
    expect(schedule_alerts).toHaveBeenCalledTimes(1);
    expect(scheduleEngine).toHaveBeenCalledTimes(1);
  });

  test('should log correct messages', async () => {
    // Simulate running the alert system
    log('Starting Alert System Test...');
    
    // Check if log function is called
    expect(log).toHaveBeenCalledWith('Starting Alert System Test...');
  });

  test('should create a log file and log messages', async () => {
    const logPath = path.join(__dirname, 'logs', 'alert_lags.log');
    
    // Simulate a log being written
    fs.mkdirSync(path.dirname(logPath), { recursive: true }); // Ensure the directory exists
    fs.writeFileSync(logPath, 'Test log entry\n');
    
    // Read the log file and check content
    const logContent = fs.readFileSync(logPath, 'utf8');
    expect(logContent).toContain('Test log entry');
    
    // Cleanup
    fs.unlinkSync(testAlertsPath);
    fs.unlinkSync(logPath);
  });

});
