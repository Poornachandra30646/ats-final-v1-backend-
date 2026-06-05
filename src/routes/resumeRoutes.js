// resumeRoutes.js

const express = require("express");

const router = express.Router();

const upload = require("../config/multer");

const authMiddleware = require("../middlewares/authMiddleware");

const {
  uploadResume,
  getResumeHistory,
  downloadResume,
  deleteResume,
  getResumeById,
  getResumePreview
} = require("../controllers/resumeController");

// Upload Resume
router.post(
  "/upload",
  authMiddleware,
  upload.single("resume"),
  uploadResume
);

// Resume History
router.get(
  "/history",
  authMiddleware,
  getResumeHistory
);

// Resume Preview (inline)
router.get(
  "/preview/:id",
  authMiddleware,
  getResumePreview
);

// Download Resume (attachment)
router.get(
  "/download/:id",
  authMiddleware,
  downloadResume
);

// Get Single Resume
router.get(
  "/:id",
  authMiddleware,
  getResumeById
);

// Delete Resume
router.delete(
  "/:id",
  authMiddleware,
  deleteResume
);

module.exports = router;