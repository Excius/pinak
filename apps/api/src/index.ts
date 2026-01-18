import { config } from "dotenv";
config({ path: "../../.env" });
import express from "express";
// import { ApiResponse } from "@repo/types";

const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Hello, World!");
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
