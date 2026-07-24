const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.route");
const { notFoundHandler, errorHandler } = require("./middlewares/error.middleware");

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin:
      process.env.FRONTEND_URL || "http://localhost:5173",
      credentials: true,
  })
);


app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  req.status(200).json({
    success: true,
    name: "JobLens API",
    version: "1.0.0",
  })
})

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "A JobLens backend működik.",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);

app.use(notFoundHandler)
app.use(errorHandler)

module.exports = app;