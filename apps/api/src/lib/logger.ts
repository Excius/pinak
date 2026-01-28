import pino from "pino";
import config from "./config.js";

const isProduction = config.NODE_ENV === "production";

const logger = pino({
  level: config.LOG_LEVEL,
  ...(isProduction ? {} : { transport: { target: "pino-pretty" } }),
});

class Logger {
  private logger = logger;

  private formatMessage(message: string, ...args: any[]): string {
    if (args.length === 0) return message;
    const formattedArgs = args
      .map((arg) =>
        typeof arg === "string"
          ? arg
          : typeof arg === "object"
            ? JSON.stringify(arg)
            : String(arg),
      )
      .join(" ");
    return `${message} ${formattedArgs}`;
  }

  info(message: string, ...args: any[]) {
    this.logger.info(this.formatMessage(message, ...args));
  }

  error(message: string, ...args: any[]) {
    this.logger.error(this.formatMessage(message, ...args));
  }

  warn(message: string, ...args: any[]) {
    this.logger.warn(this.formatMessage(message, ...args));
  }

  debug(message: string, ...args: any[]) {
    this.logger.debug(this.formatMessage(message, ...args));
  }

  trace(message: string, ...args: any[]) {
    this.logger.trace(this.formatMessage(message, ...args));
  }

  fatal(message: string, ...args: any[]) {
    this.logger.fatal(this.formatMessage(message, ...args));
  }
}

// Singleton instance
const loggerInstance = new Logger();

export default loggerInstance;
