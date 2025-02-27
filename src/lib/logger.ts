type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogContext {
  [key: string]: any;
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

export const logger = {
  info: (message: string, context: LogContext = {}) => {
    logMessage('info', message, null, context);
  },
  
  warn: (message: string, context: LogContext = {}) => {
    logMessage('warn', message, null, context);
  },
  
  error: (message: string, error: unknown, context: LogContext = {}) => {
    logMessage('error', message, error, context);
  },
  
  debug: (message: string, context: LogContext = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      logMessage('debug', message, null, context);
    }
  }
};

function logMessage(level: LogLevel, message: string, error: unknown = null, context: LogContext = {}) {
  const logEntry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context: Object.keys(context).length > 0 ? redactSensitiveData(context) : undefined
  };

  if (error) {
    logEntry.error = {
      name: error instanceof Error ? error.name : 'UnknownError',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    };
  }

  const logString = JSON.stringify(logEntry);
  
  switch (level) {
    case 'info':
      console.log(logString);
      break;
    case 'warn':
      console.warn(logString);
      break;
    case 'error':
      console.error(logString);
      break;
    case 'debug':
      console.debug(logString);
      break;
  }
}

// Redact sensitive fields from logs
function redactSensitiveData(data: any): any {
  if (!data) return data;
  
  const sensitiveFields = [
    'password', 'token', 'secret', 'socialSecurityNumber', 'ssn', 
    'driversLicense', 'creditCard', 'signature'
  ];
  
  if (typeof data === 'object') {
    const result = Array.isArray(data) ? [...data] : {...data};
    
    for (const key in result) {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        result[key] = '[REDACTED]';
      } else if (typeof result[key] === 'object') {
        result[key] = redactSensitiveData(result[key]);
      }
    }
    
    return result;
  }
  
  return data;
} 