const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const AppError = require("./AppError");

function getAccessTokenSecret() {
  const secret = process.env.JWT_ACCESS_SECRET;

  if (!secret) {
    throw new AppError("JWT_ACCESS_SECRET nincs beállítva.", 500);
  }

  return secret;
}

function createAccessToken(user) {
  return jwt.sign(
    {
      role: user.role,
    },
    getAccessTokenSecret(),
    {
      subject: String(user.id),
      expiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "120m",
      issuer: "joblens-api",
      audience: "joblens-web",
      algorithm: "HS256",
    }
  )
}

function verifyAccessToken(token) {
  return jwt.verify(token, getAccessTokenSecret(), {
    issuer: "joblens-api",
    audience: "joblens-web",
    algorithms: ["HS256"],
  });
}

function createRefreshToken() {
  return crypto.randomBytes(64).toString("hex");
}

function hashRefreshToken(token) {
  return crypto
    .createHash("sha256")
    .update(token)
    .digest("hex");
}

function getRefreshTokenExpirationDate() {
  const expirationDays = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expirationDays);

  return expiresAt;
}

module.exports = {
  createAccessToken,
  verifyAccessToken,
  createRefreshToken,
  hashRefreshToken,
  getRefreshTokenExpirationDate,
};