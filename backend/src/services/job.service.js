const prisma = require('../config/prisma');

function normalizeText(value) {
  return String(value || "")
    .toLocaleLowerCase("hu-HU")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getJobSearchText(job) {
  return normalizeText(
    [
      job.title,
      job.company,
      job.location,
      job.description,
      job.seniority,
      job.roleType,
      job.remoteType,
    ]
    .filter(Boolean)
    .join(" ")
  );
}

function containsTerm(text, term) {
  const normalizedTerm = normalizeText(term);

  return normalizedTerm.length > 0 && text.includes(normalizedTerm);
}

function calculateJobMatch(job, profile) {
  const jobText = getJobSearchText(job);

  const excludedMatches = (
    profile.excludedKeywords || []
  ).filter((keyword) => containsTerm(jobText, keyword));

  if (excludedMatches.length > 0) {
    return {
      isExcluded: true,
      score: 0,
      matchPercentage: 0,
      matchedReasons: [],
      excludedReasons: excludedMatches,
    };
  }

  let score = 0;
  let maximumScore = 0;
  const matchedReasons = [];

  const positionTitle = normalizeText(profile.positionTitle);

  if (positionTitle) {
    maximumScore += 35;

    const normalizedJobTitle = normalizeText(job.title);

    if (normalizedJobTitle.includes(positionTitle)) {
      score += 35;
      matchedReasons.push("A pozíció megnevezése egyezik.");
    } else {
      const positionWords = positionTitle
        .split(/\s+/)
        .filter((word) => word.length > 3);

      const matchingWords = positionWords.filter((word) => normalizedJobTitle.includes(word));

      if (matchingWords.length > 0) {
        const partialScore = (matchingWords.length / positionWords.length) * 35;

        score += partialScore;
        matchedReasons.push(
          "A pozíció megnevezése részben egyezik."
        );
      }
    }
  }

  if (profile.seniority) {
    maximumScore += 15;

    if (normalizeText(job.seniority) === normalizeText(profile.seniority)) {
      score += 15;
      matchedReasons.push("A tapasztalati szint egyezik.");
    }
  }

  const locations = profile.locations || [];

  if (locations.length > 0) {
    maximumScore += 15;

    const locationMatched = locations.some(
      (location) =>
        containsTerm(job.location, location) || containsTerm(jobText, location)
    );

    if (locationMatched) {
      score += 15;
      matchedReasons.push("A helyszín megfelelő.");
    }
  }

  if (profile.remoteOnly) {
    maximumScore += 10;

    if (normalizeText(job.remoteType) === "remote") {
      score += 10;
      matchedReasons.push("Az állás teljesen távoli munkavégzésű.");
    }
  }

  const technologies = profile.technologies || [];

  if (technologies.length > 0) {
    maximumScore += 20;

    const matchedTechnologies = technologies.filter(
      (technology) => containsTerm(jobText, technology)
    );

    if (matchedTechnologies.length > 0) {
      score += (matchedTechnologies.length / technologies.length) * 20;

      matchedReasons.push(
        `Egyező technológiák: ${matchedTechnologies.join(", ")}.`
      );
    }
  }

  const includedKeywords = profile.includedKeywords || [];

  if (includedKeywords.length > 0) {
    maximumScore += 15;

    const matchedKeywords = includedKeywords.filter(
      (keyword) => containsTerm(jobText, keyword)
    );

    if (matchedKeywords.length > 0) {
      score += (matchedKeywords.length / includedKeywords.length) * 15;

      matchedReasons.push(
        `Egyező kulcsszavak: ${matchedKeywords.join(", ")}.`
      );
    }
  }

  if (profile.experienceMin !== null && profile.experienceMin !== undefined && job.experienceMax !== null && job.experienceMax !== undefined) {
    maximumScore += 5;

    if (job.experienceMax >= profile.experienceMin) {
      score += 5;
      matchedReasons.push("A tapasztalati követelmény megfelelő.");
    }
  }

  const matchPercentage = maximumScore > 0 ? Math.round((score / maximumScore) * 100) : 0;

  return {
    isExcluded: false,
    score,
    matchPercentage,
    matchedReasons,
    excludedReasons: [],
  }
}

async function getMatchedJobs(userId, query) {
  const profile = await prisma.searchProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!profile) {
    return {
      profileMissing: true,
      jobs: [],
      pagination: {
        page: 1,
        limit: 0,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const page = Math.max(Number(query.page) || 1, 1);

  const requestedLimit = Number(query.limit) || 20;

  const limit = Math.min(
    Math.max(requestedLimit, 1),
    100
  );

  const minimumMatch = Math.min(
    Math.max(Number(query.minimumMatch) || 0, 0),
    100
  );

  const jobs = await prisma.job.findMany({
    orderBy: [
      {
        publishedAt: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
    select: {
      id: true,
      source: true,
      title: true,
      company: true,
      location: true,
      description: true,
      url: true,
      publishedAt: true,
      experienceMin: true,
      experienceMax: true,
      seniority: true,
      roleType: true,
      remoteType: true,
      createdAt: true,
    },
  });

  const matchedJobs = jobs
    .map((job) => {
      const match = calculateJobMatch(job, profile);

      return {
        ...job,
        matchPercentage: match.matchPercentage,
        matchedReasons: match.matchedReasons,
        excludedReasons: match.excludedReasons,
        isExcluded: match.isExcluded,
      };
    })
    .filter(
      (job) => !job.isExcluded && job.matchPercentage >= minimumMatch
    )
    .sort((first, second) => {
      if (second.matchPercentage !== first.matchPercentage) {
        return (
          second.matchPercentage - first.matchPercentage
        );
      }

      const firstDate = new Date(
        first.publishedAt || first.createdAt
      ).getTime();

      const secondDate = new Date(
        second.publishedAt || second.createdAt
      ).getTime();

      return secondDate - firstDate;
    });
  
  const total = matchedJobs.length;
  const totalPages = Math.ceil(total / limit);
  const skip = (page - 1) * limit;

  return {
    profileMissing: false,
    jobs: matchedJobs
      .slice(skip, skip + limit)
      .map(({ isExcluded, ...job }) => job),

    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  }
}

async function getJobMatchForUser(jobId, userId) {
  const [job, profile] = await Promise.all([
    prisma.job.findUnique({
      where: {
        id: jobId,
      },
      select: {
        id: true,
        title: true,
        company: true,
        location: true,
        description: true,
        experienceMin: true,
        experienceMax: true,
        seniority: true,
        roleType: true,
        remoteType: true,
      },
    }),

    prisma.searchProfile.findUnique({
      where: {
        userId,
      },
    }),
  ]);

  if (!job) {
    return {
      jobMissing: true,
      profileMissing: false,
      match: null,
    };
  }

  if (!profile) {
    return {
      jobMissing: false,
      profileMissing: true,
      match: null,
    };
  }

  const match = calculateJobMatch(job, profile);

  return {
    jobMissing: false,
    profileMissing: false,
    match: {
      matchPercentage: match.matchPercentage,
      matchedReasons: match.matchedReasons,
      excludedReasons: match.excludedReasons,
      isExcluded: match.isExcluded,
    },
  };
}

function buildJobWhere(query) {
  const { search, source, seniority, roleType, remoteType } = query;
  const where = {};

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        }
      },
      {
        company: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        location: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        description: {
          contains: search,
          mode: "insensitive",
        },
      },
    ]
  }

  if (source) {
    where.source = source;
  }

  if (seniority) {
    where.seniority = seniority;
  }

  if (roleType) {
    where.roleType = roleType;
  }

  if (remoteType) {
    where.remoteType = remoteType;
  }

  return where;
}

async function createJob(data) {
  return prisma.job.create({
    data: {
      source: data.source.trim(),
      externalId: data.externalId?.trim() || null,
      title: data.title.trim(),
      company: data.company?.trim() || null,
      location: data.location?.trim() || null,
      description: data.description?.trim() || null,
      url: data.url.trim(),
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : null,
      experienceMin: data.experienceMin ?? null,
      experienceMax: data.experienceMax ?? null,
      seniority: data.seniority?.trim() || null,
      roleType: data.roleType?.trim() || null,
      remoteType: data.remoteType?.trim() || null,
      rawData: data.rawData ?? null,
    },
    select: {
      id: true,
      externalId: true,
      source: true,
      title: true,
      company: true,
      location: true,
      description: true,
      url: true,
      publishedAt: true,
      experienceMin: true,
      experienceMax: true,
      seniority: true,
      roleType: true,
      remoteType: true,
      createdAt: true,
      updatedAt: true,
    }
  });
}

async function getJobs(query) {
  const page = Math.max(Number(query.page) || 1, 1);

  const requestedLimit = Number(query.limit) || 20;
  const limit = Math.min(
    Math.max(requestedLimit, 1),
    100
  );

  const skip = (page - 1) * limit;
  const where = buildJobWhere(query);

  const [jobs, total] = await Promise.all([
    prisma.job.findMany({
      where,
      orderBy: [
        {
          publishedAt: "desc",
        },
        {
          createdAt: "desc",
        },
      ],
      skip,
      take: limit,
      select: {
        id: true,
        source: true,
        title: true,
        company: true,
        location: true,
        url: true,
        publishedAt: true,
        experienceMin: true,
        experienceMax: true,
        seniority: true,
        roleType: true,
        remoteType: true,
        createdAt: true,
      },
    }),

    prisma.job.count({
      where,
    }),
  ]);

  return {
    jobs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function getJobById(id) {
  return prisma.job.findUnique({
    where: {
      id,
    },
    select: {
      id: true,
      externalId: true,
      source: true,
      title: true,
      company: true,
      location: true,
      url: true,
      description: true,
      publishedAt: true,
      experienceMin: true,
      experienceMax: true,
      seniority: true,
      roleType: true,
      remoteType: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

module.exports = {
  getJobs,
  getJobById,
  createJob,
  getMatchedJobs,
  getJobMatchForUser,
};