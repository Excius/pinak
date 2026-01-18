import express from "express";
import type { Server as HttpServer } from "http";
import logger from "./lib/logger.js";
import config from "./lib/config.js";
import { ResponseHandler } from "./lib/response.js";

class Server {
  private app: express.Application;
  private server: HttpServer | null = null;
  private port: number;
  private isShuttingDown: boolean = false;

  constructor() {
    this.app = express();
    this.port = config.PORT;
    this.initializeMiddleware();
    this.initializeRoutes();
    this.setupGracefulShutdown();
  }

  private initializeMiddleware(): void {
    // Body parsing middleware
    this.app.use(express.json());
    // Add other middleware here
    // this.app.use(cors());
    // this.app.use(helmet());
    // etc.
  }

  private initializeRoutes(): void {
    // Root endpoint
    this.app.get("/", (req, res) => {
      ResponseHandler.success(res, { message: "Hello, World!" });
    });

    // Health check endpoint
    this.app.get("/health", (req, res) => {
      ResponseHandler.success(
        res,
        {
          status: "OK",
          timestamp: new Date().toISOString(),
          uptime: process.uptime(),
        },
        "Health check successful",
      );
    });

    // Add other routes here
    // this.app.use('/api', apiRoutes);
  }

  private setupGracefulShutdown(): void {
    // Handle termination signals
    process.on("SIGTERM", () => this.gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => this.gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      logger.fatal("Uncaught Exception:", err);
      this.forceShutdown(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.fatal("Unhandled Rejection at:", promise, "reason:", reason);
      this.forceShutdown(1);
    });
  }

  private gracefulShutdown(signal: string): void {
    if (this.isShuttingDown) {
      logger.warn(`Shutdown already in progress, ignoring ${signal}`);
      return;
    }

    this.isShuttingDown = true;
    logger.info(`Received ${signal}. Starting graceful shutdown...`);

    if (!this.server) {
      logger.warn("Server not initialized, exiting immediately");
      process.exit(0);
      return;
    }

    // Stop accepting new connections
    this.server.close((err?: Error) => {
      if (err) {
        logger.error("Error during server close:", err);
        this.forceShutdown(1);
        return;
      }

      logger.info("HTTP server closed successfully");

      // Perform cleanup operations
      this.performCleanup()
        .then(() => {
          logger.info("Graceful shutdown completed");
          process.exit(0);
        })
        .catch((cleanupError) => {
          logger.error("Error during cleanup:", cleanupError);
          this.forceShutdown(1);
        });
    });

    // Force shutdown after 30 seconds
    setTimeout(() => {
      logger.error("Forced shutdown after 30 second timeout");
      this.forceShutdown(1);
    }, 30000);
  }

  private async performCleanup(): Promise<void> {
    // Add your cleanup logic here
    // Close database connections, Redis clients, etc.

    // Example cleanup operations:
    // if (databaseConnection) {
    //   await databaseConnection.close();
    //   logger.info('Database connection closed');
    // }

    // if (redisClient) {
    //   await redisClient.quit();
    //   logger.info('Redis connection closed');
    // }

    // if (messageQueue) {
    //   await messageQueue.close();
    //   logger.info('Message queue closed');
    // }

    // Simulate async cleanup (remove this in real implementation)
    await new Promise((resolve) => setTimeout(resolve, 100));
    logger.info("All cleanup operations completed");
  }

  private forceShutdown(code: number): void {
    logger.warn(`Force shutdown with exit code: ${code}`);
    process.exit(code);
  }

  public start(): void {
    this.server = this.app.listen(this.port, () => {
      logger.info(`Server is running at http://localhost:${this.port}`);
      logger.info(
        `Health check available at http://localhost:${this.port}/health`,
      );
    });

    this.server.on("error", (err: Error) => {
      logger.fatal("Server failed to start:", err);
      process.exit(1);
    });
  }

  public getApp(): express.Application {
    return this.app;
  }

  public getPort(): number {
    return this.port;
  }
}

// Create and start the server
const server = new Server();
server.start();

// Export the Express app for testing purposes
export default server.getApp();
