import type { Server as HttpServer } from "http";
import logger from "./lib/logger.js";
import config from "./lib/config.js";
import { prisma } from "./lib/prisma.js";
import redis from "./lib/redis.js";
import app from "./app.js";

class Server {
  private server: HttpServer | null = null;
  private port: number;
  private isShuttingDown: boolean = false;

  constructor() {
    this.port = config.PORT;
    this.setupGracefulShutdown();
  }

  private setupGracefulShutdown(): void {
    // Handle termination signals
    process.on("SIGTERM", () => this.gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => this.gracefulShutdown("SIGINT"));

    // Handle uncaught exceptions
    process.on("uncaughtException", (err) => {
      logger.fatal({ err }, "Uncaught Exception:");
      this.forceShutdown(1);
    });

    process.on("unhandledRejection", (reason, promise) => {
      logger.fatal({ promise, reason }, "Unhandled Rejection");
      this.forceShutdown(1);
    });
  }

  private gracefulShutdown(signal: string): void {
    if (this.isShuttingDown) {
      logger.warn(
        { signal },
        `Shutdown already in progress, ignoring ${signal}`,
      );
      return;
    }

    this.isShuttingDown = true;
    logger.info(
      { signal },
      `Received ${signal}. Starting graceful shutdown...`,
    );

    if (!this.server) {
      logger.warn("Server not initialized, exiting immediately");
      process.exit(0);
      return;
    }

    // Stop accepting new connections
    this.server.close((err?: Error) => {
      if (err) {
        logger.error({ err }, "Error during server close:");
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
          logger.error({ err: cleanupError }, "Error during cleanup:");
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
    try {
      await redis.quit();
      logger.info("Redis connection closed");

      // Close Prisma database connection
      await prisma.$disconnect();
      logger.info("Database connection closed");
    } catch (error) {
      logger.error({ err: error }, "Error closing database connection:");
    }

    logger.info("All cleanup operations completed");
  }

  private forceShutdown(code: number): void {
    logger.warn({ code }, `Force shutdown with exit code: ${code}`);
    process.exit(code);
  }

  public start(): void {
    this.server = app.listen(this.port, () => {
      logger.info(`Server is running at http://localhost:${this.port}`);
      logger.info(
        `Health check available at http://localhost:${this.port}/health`,
      );
    });

    this.server.on("error", (err: Error) => {
      logger.fatal({ err }, "Server failed to start:");
      process.exit(1);
    });
  }
}

const server = new Server();
server.start();
