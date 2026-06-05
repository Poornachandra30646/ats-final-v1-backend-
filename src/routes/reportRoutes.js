// reportRoutes.js

const express = require("express");
const router = express.Router();
const authMiddleware = require("../middlewares/authMiddleware");

const {
  getMyReports,
  getReportById,
  getScoreHistory,
  deleteReport,
  exportReportPdf
} = require("../controllers/reportController");

// Existing routes
router.get("/", authMiddleware, getMyReports);
router.get("/history", authMiddleware, getScoreHistory);

// New PDF export route (placed before /:id to avoid conflict)
router.get("/export/:id", authMiddleware, exportReportPdf);

router.get("/:id", authMiddleware, getReportById);
router.delete("/:id", authMiddleware, deleteReport);

module.exports = router;