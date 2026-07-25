const express = require("express");
const jobImportController = require("../controllers/job-import.controller");
const authenticate = require("../middlewares/auth.middleware");

const router = express.Router();
router.use(authenticate);

router.post("/jooble", jobImportController.importJoobleJobs);
router.post("/careerjet", jobImportController.importCareerjetJobs);

module.exports = router;