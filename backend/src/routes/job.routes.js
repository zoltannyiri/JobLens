const express = require('express');

const jobController = require('../controllers/job.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authenticate);

router.get("/", jobController.getJobs);
router.get("/:id", jobController.getJobById);
router.post("/", jobController.createJob);

module.exports = router;