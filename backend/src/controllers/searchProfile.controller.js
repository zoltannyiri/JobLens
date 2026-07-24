const searchProfileService = require("../services/searchProfile.service");
const asyncHandler = require("../utils/asyncHandler");

const create = asyncHandler(async (req, res) => {
  const profile = await searchProfileService.createSearchProfile(req.user.id, req.body);

  res.status(201).json({
    success: true,
    message: "A keresési profil létrejött.",
    data: {
      profile,
    },
  });
});

const getOwn = asyncHandler(async (req, res) => {
  const profile = await searchProfileService.getSearchProfile(req.user.id);

  res.status(200).json({
    success: true,
    data: {
      profile,
    },
  });
});

const updateOwn = asyncHandler(async (req, res) => {
  const profile = await searchProfileService.updateSearchProfile(req.user.id, req.body);

  res.status(200).json({
    success: true,
    message: "A keresési profil frissült.",
    data: {
      profile,
    },
  });
});

const deleteOwn = asyncHandler(async (req, res) => {
  await searchProfileService.deleteSearchProfile(req.user.id);

  res.status(200).json({
    success: true,
    message: "A keresési profil törölve.",
  });
});

module.exports = {
  create,
  getOwn,
  updateOwn,
  deleteOwn,
};