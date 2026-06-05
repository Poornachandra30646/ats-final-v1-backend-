const Resume =
  require("../models/Resume");

const AtsReport =
  require("../models/AtsReport");

const {
  analyzeWithGroq
} = require(
  "../services/groqService"
);

const {
  calculateATSScore
} = require(
  "../services/atsService"
);

const analyzeResume =
  async (req, res) => {

    try {

      const {
        resumeId,
        jobDescription
      } = req.body;

      if (
        !resumeId ||
        !jobDescription
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Resume ID and Job Description are required"
        });

      }

      const resume =
        await Resume.findById(
          resumeId
        );

      if (!resume) {

        return res.status(404).json({
          success: false,
          message:
            "Resume not found"
        });

      }

      if (
        !resume.extractedText
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Resume text not found"
        });

      }

      let result;

      try {

        console.log(
          "Running Groq ATS Analysis..."
        );

        result =
          await analyzeWithGroq(
            resume.extractedText,
            jobDescription
          );

      } catch (groqError) {

        console.error(
          "Groq Failed. Using Fallback ATS Engine.",
          groqError.message
        );

        result =
          calculateATSScore(
            resume.extractedText,
            jobDescription
          );

      }

      const report =
        await AtsReport.create({

          userId:
            req.user.id,

          resumeId,

          score:
            result.score || 0,

          atsGrade:
            result.atsGrade || "N/A",

          summary:
            result.summary || "",

          jobDescription,

          matchedKeywords:
            result.matchedKeywords || [],

          missingKeywords:
            result.missingKeywords || [],

          strengths:
            result.strengths || [],

          weaknesses:
            result.weaknesses || [],

          formattingAnalysis:
            result.formattingAnalysis || {

              headings: false,

              contactInfo: false,

              dates: false,

              fileType: false

            },

          skillAlignment:
            result.skillAlignment || [],

          suggestions:
            result.suggestions || []

        });

      return res.status(200).json({

        success: true,

        report,

        source:
          result.summary?.includes(
            "Fallback"
          )
            ? "fallback"
            : "groq"

      });

    } catch (error) {

      console.error(
        "ATS Analysis Error:",
        error
      );

      return res.status(500).json({

        success: false,

        message:
          error.message ||
          "Analysis Failed"

      });

    }

  };

const getReports =
  async (req, res) => {

    try {

      const reports =
        await AtsReport
          .find({
            userId:
              req.user.id
          })
          .sort({
            createdAt: -1
          });

      return res.status(200).json({

        success: true,

        reports

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  };

const getSingleReport =
  async (req, res) => {

    try {

      const report =
        await AtsReport.findOne({

          _id:
            req.params.id,

          userId:
            req.user.id

        });

      if (!report) {

        return res.status(404).json({

          success: false,

          message:
            "Report not found"

        });

      }

      return res.status(200).json({

        success: true,

        report

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  };

const deleteReport =
  async (req, res) => {

    try {

      const report =
        await AtsReport.findOneAndDelete({

          _id:
            req.params.id,

          userId:
            req.user.id

        });

      if (!report) {

        return res.status(404).json({

          success: false,

          message:
            "Report not found"

        });

      }

      return res.status(200).json({

        success: true,

        message:
          "Report deleted successfully"

      });

    } catch (error) {

      return res.status(500).json({

        success: false,

        message:
          error.message

      });

    }

  };

module.exports = {

  analyzeResume,

  getReports,

  getSingleReport,

  deleteReport

};