import pino from 'pino';
import config from './config.js';

const isProduction = config.NODE_ENV === 'production';

const logger = pino({
  level: config.LOG_LEVEL,
  ...(isProduction ? {} : { transport: { target: 'pino-pretty' } })
});

class Logger {
  private logger = logger;

  info(message: string, ...args: any[]) {
    this.logger.info(message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.logger.error(message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.logger.warn(message, ...args);
  }

  debug(message: string, ...args: any[]) {
    this.logger.debug(message, ...args);
  }

  trace(message: string, ...args: any[]) {
    this.logger.trace(message, ...args);
  }

  fatal(message: string, ...args: any[]) {
    this.logger.fatal(message, ...args);
  }
}

// Singleton instance
const loggerInstance = new Logger();

export default loggerInstance;