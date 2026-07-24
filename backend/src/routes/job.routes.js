const express = require('express');

const jobController = require('../controllers/job.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.post("/", jobController.createJob);
router.get("/matched", jobController.getMatchedJobs);
router.get("/:id/match", jobController.getJobMatch);
router.get("/", jobController.getJobs);
router.get("/:id", jobController.getJobById);

module.exports = router;