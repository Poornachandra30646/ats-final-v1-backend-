// resumeController.js

const fs = require("fs");
const path = require("path");
const mammoth = require("mammoth");

const Resume = require("../models/Resume");
const { extractText } = require("../services/parserService");

const s3 =
  require("../config/s3");

const {
  PutObjectCommand,
  DeleteObjectCommand
} = require("@aws-sdk/client-s3");

const uploadResume = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Resume file is required"
      });
    }

    const extractedText =
    await extractText(
    req.file.buffer,
    req.file.originalname
  );

    const fileName =

  Date.now() +

  "-" +

  req.file.originalname;

await s3.send(

  new PutObjectCommand({

    Bucket:
      process.env.AWS_BUCKET_NAME,

    Key:
      fileName,

    Body:
      req.file.buffer,

    ContentType:
      req.file.mimetype

  })

);

const fileUrl =

  `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${fileName}`;

const previousResumes =
  await Resume.countDocuments({
    userId: req.user.id
  });

const resume =
  await Resume.create({

    userId:
      req.user.id,

    originalFileName:
      req.file.originalname,

    filePath:
      fileUrl,

    extractedText,

    version:
      previousResumes + 1

  });

    return res.status(201).json({
      success: true,
      message: "Resume uploaded successfully",
      resumeId: resume._id,
      version: resume.version,
      extractedTextLength: extractedText.length
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getResumeHistory = async (req, res) => {
  try {
    const resumes = await Resume.find({
      userId: req.user.id
    }).sort({ version: -1 });

    return res.json({
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

const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found"
      });
    }

    return res.json({
      success: true,
      resume
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getResumePreview = async (req, res) => {
  console.log("Resume Preview Requested");
  console.log("Resume ID:", req.params.id);

  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!resume) {
      return res.status(404).json({
        success: false,
        message: "Resume not found"
      });
    }

    console.log("Stored Path:", resume.filePath);

    const absolutePath = path.resolve(resume.filePath);
    console.log("Absolute Path:", absolutePath);

    const ext = path.extname(resume.originalFileName).toLowerCase();

    // DOCX – convert to HTML with Mammoth
    if (ext === '.docx') {
      try {
        const result = await mammoth.convertToHtml({ path: absolutePath });
        return res.json({
          success: true,
          previewType: "docx",
          html: result.value,
          originalFileName: resume.originalFileName,
          version: resume.version,
          createdAt: resume.createdAt
        });
      } catch (mammothError) {
        console.error("Mammoth conversion error:", mammothError);
        // fallback to extracted text
        return res.json({
          success: true,
          previewType: "document",
          extractedText: resume.extractedText,
          originalFileName: resume.originalFileName
        });
      }
    }

    // DOC – show extracted text
    if (ext === '.doc') {
      return res.json({
        success: true,
        previewType: "document",
        extractedText: resume.extractedText,
        originalFileName: resume.originalFileName
      });
    }

    // PDF – serve file inline
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found on server"
      });
    }

    return res.sendFile(absolutePath, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline; filename="' + resume.originalFileName + '"'
      }
    });
  } catch (error) {
    console.error("Preview Error:", error);
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const downloadResume = async (req, res) => {

  try {

    const resume =
      await Resume.findOne({

        _id:
          req.params.id,

        userId:
          req.user.id

      });

    if (!resume) {

      return res.status(404).json({

        success: false,

        message:
          "Resume not found"

      });

    }

    return res.json({

      success: true,

      downloadUrl:
        resume.filePath

    });

  } catch (error) {

    return res.status(500).json({

      success: false,

      message:
        error.message

    });

  }

};

const deleteResume = async (req, res) => {

  try {

    const resume =
      await Resume.findOne({

        _id:
          req.params.id,

        userId:
          req.user.id

      });

    if (!resume) {

      return res.status(404).json({

        success: false,

        message:
          "Resume not found"

      });

    }

    const fileKey =
      resume.filePath
        .split("/")
        .pop();

    await s3.send(

      new DeleteObjectCommand({

        Bucket:
          process.env.AWS_BUCKET_NAME,

        Key:
          fileKey

      })

    );

    await Resume.findByIdAndDelete(
      resume._id
    );

    return res.json({

      success: true,

      message:
        "Resume deleted successfully"

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
  uploadResume,
  getResumeHistory,
  getResumeById,
  getResumePreview,
  downloadResume,
  deleteResume
};