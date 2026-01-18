import { config } from "dotenv";

// Load environment variables from .env file
config({ path: "../../.env" });

class Config {
  /**
   * The current environment the application is running in.
   * Common values: 'development', 'production', 'test'
   * Affects logging format and other environment-specific behavior
   */
  public readonly NODE_ENV: string;

  /**
   * The port number on which the server will listen for incoming requests.
   * Default: 3000
   */
  public readonly PORT: number;

  /**
   * The logging level for the application.
   * Common values: 'fatal', 'error', 'warn', 'info', 'debug', 'trace'
   * Default: 'info'
   * Controls which log messages are displayed
   * use 'debug' for development and 'info' for production
   */
  public readonly LOG_LEVEL: string;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || "development";
    this.PORT = parseInt(process.env.PORT || "3000", 10);
    this.LOG_LEVEL = process.env.LOG_LEVEL || "info";
  }
}

// Singleton instance
const appConfig = new Config();

export default appConfig;
