const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const path = require("path");
const http = require("http");

dotenv.config({
  path: path.join(__dirname, ".env"),
});

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.disable("x-powered-by");

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    name: "JobLens API",
    version: "1.0.0",
  });
});

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "A JobLens backend működik.",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "A kért végpont nem található.",
    path: req.originalUrl,
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: "Belső szerverhiba történt.",
  });
});

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`JobLens API elindult: http://localhost:${PORT}`);
});

function shutdown(signal) {
  console.log(`\n${signal} érkezett. A szerver leáll...`);

  server.close((error) => {
    if (error) {
      console.error("Hiba történt a szerver leállításakor:", error);
      process.exit(1);
    }

    console.log("A szerver szabályosan leállt.");
    process.exit(0);
  });
}

process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));