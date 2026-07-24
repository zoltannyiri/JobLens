const prisma = require('../config/prisma');

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
};