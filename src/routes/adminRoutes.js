const express = require("express");

const router = express.Router();

const authMiddleware =
  require("../middlewares/authMiddleware");

const adminMiddleware =
  require("../middlewares/adminMiddleware");

const {
  getDashboard,
  getAllUsers,
  getUserDetails,
  getAllResumes,
  getAllReports,
  getAnalytics,
  getReportAnalytics,
  getSettings
} = require("../controllers/adminController");

router.get(
  "/dashboard",
  authMiddleware,
  adminMiddleware,
  getDashboard
);

router.get(
  "/users",
  authMiddleware,
  adminMiddleware,
  getAllUsers
);

router.get(
  "/user/:id",
  authMiddleware,
  adminMiddleware,
  getUserDetails
);

router.get(
  "/resumes",
  authMiddleware,
  adminMiddleware,
  getAllResumes
);

router.get(
  "/reports",
  authMiddleware,
  adminMiddleware,
  getAllReports
);

router.get(
  "/analytics",
  authMiddleware,
  adminMiddleware,
  getAnalytics
);

router.get(
  "/report-analytics",
  authMiddleware,
  adminMiddleware,
  getReportAnalytics
);

router.get(
  "/settings",
  authMiddleware,
  adminMiddleware,
  getSettings
);

module.exports = router;