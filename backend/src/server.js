require("dotenv").config();

const http = require("http");

const app = require("./app");
const prisma = require("./config/prisma");
const { startCareerjetImportScheduler } = require("./schedulers/careerjet-import.scheduler");

const PORT = Number(process.env.PORT) || 3000;

const server = http.createServer(app);

server.listen(PORT, () => {
  console.log(`JobLens API: http://localhost:${PORT}`);

  startCareerjetImportScheduler();
});