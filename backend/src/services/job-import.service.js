const prisma = require("../config/prisma");
const crypto = require("crypto");
const he = require("he");
const { searchJoobleJobs } = require("../providers/jobble.provider");
const { searchCareerjetJobs } = require("../providers/careerjet.provider");

function normalizeFingerprintPart(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function createJobFingerprint({
  source,
  title,
  company,
  location,
}) {
  const value = [
    source,
    title,
    company,
    location,
  ]
    .map(normalizeFingerprintPart)
    .join("|");

  return crypto
    .createHash("sha256")
    .update(value)
    .digest("hex");
}

function stripHtml(value) {
  if (typeof value !== "string") {
    return "";
  }

  const decodedValue = he.decode(value);

  return decodedValue
    .replace(/<[^>]*>/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function inferSeniority(title, description) {
  const text = `${title} ${description}`.toLowerCase();

  if (text.includes("intern") || text.includes("gyakornok") || text.includes("trainee")) {
    return "INTERN";
  }

  if (text.includes("junior") || text.includes("pályakezdő") || text.includes("entry level")) {
    return "JUNIOR";
  }

  if (text.includes("senior") || text.includes("lead") || text.includes("principal") || text.includes("architect")) {
    return "SENIOR";
  }

  if (text.includes("middle") || text.includes("mid-level") || text.includes("medior")) {
    return "MEDIOR";
  }

  return null;
}

function inferExperience(description) {
  const text = stripHtml(description).toLowerCase();

  const rangeMatch = text.match(/(\d+)\s*-\s*(\d+)\s*(?:years?|év)/);

  if (rangeMatch) {
    return {
      min: Number(rangeMatch[1]),
      max: Number(rangeMatch[2]),
    };
  }

  const minimumMatch = text.match(
    /(?:minimum|min\.?|at least|legalább)\s*(\d+)\+?\s*(?:years?|év)/
  );

  if (minimumMatch) {
    return {
      min: Number(minimumMatch[1]),
      max: null,
    };
  }

  const simpleMatch = text.match(/(\d+)\+?\s*(?:years?|év)(?:\s+of)?\s+(?:professional\s+)?experience/);

  if (simpleMatch) {
    return {
      min: Number(simpleMatch[1]),
      max: null,
    };
  }

  return {
    min: null,
    max: null,
  };
}

function inferRoleType(title) {
  const text = title.toLowerCase();

  if (text.includes("full-stack") || text.includes("full stack") || text.includes("fullstack")) {
    return "FULL_STACK";
  }

  if (text.includes("frontend") || text.includes("front-end") || text.includes("front end")) {
    return "FRONTEND";
  }

  if (text.includes("backend") || text.includes("back-end") || text.includes("back end")) {
    return "BACKEND";
  }

  return null;
}

function normalizeText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parsePublishedAt(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
}

function inferRemoteType(job) {
  const text = [
    job.title,
    job.location,
    job.snippet,
    job.type
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase();

  if (text.includes("remote") || text.includes("home office") || text.includes("távmunka")) {
    return "REMOTE";
  }

  if (text.includes("hybrid") || text.includes("hibrid")) {
    return "HYBRID";
  }

  return null;
}

function isHungarianJob(job) {
  const text = [
    job.location,
    job.title,
    job.snippet,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  const hungarianLocationTerms = [
    "hungary",
    "magyarország",
    "budapest",
    "debrecen",
    "szeged",
    "győr",
    "gyor",
    "pécs",
    "pecs",
    "miskolc",
    "székesfehérvár",
    "szekesfehervar",
    "kecskemét",
    "kecskemet",
    "nyíregyháza",
    "nyiregyhaza",
  ];

  return hungarianLocationTerms.some((term) => text.includes(term));
}

function mapJoobleJob(job) {
  const externalId = job.id !== undefined && job.id !== null ? String(job.id) : null;

  return {
    source: "jooble",
    externalId,
    title: normalizeText(job.title) || "Ismeretlen pozíció",
    company: normalizeText(job.company) || null,
    location: normalizeText(job.location) || null,
    description: normalizeText(job.snippet) || null,
    url: normalizeText(job.link),
    publishedAt: parsePublishedAt(job.updated),
    experienceMin: null,
    experienceMax: null,
    seniority: null,
    roleType: null,
    remoteType: inferRemoteType(job),
    rawData: job,
  };
}

function mapCareerjetJob(job) {
  const url = normalizeText(job.url);
  const title = normalizeText(job.title) || "Ismeretlen pozíció";
  const description = stripHtml(job.description);
  const experience = inferExperience(description);

  const jobData = {
    source: "careerjet",
    externalId: null,
    title: title || "Ismeretlen pozíció",
    company: normalizeText(job.company) || null,
    location: normalizeText(job.locations) || null,
    description: description || null,
    url: normalizeText(job.url),
    publishedAt: parsePublishedAt(job.date),
    experienceMin: experience.min,
    experienceMax: experience.max,
    seniority: inferSeniority(title, description),
    roleType: inferRoleType(title),
    remoteType: inferRemoteType({
      title,
      location: job.locations,
      snippet: description,
      type: null,
    }),
    rawData: job,
  };

  jobData.fingerprint = createJobFingerprint(jobData);

  return jobData;
}

async function importCareerjetJobs({
  keywords,
  location = "Magyarország",
  page = 1,
  pageSize = 20,
  userIp,
  userAgent,
}) {
  const careerjetResponse = await searchCareerjetJobs({
    keywords,
    location,
    page,
    pageSize,
    userIp,
    userAgent,
  });

  if (careerjetResponse.type === "LOCATIONS") {
    return {
      sourceTotal: 0,
      statistics: {
        received: 0,
        accepted: 0,
        skipped: 0,
        updated: 0,
        created: 0,
      },
      locationChoices: careerjetResponse.locations || [],
      message: careerjetResponse.message,
      jobs: [],
    };
  }

  const sourceJobs = Array.isArray(careerjetResponse.jobs) ? careerjetResponse.jobs : [];

  const statistics = {
    received: sourceJobs.length,
    accepted: 0,
    skipped: 0,
    updated: 0,
    created: 0,
  };

  const importedJobs = [];

  for (const sourceJob of sourceJobs) {
    const mappedJob = mapCareerjetJob(sourceJob);

    if (!mappedJob.url) {
      statistics.skipped += 1;
      continue;
    }

    statistics.accepted += 1;

    const result = await upsertImportedJob(mappedJob);

    if (result.status === "created") {
      statistics.created += 1;
      importedJobs.push(result.job);
    } else if (result.status === "updated") {
      statistics.updated += 1;
      importedJobs.push(result.job);
    } else {
      statistics.skipped += 1;
    }
  }

  return {
    sourceTotal: Number.isFinite(Number(careerjetResponse.hits)) ? Number(careerjetResponse.hits) : 0,
    pages: careerjetResponse.pages || 0,
    statistics,
    jobs: importedJobs,
  };
}

async function upsertImportedJob(jobData) {
  if (!jobData.url) {
    return {
      status: "skipped",
      reason: "missing_url",
    };
  }

  if (!jobData.fingerprint) {
    return {
      status: "skipped",
      reason: "missing_fingerprint",
    };
  }

  const existingJob = await prisma.job.findUnique({
    where: {
      fingerprint: jobData.fingerprint,
    },
    select: {
      id: true,
    },
  });

  const job = await prisma.job.upsert({
    where: {
      fingerprint: jobData.fingerprint,
    },
    update: jobData,
    create: jobData,
  });

  // if (existingJob) {
  //   const job = await prisma.job.update({
  //     where: {
  //       id: existingJob.id,
  //     },
  //     data: jobData,
  //   });

  //   return {
  //     status: "updated",
  //     job,
  //   };
  // }

  // const job = await prisma.job.create({
  //   data: jobData,
  // });

  return {
    status: existingJob ? "updated" : "created",
    job,
  };
}

async function importJoobleJobs({
  keywords,
  location = "Magyarország",
  page = 1,
  resultOnPage = 20,
}) {
  const joobleResponse = await searchJoobleJobs({
    keywords,
    location,
    page,
    resultOnPage,
  });

  const sourceJobs = Array.isArray(joobleResponse.jobs) ? joobleResponse.jobs : [];

  const statistics = {
    received: sourceJobs.length,
    accepted: 0,
    skipped: 0,
    updated: 0,
    created: 0,
  };

  const importedJobs = [];

  for (const sourceJob of sourceJobs) {
    if (!isHungarianJob(sourceJob)) {
      statistics.skipped += 1;
      continue;
    }

    statistics.accepted += 1;

    const mappedJob = mapJoobleJob(sourceJob);
    const result = await upsertImportedJob(mappedJob);

    if (result.status === "created") {
      statistics.created += 1;
      importedJobs.push(result.job);
    } else if (result.status === "updated") {
      statistics.updated += 1;
      importedJobs.push(result.job);
    } else {
      statistics.skipped += 1;
    }
  }

  return {
    sourceTotal: Number.isFinite(Number(joobleResponse.totalCount)) ? Number(joobleResponse.totalCount) : null,
    statistics,
    jobs: importedJobs,
  };
}

module.exports = {
  importJoobleJobs,
  importCareerjetJobs,
};