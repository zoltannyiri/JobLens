const bcrypt = require("bcryptjs");
const prisma = require("../config/prisma");
const AppError = require("../utils/AppError");
const { createAccessToken, createRefreshToken, hashRefreshToken, getRefreshTokenExpirationDate } = require("../utils/tokens");

const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  isActive: true,
  emailVerifiedAt: true,
  createdAt: true,
  updatedAt: true,
};

async function createSession(userId) {
  const refreshToken = createRefreshToken();
  const tokenHash = hashRefreshToken(refreshToken);
  const expiresAt = getRefreshTokenExpirationDate();

  await prisma.session.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
    },
  });

  return refreshToken;
}

async function registerUser({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const existingUser = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (existingUser) {
    throw new AppError("Ezzel az e-mail címmel már regisztráltak.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
    },
    select: publicUserSelect,
  });

  return user;
}

async function loginUser({ email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const userWithPassword = await prisma.user.findUnique({
    where: {
      email: normalizedEmail,
    },
  });

  if (!userWithPassword) {
    throw new AppError(
      "Hibás e-mail-cím vagy jelszó.",
      401
    );
  }

  const isPasswordValid = await bcrypt.compare(
    password,
    userWithPassword.passwordHash
  );

  if (!isPasswordValid) {
    throw new AppError(
      "Hibás e-mail-cím vagy jelszó.",
      401
    );
  }

  if (!userWithPassword.isActive) {
    throw new AppError(
      "A felhasználói fiók le van tiltva.",
      403
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      id: userWithPassword.id,
    },
    select: publicUserSelect,
  });

  const accessToken = createAccessToken(user);
  const refreshToken = await createSession(user.id);

  return {
    user,
    accessToken,
    refreshToken,
  };
}

async function refreshUserSession(refreshToken) {
  if (!refreshToken) {
    throw new AppError("Hiányzó refresh token.", 401);
  }

  const tokenHash = hashRefreshToken(refreshToken);

  const session = await prisma.session.findUnique({
    where: {
      tokenHash,
    },
    include: {
      user: {
        select: publicUserSelect,
      },
    },
  });

  if (!session) {
    throw new AppError("Érvénytelen vagy megszűnt munkamenet.", 401);
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    });
    throw new AppError("A munkamenet lejárt.", 401);
  }

  if (!session.user.isActive) {
    throw new AppError("A felhasználói fiók le van tiltva.", 403);
  }

  const newRefreshToken = createRefreshToken();
  const newTokenHash = hashRefreshToken(newRefreshToken);
  const newExpiresAt = getRefreshTokenExpirationDate();

  await prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      tokenHash: newTokenHash,
      expiresAt: newExpiresAt,
    },
  });

  const accessToken = createAccessToken(session.user);

  return {
    user: session.user,
    accessToken,
    refreshToken: newRefreshToken,
  };
}

async function logoutUser(refreshToken) {
  if (!refreshToken) {
    return;
  }

  const tokenHash = hashRefreshToken(refreshToken);

  await prisma.session.deleteMany({
    where: {
      tokenHash,
    },
  });
}

async function findPublicUserById(userId) {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: publicUserSelect,
  });

  return user;
}

module.exports = {
  registerUser,
  loginUser,
  refreshUserSession,
  logoutUser,
  findPublicUserById,
  publicUserSelect,
};