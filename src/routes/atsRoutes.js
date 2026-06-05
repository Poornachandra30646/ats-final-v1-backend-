const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require(
    "../middlewares/authMiddleware"
  );

const {

  analyzeResume,

  getReports,

  getSingleReport,

  deleteReport

} =
require(
  "../controllers/atsController"
);

router.post(
  "/analyze",
  authMiddleware,
  analyzeResume
);

router.get(
  "/reports",
  authMiddleware,
  getReports
);

router.get(
  "/report/:id",
  authMiddleware,
  getSingleReport
);

router.delete(
  "/report/:id",
  authMiddleware,
  deleteReport
);

module.exports =
  router;