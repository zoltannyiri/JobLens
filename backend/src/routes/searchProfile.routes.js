const express = require("express");
const authenticate = require("../middlewares/auth.middleware");
const validate = require("../middlewares/validate.middleware");
const searchProfileController = require("../controllers/searchProfile.controller");
const { createSearchProfileSchema, updateSearchProfileSchema } = require("../schemas/searchProfile.schema");

const router = express.Router();

router.use(authenticate);

router.post("/", validate(createSearchProfileSchema), searchProfileController.create);
router.get("/", searchProfileController.getOwn);
router.patch("/", validate(updateSearchProfileSchema), searchProfileController.updateOwn);
router.delete("/", searchProfileController.deleteOwn);

module.exports = router;