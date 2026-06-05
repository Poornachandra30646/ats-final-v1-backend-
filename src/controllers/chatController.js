const AtsReport =
  require("../models/AtsReport");

const {
  askATSBot
} = require(
  "../services/chatbotService"
);

const askChatbot =
  async (req, res) => {

    try {

      const {
        message,
        reportId
      } = req.body;

      if (!message) {

        return res.status(400).json({

          success: false,

          message:
            "Message is required"

        });

      }

      let report = null;

      if (reportId) {

        report =
          await AtsReport.findOne({

            _id: reportId,

            userId:
              req.user.id

          });

      }

      const reply =
        await askATSBot(

          message,

          report,

          req.user.name

        );

      return res.status(200).json({

        success: true,

        reply

      });

    } catch (error) {

      console.error(
        "Chatbot Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  };

module.exports = {
  askChatbot
};