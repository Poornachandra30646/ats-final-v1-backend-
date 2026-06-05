const User = require("../models/User");
const Resume = require("../models/Resume");
const AtsReport = require("../models/AtsReport");

const getDashboard = async (req, res) => {
  try {

    const totalUsers =
      await User.countDocuments();

    const totalResumes =
      await Resume.countDocuments();

    const totalReports =
      await AtsReport.countDocuments();

    return res.status(200).json({
      success: true,
      totalUsers,
      totalResumes,
      totalReports
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const getAllUsers = async (req, res) => {
  try {

    const users =
      await User.find()
        .select("-password")
        .sort({
          createdAt: -1
        });

    return res.status(200).json({
      success: true,
      count: users.length,
      users
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

const getUserDetails = async (req, res) => {

  try {

    const user =
      await User.findById(
        req.params.id
      ).select("-password");

    if (!user) {

      return res.status(404).json({
        success: false,
        message: "User not found"
      });

    }

    const resumes =
      await Resume.find({
        userId: user._id
      })
      .select(
        "originalFileName version filePath createdAt"
      )
      .sort({
        createdAt: -1
      });

    const reports =
      await AtsReport.find({
        userId: user._id
      }).sort({
        createdAt: -1
      });

    const totalResumes =
      resumes.length;

    const totalReports =
      reports.length;

    const averageScore =
      totalReports > 0

        ? Math.round(
            reports.reduce(
              (sum, report) =>
                sum + report.score,
              0
            ) / totalReports
          )

        : 0;

    return res.status(200).json({

      success: true,

      user,

      resumes,

      reports,

      stats: {

        totalResumes,

        totalReports,

        averageScore

      }

    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }

};

const getAllResumes = async (req, res) => {

  try {

    const resumes =
      await Resume.find()

        .populate(
          "userId",
          "name email"
        )

        .select(
          "originalFileName version filePath createdAt userId"
        )

        .sort({
          createdAt: -1
        });

    return res.status(200).json({

      success: true,

      count: resumes.length,

      resumes

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message: error.message

    });

  }

};

const getAllReports = async (req, res) => {

  try {

    const users =
      await User.find()
        .select(
          "name email role createdAt"
        )
        .sort({
          createdAt: -1
        });

    const reportUsers =
      await Promise.all(

        users.map(
          async (user) => {

            const reports =
              await AtsReport.find({
                userId: user._id
              });

            const totalReports =
              reports.length;

            const averageScore =
              totalReports > 0

                ? Math.round(

                    reports.reduce(
                      (sum, report) =>
                        sum + report.score,
                      0
                    ) / totalReports

                  )

                : 0;

            return {

              _id: user._id,

              name: user.name,

              email: user.email,

              role: user.role,

              totalReports,

              averageScore,

              createdAt:
                user.createdAt

            };

          }
        )

      );

    return res.status(200).json({

      success: true,

      count:
        reportUsers.length,

      users:
        reportUsers

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};

const getReportAnalytics = async (req, res) => {

  try {

    const totalUsers =
      await User.countDocuments();

    const totalResumes =
      await Resume.countDocuments();

    const totalReports =
      await AtsReport.countDocuments();

    const reports =
      await AtsReport.find();

    const resumes =
      await Resume.find();

    const averageScore =
      reports.length > 0

        ? Math.round(
            reports.reduce(
              (sum, report) =>
                sum + report.score,
              0
            ) / reports.length
          )

        : 0;

    const highestScore =
      reports.length > 0
        ? Math.max(
            ...reports.map(
              report => report.score
            )
          )
        : 0;

    const lowestScore =
      reports.length > 0
        ? Math.min(
            ...reports.map(
              report => report.score
            )
          )
        : 0;

    const pdfCount =
      resumes.filter(
        resume =>
          resume.originalFileName
            ?.toLowerCase()
            .endsWith(".pdf")
      ).length;

    const docCount =
      resumes.filter(
        resume =>
          resume.originalFileName
            ?.toLowerCase()
            .endsWith(".doc")
      ).length;

    const docxCount =
      resumes.filter(
        resume =>
          resume.originalFileName
            ?.toLowerCase()
            .endsWith(".docx")
      ).length;

    return res.status(200).json({

      success: true,

      analytics: {

        totalUsers,
        totalResumes,
        totalReports,

        averageScore,

        highestScore,
        lowestScore,

        pdfCount,
        docCount,
        docxCount

      }

    });

  } catch (error) {

    return res.status(500).json({

      success: false,
      message: error.message

    });

  }

};

const getSettings = async (req, res) => {

  try {

    const adminUser =
      await User.findById(
        req.user.id
      ).select(
        "name email role createdAt"
      );

    const admins =
      await User.find({
        role: "ADMIN"
      }).select(
        "name email createdAt"
      );

    const totalUsers =
      await User.countDocuments();

    const totalResumes =
      await Resume.countDocuments();

    const totalReports =
      await AtsReport.countDocuments();

    return res.status(200).json({

      success: true,

      admin: {

        name:
          adminUser?.name || "",

        email:
          adminUser?.email || "",

        role:
          adminUser?.role || ""

      },

      admins,

      system: {

        totalUsers,

        totalResumes,

        totalReports,

        version:
          "V1.0"

      }

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};

const getAnalytics = async (req, res) => {
  try {

    const totalUsers =
      await User.countDocuments();

    const totalResumes =
      await Resume.countDocuments();

    const totalReports =
      await AtsReport.countDocuments();

    const averageScoreData =
      await AtsReport.aggregate([
        {
          $group: {
            _id: null,
            averageScore: {
              $avg: "$score"
            }
          }
        }
      ]);

    const averageScore =
      averageScoreData.length > 0
        ? Number(
            averageScoreData[0]
              .averageScore
              .toFixed(2)
          )
        : 0;

    return res.status(200).json({
      success: true,
      analytics: {
        totalUsers,
        totalResumes,
        totalReports,
        averageScore
      }
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

module.exports = {
  getDashboard,
  getAllUsers,
  getUserDetails,
  getAllResumes,
  getAllReports,
  getAnalytics,
  getReportAnalytics,
  getSettings
};