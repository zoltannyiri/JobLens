const express = require('express');
const savedJobController = require('../controllers/saved-job.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate);

router.get("/", savedJobController.getSavedJobs);
router.get("/:jobId/status", savedJobController.getSavedStatus);
router.post("/:jobId", savedJobController.saveJob);
router.delete("/:jobId", savedJobController.unsaveJob);

module.exports = router;