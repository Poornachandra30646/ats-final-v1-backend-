const express = require("express");

const router = express.Router();

const imageUpload =
  require(
    "../middlewares/imageUpload"
  );

const {

  signup,

  login,

  googleLogin,

  getCurrentUser,

  updateProfile,

  uploadProfileImage,

  forgotPassword,

  resetPassword

} =
require(
  "../controllers/authController"
);

const authMiddleware =
  require("../middlewares/authMiddleware");

router.post("/signup", signup);

router.post("/login", login);

router.post("/google", googleLogin);

router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

router.put(
  "/profile",
  authMiddleware,
  updateProfile
);

router.post(
  "/profile-image",
  authMiddleware,
  imageUpload.single(
    "profileImage"
  ),
  uploadProfileImage
);

router.post(
  "/forgot-password",
  forgotPassword
);

router.post(
  "/reset-password",
  resetPassword
);

module.exports = router;