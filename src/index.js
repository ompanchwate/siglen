import { schedule_alerts } from './services/scheduler.js';
import { log } from './services/logger.js';
import { scheduleEngine } from './engine.js';

log('Starting Alert System...');
schedule_alerts();

// Prallel Engine
// console.log('Starting the Alert Evaluation System...');
// scheduleEngine();
