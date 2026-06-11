import pino from "pino";
import config from "./config.js";
import { createRequire } from "module";

const isProduction = config.NODE_ENV === "production";

// Only enable human-friendly `pino-pretty` when it's actually installed.
// Production images typically prune devDependencies (where pino-pretty is kept),
// so attempting to use the transport will crash the app during startup.
let transport: any = undefined;
if (!isProduction) {
  try {
    const require = createRequire(import.meta.url);
    // Throw if not resolvable
    require.resolve("pino-pretty");
    transport = {
      target: "pino-pretty",
      options: {
        colorize: true,
      },
    };
  } catch (err) {
    // `pino-pretty` not available — fall back to JSON output
    transport = undefined;
  }
}

const logger = pino({
  level: config.LOG_LEVEL,
  ...(transport ? { transport } : {}),
  base: { pid: process.pid },
  serializers: { err: pino.stdSerializers.err },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
