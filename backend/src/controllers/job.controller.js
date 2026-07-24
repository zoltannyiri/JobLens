const jobService = require('../services/job.service');

async function createJob(req, res, next) {
  try {
    const {
      source,
      externalId,
      title,
      company,
      location,
      description,
      url,
      publishedAt,
      experienceMin,
      experienceMax,
      seniority,
      roleType,
      remoteType,
      rawData,
    } = req.body;

    const errors = [];

    if (typeof source !== "string" || !source.trim()) {
      error.push({
        field: "source",
        message: "A forrás megadása kötelező.",
      });
    }

    if (typeof title !== "string" || !title.trim()) {
      errors.push({
        field: "url",
        message: "Az álláshirdetés URL-je kötelező.",
      });
    } else {
      try {
        new URL(url);
      } catch {
        errors.push({
          field: "url",
          message: "Érvénytelen URL.",
        });
      }
    }

    if (experienceMin !== undefined && experienceMin !== null && (!Number.isInteger(experienceMin) || experienceMin < 0)) {
      errors.push({
        field: "experienceMin",
        message: "A minimum tapasztalat nemnegatív egész szám legyen.",
      });
    }

    if (experienceMax !== undefined && experienceMax !== null && (!Number.isInteger(experienceMax) || experienceMax < 0)) {
      errors.push({
        field: "experienceMax",
        message: "A maximum tapasztalat nemnegatív egész szám legyen.",
      });
    }

    if (Number.isInteger(experienceMin) && Number.isInteger(experienceMax) && experienceMin > experienceMax) {
      errors.push({
        field: "experienceMin",
        message: "A maximum tapasztalat nem lehet kisebb a minimumnál.",
      });
    }


    if (publishedAt !== undefined && Number.isNaN(new Date(publishedAt).getTime())) {
      error.push({
        field: "publishedAt",
        message: "Érvénytelen publikálási dátum.",
      });
    } 

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "A megadott adatok érvénytelenek.",
        errors,
      });
    }

    const job = await jobService.createJob({
      source,
      externalId,
      title,
      company,
      location,
      description,
      url,
      publishedAt,
      experienceMin,
      experienceMax,
      seniority,
      roleType,
      remoteType,
      rawData,
    });

    return res.status(201).json({
      success: true,
      message: "Az álláshirdetés sikeresen létrejött.",
      data: {
        job,
      },
    });
  } catch (error) {
    if (error.code === "P2002") {
      return res.status(409).json({
        success: false,
        message: "Az álláshirdetés már szerepel az adatbázisban.",
      });
    }

    next(error);
  }
}

async function getJobs(req, res, next) {
  try {
    const result = await jobService.getJobs(req.query);

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getJobById(req, res, next) {
  try {
    const jobId = Number(req.params.id);
    
    if (!Number.isInteger(jobId) || jobId < 1) {
      return res.status(400).json({
        success: false,
        message: "Érvénytelen állásazonosító.",
      });
    }

    const job  = await jobService.getJobById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: "Az álláshirdetés nem található.",
      });
    }

    return res.status(200).json({
      success: true,
      data: job,
    });
  } catch (error) {
    next(error);
  }
}

async function getMatchedJobs(req, res, next) {
  try {
    const userId = req.user.id;

    const result = await jobService.getMatchedJobs(
      userId,
      req.query
    );

    if (result.profileMissing) {
      return res.status(404).json({
        success: false,
        message: "A személyre szabott találatokhoz előbb hozz létre keresési profilt.",
      });
    }

    return res.status(200).json({
      success: true,
      data: {
        jobs: result.jobs,
        pagination: result.pagination,
      },
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getJobs,
  getJobById,
  createJob,
  getMatchedJobs,
};