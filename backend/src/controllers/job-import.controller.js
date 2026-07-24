const jobImportService = require("../services/job-import.service");

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
};