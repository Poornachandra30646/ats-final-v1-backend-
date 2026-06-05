const express =
  require("express");

const router =
  express.Router();

const authMiddleware =
  require(
    "../middlewares/authMiddleware"
  );

const {
  askChatbot
} = require(
  "../controllers/chatController"
);

router.post(
  "/",
  authMiddleware,
  askChatbot
);

module.exports =
  router;