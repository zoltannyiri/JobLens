const express = require("express");
const jobImportController = require("../controllers/job-import.controller");
const authenticate = require("../middlewares/auth.middleware");

const router = express.Router();
router.use(authenticate);

router.post("/jooble", jobImportController.importJoobleJobs);
router.post("/jooble/pages", jobImportController.importJoobleJobPages);
router.post("/careerjet", jobImportController.importCareerjetJobs);
router.post("/careerjet/pages", jobImportController.importCareerjetJobPages);
router.post("/profession", jobImportController.importProfessionJobs);

module.exports = router;