const jobImportService = require("../services/job-import.service");

function getRequestIp(req) {
  const forwardedFor = req.headers["x-forwarded-for"];

  if (typeof forwardedFor === "string" && forwardedFor.trim()) {
    return forwardedFor.split(",")[0].trim();
  }

  return (
    process.env.CAREERJET_TEST_USER_IP || req.ip
  );
}

async function importJoobleJobPages(req, res, next) {
  try {
    const {
      keywords,
      location = "Magyarország",
      startPage = 1,
      maxPages = 3,
      resultOnPage = 20,
    } = req.body;

    if (typeof keywords !== "string" || !keywords.trim()) {
      return res.status(400).json({
        success: false,
        message: "A keresési kulcsszó kötelező.",
      });
    }

    const result = await jobImportService.importJoobleJobPages({
      keywords: keywords.trim(),
      location: typeof location === "string" && location.trim() ? location.trim() : "Magyarország",
      startPage: Math.max(Number(startPage) || 1, 1),
      maxPages: Math.min(Math.max(Number(maxPages) || 3, 1), 10),
      resultOnPage: Math.min(Math.max(Number(resultOnPage) || 20, 1), 50),
    });

    return res.status(200).json({
      success: true,
      message: "A többoldalas Jooble-import befejeződött.",
      data: result,
    });
  } catch (error) {
    if (error.response) {
      return res
        .status(error.response.status || 502)
        .json({
          success: false,
          message: "A Jooble API nem adott megfelelő választ.",
          details: error.response.data || null,
        });
    }
    next(error);
  }
}

async function importCareerjetJobs(req, res, next) {
  try {
    const {
      keywords,
      location = "Magyarország",
      page = 1,
      pageSize = 20,
    } = req.body;

    if (typeof keywords !== "string" || !keywords.trim()) {
      return res.status(400).json({
        success: false,
        message: "A keresési kulcsszó kötelező.",
      });
    }

    const normalizedPage = Math.min(Math.max(Number(page) || 1, 1), 10);

    const normalizedPageSize = Math.min(Math.max(Number(pageSize) || 20, 1), 100);

    const userIp = getRequestIp(req);

    const userAgent = req.get("user-agent") ||"Joblens/1.0";

    const result = await jobImportService.importCareerjetJobs({
      keywords: keywords.trim(),
      location: typeof location === "string" ? location.trim() : "",
      page: normalizedPage,
      pageSize: normalizedPageSize,
      userIp,
      userAgent,
    });

    return res.status(200).json({
      success: true,
      message: "A Careerjet állások importálása befejeződött.",
      data: result,
    });
  } catch (error) {
    if (error.response) {
      return res
        .status(error.response.status || 502)
        .json({
          success: false,
          message: "A Careerjet API nem adott megfelelő választ.",
          details: error.response.data || null,        
        });
    }
    next(error);
  }
}

async function importCareerjetJobPages(req, res, next) {
  try {
    const {
      keywords,
      location = "Magyarország",
      startPage = 1,
      pageSize = 20,
      maxPages = 3,
    } = req.body;

    if (typeof keywords !== "string" || !keywords.trim()) {
      return res.status(400).json({
        success: false,
        message: "A keresési kulcsszó kötelező.",
      });
    }

    const userIp = getRequestIp(req);

    const userAgent = req.get("user-agent") || "Joblens/1.0";

    const result = await jobImportService.importCareerjetJobPages({
      keywords: keywords.trim(),
      location: typeof location === "string" ? location.trim() : "Magyarország",
      startPage: Math.max(Number(startPage) || 1, 1),
      maxPages: Math.min(Math.max(Number(maxPages) || 3, 1), 10),
      pageSize: Math.min(Math.max(Number(pageSize) || 20, 1), 100),
      userIp,
      userAgent,
    });

    return res.status(200).json({
      success: true,
      message: "A többoldalas Careerjet import befejeződött.",
      data: result,
    });
  } catch (error) {
    if (error.response) {
      return res
        .status(error.response.status || 502)
        .json({
          success: false,
          message: "A Careerjet API nem adott megfelelő választ.",
          details: error.response.data || null,
        });
    }

    next(error);
  }
}

async function importJoobleJobs(req, res, next) {
  try {
    const {
      keywords,
      location = "Magyarország",
      page = 1,
      resultOnPage = 20,
    } = req.body;

    if (typeof keywords !== "string" || !keywords.trim()) {
      return res.status(400).json({
        success: false,
        message: "A keresési kulcsszó kötelező.",
        errors: [
          {
            field: "keywords",
            message: "Adj meg legalább egy keresési kulcsszót.",
          },
        ],
      });
    }

    const normalizedPage = Math.max(Number(page) || 1, 1);

    const normalizedResultOnPage = Math.min(Math.max(Number(resultOnPage) || 20, 1), 50);

    const result = await jobImportService.importJoobleJobs({
      keywords: keywords.trim(),
      location: typeof location === "string" && location.trim() ? location.trim() : "Magyarország",
      page: normalizedPage,
      resultOnPage: normalizedResultOnPage,
    });

    return res.status(200).json({
      success: true,
      message: "A Jooble állások importálása befejeződött.",
      data: result,
    });
  } catch (error) {
    if (error.response) {
      return res.status(error.response.status || 502).json({
        success: false,
        message: "A Jooble API nem adott megfelelő választ.",
        details: error.response.data || null,
      });
    }

    next(error);
  }
}

module.exports = {
  importJoobleJobs,
  importCareerjetJobs,
  importCareerjetJobPages,
  importJoobleJobPages,
};