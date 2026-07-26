const cron = require("node-cron");
const prisma = require("../config/prisma");
const { importCareerjetJobPages } = require("../services/job-import.service");

let isImportRunning = false;

function isEnabled(value) {
  return String(value).toLowerCase() === "true";
}

function normalizeArray(value) {
  return Array.isArray(value) ? value
    .map((item) => String(item || "").trim())
    .filter(Boolean) : [];
}

function buildProfileQueries(profile) {
  const positionTitle = String(
    profile.positionTitle || ""
  ).trim();

  if (!positionTitle) {
    return [];
  }

  const locations = normalizeArray(profile.locations);

  const normalizedLocations = locations.length > 0 ? locations : ["Magyarország"];

  return normalizedLocations.map((location) => ({
    profileId: profile.id,
    keywords: positionTitle,
    location,
  }));
}

function removeDuplicateQueries(queries) {
  const uniqueQueries = new Map();

  for (const query of queries) {
    const key = [
      query.keywords.toLowerCase(),
      query.location.toLowerCase(),
    ].join("|");

    if (!uniqueQueries.has(key)) {
      uniqueQueries.set(key, query);
    }
  }

  return [...uniqueQueries.values()];
}

async function getCareerjetQueriesFromDatabase() {
  const searchProfiles = await prisma.searchProfile.findMany({
    where: {
      notificationsEnabled: true,
    },
    select: {
      id: true,
      positionTitle: true,
      locations: true,
      technologies: true,
      includedKeywords: true,
      excludedKeywords: true,
    }
  });

  const queries = searchProfiles.flatMap(buildProfileQueries);

  return {
    profileCount: searchProfiles.length,
    queries: removeDuplicateQueries(queries),
  };
}

async function runCareerjetImport() {
  if (isImportRunning) {
    console.log("Careerjet import kihagyva: egy korábbi import még fut.");

    return;
  }

  isImportRunning = true;

  try {
    const maxPages = Math.min(Math.max(Number(process.env.CAREERJET_IMPORT_MAX_PAGES) || 3, 1), 10);
    const pageSize = Math.min(Math.max(Number(process.env.CAREERJET_IMPORT_PAGE_SIZE) || 20, 1), 100);
    const userIp = process.env.CAREERJET_SCHEDULED_USER_IP || process.env.CAREERJET_TEST_USER_IP;
    const userAgent = process.env.CAREERJET_SCHEDULED_USER_AGENT || "Joblens/1.0";

    if (!userIp) {
      throw new Error("A CAREERJET_SCHEDULED_USER_IP nincs beállítva.");
    }

    const { profileCount, queries } = await getCareerjetQueriesFromDatabase();

    if (queries.length === 0) {
      console.log("Careerjet import kihagyva: nincs engedélyezett keresési profil.");
      
      return;
    }

    console.log("Automatikus Careerjet import indul:", {
      profileCount,
      uniqueQueryCount: queries.length,
      maxPages,
      pageSize,
    });

    for (const query of queries) {
      console.log("Careerjet keresés indul:", {
        profileId: query.profileId,
        keywords: query.keywords,
        location: query.location,
      });

      const result = await importCareerjetJobPages({
        keywords: query.keywords,
        location: query.location,
        startPage: 1,
        maxPages,
        pageSize,
        userIp,
        userAgent,
      });

      console.log("Careerjet keresés kész:", {
        profileId: query.profileId,
        keywords: query.keywords,
        location: query.location,
        sourceTotal: result.sourceTotal,
        sourcePages: result.sourcePages,
        processedPages: result.processedPages,
        created: result.statistics.created,
        updated: result.statistics.updated,
        skipped: result.statistics.skipped,
      });
    }

    // const result = await importCareerjetJobPages({
    //   keywords,
    //   location,
    //   startPage: 1,
    //   maxPages,
    //   pageSize,
    //   userIp,
    //   userAgent,
    // });

    // console.log("Automatikus Careerjet import kész:", {
    //   sourceTotal: result.sourceTotal,
    //   sourcePages: result.sourcePages,
    //   processedPages: result.processedPages,
    //   created: result.statistics.created,
    //   updated: result.statistics.updated,
    //   skipped: result.statistics.skipped,
    // });
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