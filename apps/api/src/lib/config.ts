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

  /**
   * The email address used as the sender in outgoing emails.
   */
  public readonly MAIL_FROM: string;

  /**
   * The SMTP server host for sending emails.
   */
  public readonly SMTP_HOST: string;

  /**
   * The SMTP server port.
   */
  public readonly SMTP_PORT: number;

  /**
   * Whether to use a secure connection (TLS) for SMTP.
   */
  public readonly SMTP_SECURE: boolean;

  /**
   * The SMTP username for authentication (if required).
   */
  public readonly SMTP_USER?: string;

  /**
   * The SMTP password for authentication (if required).
   */
  public readonly SMTP_PASS?: string;

  /**
   * The expiry time for forgot password links in minutes.
   */
  public readonly FORGOT_PASSWORD_EXPIRY_MINUTES: number;

  /**
   * The expiry time for email verification links in hours.
   */
  public readonly EMAIL_VERIFICATION_EXPIRY_HOURS: number;

  /**
   * The backend URL of the application.
   * Used for constructing links in emails.
   */
  public readonly BACKEND_URL: string;

  /**
   * The mobile app URL scheme.
   * Used for constructing links in emails for mobile platforms.
   */
  public readonly MOBILE_APP_URL: string;

  /**
   * The frontend URL of the application.
   * Used for constructing links in emails.
   */
  public readonly FRONTEND_URL: string;

  /**
   * OAuth2 Client ID for third-party authentication for website.
   */
  public readonly CLIENT_ID_WEB: string;

  /**
   * OAuth2 Client ID for third-party authentication for mobile apps.
   */
  public readonly CLIENT_ID_MOBILE: string;

  /**
   * OAuth2 Client Secret for third-party authentication.
   */
  public readonly CLIENT_SECRET: string;

  /**
   * OAuth2 Redirect URI for third-party authentication.
   */
  public readonly REDIRECT_URI: string;

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

    if (!process.env.MAIL_FROM) {
      throw new Error("MAIL_FROM environment variable is required");
    }
    this.MAIL_FROM = process.env.MAIL_FROM;

    if (!process.env.SMTP_HOST) {
      throw new Error("SMTP_HOST environment variable is required");
    }
    this.SMTP_HOST = process.env.SMTP_HOST;

    this.SMTP_PORT = parseInt(process.env.SMTP_PORT || "587", 10); // Default: 587

    this.SMTP_SECURE = process.env.SMTP_SECURE === "true"; // Default: false

    this.SMTP_USER = process.env.SMTP_USER;

    this.SMTP_PASS = process.env.SMTP_PASS;

    this.FORGOT_PASSWORD_EXPIRY_MINUTES = parseInt(
      process.env.FORGOT_PASSWORD_EXPIRY_MINUTES || "15",
      10,
    ); // Default: 15 minutes

    this.EMAIL_VERIFICATION_EXPIRY_HOURS = parseInt(
      process.env.EMAIL_VERIFICATION_EXPIRY_HOURS || "24",
      10,
    ); // Default: 24 hours

    this.BACKEND_URL = process.env.BACKEND_URL || "http://localhost:3000";
    this.MOBILE_APP_URL = process.env.MOBILE_APP_URL || "myapp://app";
    this.FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

    if (!process.env.CLIENT_ID_WEB) {
      throw new Error("CLIENT_ID environment variable is required");
    }
    this.CLIENT_ID_WEB = process.env.CLIENT_ID_WEB;

    if (!process.env.CLIENT_ID_MOBILE) {
      throw new Error("CLIENT_ID_MOBILE environment variable is required");
    }
    this.CLIENT_ID_MOBILE = process.env.CLIENT_ID_MOBILE;

    if (!process.env.CLIENT_SECRET) {
      throw new Error("CLIENT_SECRET environment variable is required");
    }
    this.CLIENT_SECRET = process.env.CLIENT_SECRET;

    if (!process.env.REDIRECT_URI) {
      throw new Error("REDIRECT_URI environment variable is required");
    }
    this.REDIRECT_URI = process.env.REDIRECT_URI;
  }
}

// Singleton instance
const appConfig = new Config();

export default appConfig;
