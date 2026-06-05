// reportController.js

const PDFDocument = require('pdfkit');
const AtsReport = require("../models/AtsReport");
const Resume = require("../models/Resume");

const getMyReports = async (req, res) => {
  try {
    const reports = await AtsReport.find({
      userId: req.user.id
    })
      .sort({
        createdAt: -1
      });

    return res.json({
      success: true,
      count: reports.length,
      reports
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getReportById = async (req, res) => {
  try {
    const report = await AtsReport.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    return res.json({
      success: true,
      report
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const getScoreHistory = async (req, res) => {
  try {
    const reports = await AtsReport.find({
      userId: req.user.id
    })
      .sort({
        createdAt: 1
      });

    const history = [];

    for (const report of reports) {
      const resume = await Resume.findById(
        report.resumeId
      );

      history.push({
        reportId: report._id,
        version: resume?.version || 1,
        score: report.score,
        createdAt: report.createdAt
      });
    }

    return res.json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await AtsReport.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    return res.json({
      success: true,
      message: "Report deleted successfully"
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

const exportReportPdf = async (req, res) => {
  try {
    const report = await AtsReport.findOne({
      _id: req.params.id,
      userId: req.user.id
    });

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Report not found"
      });
    }

    const filename = `ATS_Report_${report._id}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    doc.pipe(res);

    // Colors
    const blue = '#1e40af';
    const darkBlue = '#1e3a8a';
    const green = '#16a34a';
    const red = '#dc2626';
    const white = '#ffffff';
    const lightGray = '#f3f4f6';
    const borderGray = '#d1d5db';
    const textDark = '#374151';

    // Helpers
    const drawRoundedRect = (x, y, w, h, r, color, strokeColor = null) => {
      if (strokeColor) {
        doc.lineWidth(0.5).strokeColor(strokeColor);
        doc.fillColor(color).roundedRect(x, y, w, h, r).fillAndStroke();
      } else {
        doc.fillColor(color).roundedRect(x, y, w, h, r).fill();
      }
    };

    const addSectionTitle = (title, color = darkBlue) => {
      doc.moveDown(1.2);
      doc.fontSize(15).font('Helvetica-Bold').fillColor(color).text(title);
      doc.moveDown(0.2);
      doc.lineWidth(1).strokeColor(color).moveTo(doc.x, doc.y).lineTo(530, doc.y).stroke();
      doc.moveDown(0.6);
    };

    const addChipLine = (items, chipColor) => {
      if (!items || items.length === 0) {
        doc.fontSize(11).font('Helvetica').fillColor(textDark).text('None');
        return;
      }
      // Simple chips: [keyword] separated by spaces
      const line = items.map(k => `[${k}]`).join('  ');
      doc.fontSize(11).font('Helvetica').fillColor(chipColor).text(line, { lineGap: 5 });
    };

    // ---------- PAGE 1 ----------

    // HEADER BANNER
    drawRoundedRect(50, 50, 495, 90, 10, blue);
    doc.fillColor(white).fontSize(24).font('Helvetica-Bold').text('ATS BUILDER', 50, 60, { align: 'center', width: 495 });
    doc.fontSize(13).font('Helvetica').text('Professional ATS Analysis Report', 50, 90, { align: 'center', width: 495 });
    doc.fontSize(10).text(
      `Generated: ${new Date(report.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      50, 115, { align: 'center', width: 495 }
    );

    doc.moveDown(6);

    // LARGE SCORE CARD
    const scoreCardY = doc.y;
    drawRoundedRect(50, scoreCardY, 495, 100, 12, '#eff6ff', '#bfdbfe');
    doc.fillColor(darkBlue).fontSize(50).font('Helvetica-Bold').text(
      `${report.score}%`, 50, scoreCardY + 15, { align: 'center', width: 495 }
    );
    doc.fontSize(20).font('Helvetica-Bold').text(
      `Grade ${report.atsGrade || 'N/A'}`, 50, scoreCardY + 70, { align: 'center', width: 495 }
    );
    doc.y = scoreCardY + 110;
    doc.moveDown(1);

    // OVERALL RESULT (one sentence)
    let resultText = 'Needs Improvement';
    if (report.score >= 85) resultText = 'Excellent ATS Compatibility';
    else if (report.score >= 70) resultText = 'Good ATS Compatibility';
    doc.fontSize(14).font('Helvetica-Bold').fillColor(darkBlue).text('Overall Result');
    doc.fontSize(12).font('Helvetica').fillColor(textDark).text(resultText);
    doc.moveDown(1);

    // TOP STRENGTHS (up to 3)
    const strengths = report.strengths || [];
    const topStrengths = strengths.slice(0, 3);
    addSectionTitle('Top Strengths', green);
    if (topStrengths.length > 0) {
      topStrengths.forEach(s => {
        doc.fontSize(11).font('Helvetica').fillColor(green).text(`✓ ${s}`, { lineGap: 4 });
      });
    } else {
      doc.fontSize(11).fillColor(textDark).text('None identified');
    }
    doc.moveDown(0.5);

    // TOP ISSUES (weaknesses + missing keywords, up to 3)
    const weaknesses = report.weaknesses || [];
    const missing = report.missingKeywords || [];
    const allIssues = [...weaknesses, ...missing.map(k => `Missing: ${k}`)];
    const topIssues = allIssues.slice(0, 3);
    addSectionTitle('Top Issues', red);
    if (topIssues.length > 0) {
      topIssues.forEach(issue => {
        doc.fontSize(11).font('Helvetica').fillColor(red).text(`✗ ${issue}`, { lineGap: 4 });
      });
    } else {
      doc.fontSize(11).fillColor(textDark).text('No critical issues');
    }
    doc.moveDown(0.5);

    // IMPROVEMENT POTENTIAL
    const currentScore = report.score;
    const potentialLow = Math.min(currentScore + 4, 100);
    const potentialHigh = Math.min(currentScore + 8, 100);
    addSectionTitle('Improvement Potential', darkBlue);
    doc.fontSize(12).font('Helvetica').fillColor(textDark).text(`Current Score: ${currentScore}%`);
    doc.fontSize(12).text(`Potential Score: ${potentialLow}-${potentialHigh}%`);

    // Page break
    doc.addPage();

    // ---------- PAGE 2 ----------

    // ACTION PLAN (suggestions as priorities)
    const suggestions = report.suggestions || [];
    addSectionTitle('Action Plan', darkBlue);
    if (suggestions.length > 0) {
      suggestions.forEach((suggestion, idx) => {
        doc.fontSize(12).font('Helvetica-Bold').fillColor(darkBlue).text(`Priority ${idx + 1}`);
        doc.fontSize(11).font('Helvetica').fillColor(textDark).text(suggestion, { indent: 10, lineGap: 3 });
        doc.moveDown(0.3);
      });
    } else {
      doc.fontSize(11).fillColor(textDark).text('No action items suggested.');
    }

    // MATCHED KEYWORDS
    addSectionTitle('Matched Keywords', green);
    addChipLine(report.matchedKeywords, green);

    // MISSING KEYWORDS
    addSectionTitle('Missing Keywords', red);
    addChipLine(report.missingKeywords, red);

    // SKILL ALIGNMENT
    if (report.skillAlignment && report.skillAlignment.length > 0) {
      addSectionTitle('Skill Alignment', darkBlue);
      report.skillAlignment.forEach(skill => {
        const name = skill.skill || 'Skill';
        const pct = skill.percentage || 0;
        doc.fontSize(11).font('Helvetica').fillColor(textDark).text(`${name}  ${pct}%`, { lineGap: 5 });
      });
    } else {
      addSectionTitle('Skill Alignment', darkBlue);
      doc.fontSize(11).fillColor(textDark).text('No skill data available.');
    }

    // FORMATTING ANALYSIS
    addSectionTitle('Formatting Analysis', darkBlue);
    const formatting = report.formattingAnalysis;
    if (formatting) {
      const formatItems = [
        { label: 'Headers', pass: formatting.headings },
        { label: 'Contact Info', pass: formatting.contactInfo },
        { label: 'Dates', pass: formatting.dates },
        { label: 'File Type', pass: formatting.fileType }
      ];
      formatItems.forEach(item => {
        const status = item.pass ? 'PASS' : 'FAIL';
        const color = item.pass ? green : red;
        doc.fontSize(11).font('Helvetica-Bold').fillColor(textDark).text(`${item.label}: `, { continued: true });
        doc.font('Helvetica-Bold').fillColor(color).text(status);
      });
    } else {
      doc.fontSize(11).fillColor(textDark).text('Not available');
    }

    // Footer
    doc.moveDown(3);
    doc.lineWidth(1).strokeColor(borderGray).moveTo(50, doc.y).lineTo(545, doc.y).stroke();
    doc.moveDown(0.5);
    doc.fontSize(10).font('Helvetica').fillColor('#6b7280').text('ATS Builder', 50, doc.y, { align: 'center', width: 495 });
    doc.text('Generated Automatically', { align: 'center', width: 495 });

    doc.end();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getMyReports,
  getReportById,
  getScoreHistory,
  deleteReport,
  exportReportPdf
};