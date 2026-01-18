import express from "express";
import logger from "./lib/logger.js";
import config from "./lib/config.js";
// import { ApiResponse } from "@repo/types";

const app = express();
const port = config.PORT;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  logger.info(`Server is running at http://localhost:${port}`);
});
