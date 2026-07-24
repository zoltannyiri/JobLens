const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");

async function createSearchProfile(userId, data) {
  const existingProfile = await prisma.searchProfile.findUnique({
    where: {
      userId,
    },
  });

  if (existingProfile) {
    throw new AppError("Már létezik keresési profil ehhez a felhasználóhoz.", 409);
  }

  return prisma.searchProfile.create({
    data: {
      userId,
      ...data,
    },
  });
}

async function getSearchProfile(userId) {
  const profile = await prisma.searchProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!profile) {
    throw new AppError("Nem található keresési profil.", 404);
  }

  return profile;
}

async function updateSearchProfile(userId, data) {
  const currentProfile = await prisma.searchProfile.findUnique({
    where: {
      userId,
    },
  });

  if (!currentProfile) {
    throw new AppError("Nem található keresési profil.", 404);
  }

  const experienceMin = data.experienceMin !== undefined ? data.experienceMin : currentProfile.experienceMin;
  const experienceMax = data.experienceMax !== undefined ? data.experienceMax : currentProfile.experienceMax;

  if (experienceMin !== null && experienceMax !== null && experienceMin > experienceMax) {
    throw new AppError("A minimum tapasztalat nem lehet nagyobb a maximumnál.", 400);
  }

  return prisma.searchProfile.update({
    where: {
      userId,
    },
    data,
  });
}

async function deleteSearchProfile(userId) {
  const result = await prisma.searchProfile.deleteMany({
    where: {
      userId,
    },
  });

  if (result.count === 0) {
    throw new AppError("Nem található keresési profil.", 404);
  }
}

module.exports = {
  createSearchProfile,
  getSearchProfile,
  updateSearchProfile,
  deleteSearchProfile,
};