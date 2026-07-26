const cron = require("node-cron");
const { importCareerjetJobPages } = require("../services/job-import.service");

let isImportRunning = false;

function isEnabled(value) {
  return String(value).toLowerCase() === "true";
}

async function runCareerjetImport() {
  if (isImportRunning) {
    console.log("Careerjet import kihagyva: egy korábbi import még fut.");

    return;
  }

  isImportRunning = true;

  try {
    const keywords = process.env.CAREERJET_IMPORT_KEYWORDS || "software developer";
    const location = process.env.CAREERJET_IMPORT_LOCATION || "Budapest";
    const maxPages = Math.min(Math.max(Number(process.env.CAREERJET_IMPORT_MAX_PAGES) || 3, 1), 10);
    const pageSize = Math.min(Math.max(Number(process.env.CAREERJET_IMPORT_PAGE_SIZE) || 20, 1), 100);
    const userIp = process.env.CAREERJET_SCHEDULED_USER_IP || process.env.CAREERJET_TEST_USER_IP;
    const userAgent = process.env.CAREERJET_SCHEDULED_USER_AGENT || "Joblens/1.0";

    if (!userIp) {
      throw new Error("A CAREERJET_SCSHEDULED_USER_IP nincs beállítva.");
    }

    console.log("Automatikus Careerjet import indul:", {
      keywords,
      location,
      maxPages,
      pageSize,
    });

    const result = await importCareerjetJobPages({
      keywords,
      location,
      startPage: 1,
      maxPages,
      pageSize,
      userIp,
      userAgent,
    });

    console.log("Automatikus Careerjet import kész:", {
      sourceTotal: result.sourceTotal,
      sourcePages: result.sourcePages,
      processedPages: result.processedPages,
      created: result.statistics.created,
      updated: result.statistics.updated,
      skipped: result.statistics.skipped,
    });
  } catch (error) {
    console.error("Automatikus Careerjet import hiba:", error.response?.data || error);
  } finally {
    isImportRunning = false;
  }
}

function startCareerjetImportScheduler() {
  if (!isEnabled(process.env.CAREERJET_CRON_ENABLED)) {
    console.log("Az automatikus Careerjet import ki van kapcsolva.");

    return;
  }

  const schedule = process.env.CAREERJET_CRON_SCHEDULE || "0 */6 * * *";
  const timezone = process.env.CAREERJET_CRON_TIMEZONE || "Europe/Budapest";

  if (!cron.validate(schedule)) {
    throw new Error(`Érvénytelen Careerjet cron kifejezés: ${schedule}`);
  }

  cron.schedule(
    schedule,
    async () => {
      await runCareerjetImport();
    },
    {
      timezone,
    }
  );

  console.log(`Careerjet időzítő elindult: ${schedule}, időzóna: ${timezone}`);
}

module.exports = {
  startCareerjetImportScheduler,
  runCareerjetImport,
};