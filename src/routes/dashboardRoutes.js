const express =
require("express");

const router =
express.Router();

const authMiddleware =
require(
  "../middlewares/authMiddleware"
);

const {
  getDashboardStats
} =
require(
  "../controllers/dashboardController"
);

router.get(
  "/stats",
  authMiddleware,
  getDashboardStats
);

module.exports =
router;