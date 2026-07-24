const AppError = require("../utils/appError");
const asyncHandler = require("../utils/asyncHandler");
const authService = require("../services/auth.service");
const { verifyAccessToken } = require("../utils/tokens");

const authenticate = asyncHandler(async (req, res, next) => {
  const authorization = req.headers.authorization;

  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new AppError("Bejelentkezés szükséges.", 401);
  }

  const accessToken = authorization.slice(7).trim();

  if (!accessToken) {
    throw new AppError("Hiányzó access token.", 401);
  }

  let payload;

  try {
    payload = verifyAccessToken(accessToken);
  } catch (error) {
    throw new AppError("Érvénytelen vagy lejárt access token.", 401);
  }

  const userId = Number(payload.sub);

  if (!Number.isInteger(userId) || userId <= 0) {
    throw new AppError("Érvénytelen access token.", 401);
  }

  const user = await authService.findPublicUserById(userId);

  if (!user || !user.isActive) {
    throw new AppError("A felhasználói fiók nem található vagy le van tiltva.", 401);
  }

  req.user = user;
  next();
});

module.exports = authenticate;