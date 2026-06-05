const mongoose = require("mongoose");

const atsReportSchema =
  new mongoose.Schema(
    {
      userId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
      },

      resumeId: {
        type:
          mongoose.Schema.Types.ObjectId,
        ref: "Resume",
        required: true
      },

      score: {
        type: Number,
        default: 0
      },

      atsGrade: {
        type: String,
        default: "N/A"
      },

      summary: {
        type: String,
        default: ""
      },

      jobDescription: {
        type: String,
        default: ""
      },

      matchedKeywords: [
        {
          type: String
        }
      ],

      missingKeywords: [
        {
          type: String
        }
      ],

      strengths: [
        {
          type: String
        }
      ],

      weaknesses: [
        {
          type: String
        }
      ],

      formattingAnalysis: {

        headings: {
          type: Boolean,
          default: false
        },

        contactInfo: {
          type: Boolean,
          default: false
        },

        dates: {
          type: Boolean,
          default: false
        },

        fileType: {
          type: Boolean,
          default: false
        }

      },

      skillAlignment: [
        {
          skill: {
            type: String
          },

          percentage: {
            type: Number,
            default: 0
          }
        }
      ],

      suggestions: [
        {
          type: String
        }
      ]
    },
    {
      timestamps: true
    }
  );

module.exports =
  mongoose.model(
    "AtsReport",
    atsReportSchema
  );