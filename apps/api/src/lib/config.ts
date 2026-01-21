import { config } from "dotenv";

// Load environment variables from .env file
config({ path: ".env" });

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

  /**
   * The database connection URL.
   */
  public readonly DATABASE_URL: string;

  /**
   * The allowed origins for CORS requests.
   * Comma-separated list of allowed origins.
   * Required: at least one origin must be specified.
   */
  public readonly CORS_ORIGINS: string[];

  /**
   * The secret key used for signing and verifying JWT tokens.
   * Required.
   */
  public readonly JWT_SECRET: string;

  /**
   * The expiry time for refresh tokens in milliseconds.
   * Default: 30 days (2592000000 ms)
   */
  public readonly REFRESH_TOKEN_EXPIRY: number;

  /**
   * The expiry time for access tokens.
   * Default: 15 minutes ('15m')
   */
  public readonly ACCESS_TOKEN_EXPIRY: number;

  constructor() {
    this.NODE_ENV = process.env.NODE_ENV || "development";
    this.PORT = parseInt(process.env.PORT || "3000", 10);
    this.LOG_LEVEL = process.env.LOG_LEVEL || "info";
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }
    this.DATABASE_URL = process.env.DATABASE_URL;
    if (!process.env.CORS_ORIGINS) {
      throw new Error("CORS_ORIGINS environment variable is required");
    }
    this.CORS_ORIGINS = process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
      : [];
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET environment variable is required");
    }
    this.JWT_SECRET = process.env.JWT_SECRET;

    if (this.CORS_ORIGINS.length === 0) {
      throw new Error("CORS_ORIGINS environment variable is required");
    }

    this.REFRESH_TOKEN_EXPIRY = parseInt(
      process.env.REFRESH_TOKEN_EXPIRY || "2592000000",
      10,
    ); // Default: 30 days

    this.ACCESS_TOKEN_EXPIRY = parseInt(
      process.env.ACCESS_TOKEN_EXPIRY || "900000",
      10,
    ); // Default: 15 minutes
  }
}

// Singleton instance
const appConfig = new Config();

export default appConfig;
