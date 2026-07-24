const authService = require("../services/auth.service");
const asyncHandler = require("../utils/asyncHandler");

const REFRESH_COOKIE_NAME = "joblens_refresh_token";

function getRefreshCookieOptions() {
  const expirationDays = Number(process.env.REFRESH_TOKEN_EXPIRES_DAYS || 7);

  const isProduction = process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge: expirationDays * 24 * 60 * 60 * 1000,
  };
}

function setRefreshCookie(res, refreshToken) {
  res.cookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    getRefreshCookieOptions(),
  );
}

function clearRefreshCookie(res) {
  const options = getRefreshCookieOptions();

  res.clearCookie(REFRESH_COOKIE_NAME, {
    httpOnly: options.httpOnly,
    secure: options.secure,
    sameSite: options.sameSite,
    path: options.path,
  });
}

const register = asyncHandler(async (req, res) => {
  const user = await authService.registerUser(req.body);

  res.status(201).json({
    success: true,
    message: "Sikeres regisztráció.",
    data: {
      user,
    },
  });
});

const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body);

  setRefreshCookie(res, result.refreshToken);

  res.status(200).json({
    success: true,
    message: "Sikeres bejelentkezés.",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

const refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME];

  const result = await authService.refreshUserSession(refreshToken);

  setRefreshCookie(res, result.refreshToken);

  res.status(200).json({
    success: true,
    message: "A munkamenet frissítve.",
    data: {
      user: result.user,
      accessToken: result.accessToken,
    },
  });
});

const logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies[REFRESH_COOKIE_NAME];

  await authService.logoutUser(refreshToken);

  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message: "Sikeres kijelentkezés.",
  });
});

const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user,
    },
  });
});

module.exports = {
  register,
  login,
  refresh,
  logout,
  me,
};