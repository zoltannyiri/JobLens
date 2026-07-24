const prisma = require('../config/prisma');

async function saveJob(userId, jobId) {
  const job = await prisma.job.findUnique({
    where: {
      id: jobId,
    },
    select: {
      id: true,
    },
  });

  if (!job) {
    return {
      jobMissing: true,
      savedJob: null,
    };
  }

  const savedJob = await prisma.savedJob.upsert({
    where: {
      userId_jobId: {
        userId,
        jobId,
      },
    },
    update: {},
    create: {
      userId,
      jobId,
    },
    include: {
      job: {
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
        },
      },
    },
  });

  return {
    jobMissing: false,
    savedJob,
  };
}

async function unsaveJob(userId, jobId) {
  const savedJob = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: {
        userId,
        jobId,
      },
    },
  });

  if (!savedJob) {
    return {
      savedJobMissing: true,
    };
  }

  await prisma.savedJob.delete({
    where: {
      userId_jobId: {
        userId,
        jobId,
      },
    },
  });

  return {
    savedJobMissing: false,
  };
}

async function getSavedJobs(userId, query) {
  const page = Math.max(Number(query.page) || 1, 1);

  const requestedLimit = Number(query.limit) || 20;

  const limit = Math.min(Math.max(requestedLimit, 1), 100);

  const skip = (page - 1) * limit;

  const where = {
    userId,
  };

  const [savedJobs, total] = await Promise.all([
    prisma.savedJob.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
      select: {
        id: true,
        createdAt: true,
        job: {
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
        },
      },
    }),

    prisma.savedJob.count({
      where,
    }),
  ]);


  return {
    jobs: savedJobs.map((savedJob) => ({
      ...savedJob.job,
      savedAt: savedJob.createdAt,
    })),

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

async function isJobSaved(userId, jobId) {
  const savedJob = await prisma.savedJob.findUnique({
    where: {
      userId_jobId: {
        userId,
        jobId,
      },
    },
    select: {
      id: true,
      createdAt: true,
    },
  });

  return {
    isSaved: Boolean(savedJob),
    savedAt: savedJob?.createdAt || null,
  };
}

module.exports = {
  saveJob,
  unsaveJob,
  getSavedJobs,
  isJobSaved,
};