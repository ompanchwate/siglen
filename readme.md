# Alert System

#### **Overview**

The Scalable Alert Notification System is designed to handle the evaluation and notification of millions of alerts in real-time, with strict guarantees to prevent evaluation lag. Alerts are defined in JSON format, containing parameters for evaluation intervals, metric queries, and conditions. The system ensures timely processing of alerts and notifications while addressing challenges like high throughput, lag detection

---

#### **Alert Format**

Alerts are stored in a database or file and follow this structure:

```{  
  "id1": {
     "interval": 1 to 60000,  // Evaluation interval in minutes
     "metric_query": "-1h:now:some_me_name:avg", // Query for metric data
     "condition_operator": ">",  // Comparison operator
     "condition_value": some_number  // Threshold for the condition
  },
  "id2": {
      ... 
  }  
}
```

---


## Project Structure

- **`logs/`**: The source code directory that contains the core logic of the alert evaluation system.
    - `alert_lags.log`: Contains all the lag report
- **`src/`**: The source code directory that contains the core logic of the alert evaluation system.
  - **`services/`**:
    - `alertsLoggerFile`: Contains the logic to add the errors in a file
    - `evaluator.js`: Contains the logic to evaluate alert conditions.
    - `logger.js`: Handles logging of messages, including errors and evaluation results.
  - **`engine.js`**: The main evaluation engine which processes alerts from the configuration.
  - **`test.js`**: Jest test file to test the alert system.

- **`alerts.json`**: JSON file containing test alert configurations (metrics, conditions, etc.).

- **`package.json`**: Project dependencies, scripts, and metadata.

- **`README.md`**: This file provides an overview and setup instructions for the project.



## Features

- **Alert Evaluation**: The system checks for specified conditions on metrics (like threshold comparisons) and logs the result.
- **Concurrency Control**: Alerts are processed in parallel with a maximum concurrency limit.
- **Error Handling**: Errors during the alert evaluation are logged for debugging.
- **Log Management**: Evaluation results, including errors, are logged into a file.
- **Test Suite**: Jest tests are available to verify the functionality of the alert system.

## Assumptions

1. **MAX_CONCURRENT_TASKS = 5**  
   The system can handle a maximum of 5 concurrent tasks at a time. If the number of tasks exceeds this limit, the system will wait for one task to complete before starting a new one.

2. **Alert Trigger Condition**  
   An alert is triggered when **30% of the interval time** has passed. For example, if the interval is set to 5 seconds, the alert will be triggered after 4 seconds.



## Setup

### Prerequisites

Make sure you have Node.js (version 16 or later) and npm installed. You can verify your installation with:

# Setup Instructions

Follow the steps below to set up the project on your local machine:

## Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (version 14 or higher): [Download Node.js](https://nodejs.org/)
- **npm** (Node package manager, comes with Node.js)

## Steps to Set Up the Project

1. **Download the zip file or Clone the repository:**

   Clone the repository from GitHub using the following command:
   ```
   git clone https://github.com/ompanchwate/siglen
   cd siglen
2. Install all dependencies
    ```
    npm install
3. To run the project
    ```
    node src/index.js
3. To test the project
    ``` 
    npm test