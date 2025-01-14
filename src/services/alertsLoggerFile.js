
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const logFilePath = path.join(logsDir, 'alert_lags.log');

export const logToFile = (message) => {
  const logEntry = `${new Date().toISOString()} - ${message}\n`;

  try {
    fs.appendFileSync(logFilePath, logEntry);
  } catch (err) {
    console.error(`[ERROR] Failed to write log to file: ${err.message}`);
  }
};
