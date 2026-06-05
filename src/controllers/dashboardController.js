const Resume =
require("../models/Resume");

const AtsReport =
require("../models/AtsReport");

const getDashboardStats =
async (req, res) => {

  try {

    const totalResumes =
      await Resume.countDocuments({
        userId: req.user.id
      });

    const reports =
      await AtsReport.find({
        userId: req.user.id
      });

    const totalReports =
      reports.length;

    let averageScore = 0;

    if (totalReports > 0) {

      const totalScore =
        reports.reduce(
          (sum, report) =>
            sum + report.score,
          0
        );

      averageScore =
        Math.round(
          totalScore /
          totalReports
        );

    }

    const recentReports =
      await AtsReport.find({
        userId: req.user.id
      })
      .sort({
        createdAt: -1
      })
      .limit(5)
      .select(
        "score createdAt resumeId"
      );

    return res.json({
      success: true,
      totalResumes,
      totalReports,
      averageScore,
      recentReports
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
  getDashboardStats
};