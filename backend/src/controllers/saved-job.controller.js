const savedJobService = require('../services/saved-job.service');

function parseJobId(value) {
  const jobId = Number(value);

  if (!Number.isInteger(jobId) || jobId < 1) {
    return null;
  }

  return jobId;
}

async function saveJob(req, res, next) {
  try {
    const jobId = parseJobId(req.params.jobId);

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Érvénytelen állásazonosító.',
      });
    }

    const userId = req.user.id;

    const result = await savedJobService.saveJob(
      userId,
      jobId
    );

    if (result.jobMissing) {
      return res.status(404).json({
        success: false,
        message: "Az álláshirdetés nem található.",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Az álláshirdetés elmentve.",
      data: {
        savedJob: result.savedJob,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function unsaveJob(req, res, next) {
  try {
    const jobId = parseJobId(req.params.jobId);

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Érvénytelen állásazonosító.',
      });
    }

    const userId = req.user.id;

    const result = await savedJobService.unsaveJob(
      userId,
      jobId
    );

    if (result.savedJobMissing) {
      return res.status(404).json({
        success: false,
        message: "Ez az állás nincs elmentve.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Az állás eltávolítva a mentések közül.",
    });
  } catch (error) {
    next(error);
  }
}

async function getSavedJobs(req, res, next) {
  try {
    const userId = req.user.id;

    const result = await savedJobService.getSavedJobs(
      userId,
      req.query
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getSavedStatus(req, res, next) {
  try {
    const jobId = parseJobId(req.params.jobId);

    if (!jobId) {
      return res.status(400).json({
        success: false,
        message: 'Érvénytelen állásazonosító.',
      });
    }

    const userId = req.user.id;

    const result = await savedJobService.isJobSaved(
      userId,
      jobId
    );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  saveJob,
  unsaveJob,
  getSavedJobs,
  getSavedStatus,
};