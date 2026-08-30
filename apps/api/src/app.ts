import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import config from "./lib/config.js";
import { ResponseHandler, errorHandler } from "./lib/response.js";
import { createRateLimiter } from "./lib/rateLimit.js";
import apiRoutes from "./routes/index.js";

const app = express();

// Trust proxy for accurate IP detection behind load balancers/proxies
if (config.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// Rate limiting middleware
app.use(createRateLimiter());

// HTTP request logging middleware
if (config.NODE_ENV === "development") {
  app.use(morgan("dev"));
} else {
  app.use(morgan("combined"));
}

// Body parsing middleware
app.use(express.json());
app.use(cookieParser());

// CORS middleware
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);

      // Check if the origin is in the allowed list
      if (config.CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      // Reject the request
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);

// Security middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // API only
    crossOriginResourcePolicy: { policy: "same-site" },
    crossOriginOpenerPolicy: { policy: "same-origin" },
    crossOriginEmbedderPolicy: false,
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    xFrameOptions: { action: "deny" },
    noSniff: true,
    // Configure HSTS (only in production with HTTPS)
    hsts: false,
  }),
);

// Health check endpoint
app.get("/health", (req, res) => {
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

// static files were havign issue being served so served it liek this
// usecase: app uses it to verify the domain for deeplinking
app.get("/.well-known/assetlinks.json", (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.send([
    {
      relation: ["delegate_permission/common.handle_all_urls"],
      target: {
        namespace: "android_app",
        package_name: "com.pinak.mobile",
        sha256_cert_fingerprints: [
          "95:21:43:CD:CE:D7:46:56:E0:33:C0:9E:32:95:B1:C7:EA:55:09:F2:B1:9C:09:E4:1C:1A:79:70:9B:5A:76:A1",
        ],
      },
    },
  ]);
});

// Add other routes here
app.use("/api/v1", apiRoutes);

// Not found handler
app.use((req, res) => {
  ResponseHandler.notFound(res, "Resource not found");
});

// Add global error handling middleware (must be last)
app.use(errorHandler);

export default app;
