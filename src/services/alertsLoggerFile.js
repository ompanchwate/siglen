import fs from 'fs';
import path from 'path';

// To simulate __dirname in ES modules
const __dirname = path.dirname(new URL(import.meta.url).pathname);

// Adjust path to remove any issue with duplicate drive letters
const logFilePath = path.resolve(__dirname, '../../logs/alert_lags.log');

export const logToFile = (message) => {
  const logEntry = `${new Date().toISOString()} - ${message}\n`;

  // Ensure the log directory exists before appending the file
  fs.mkdir(path.dirname(logFilePath), { recursive: true }, (err) => {
    if (err) {
      console.error(`[ERROR] Failed to create log directory: ${err.message}`);
      return;
    }

    fs.appendFile(logFilePath, logEntry, (err) => {
      if (err) {
        console.error(`[ERROR] Failed to write log to file: ${err.message}`);
      }
    });
  });
};
