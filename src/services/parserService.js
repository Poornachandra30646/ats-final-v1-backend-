const pdf = require("pdf-parse");
const mammoth = require("mammoth");

const extractText = async (
  fileBuffer,
  originalFileName
) => {

  try {

    const extension =
      originalFileName
        .toLowerCase();

    if (
      extension.endsWith(".pdf")
    ) {

      const data =
        await pdf(fileBuffer);

      return data.text.trim();

    }

    if (
      extension.endsWith(".docx")
    ) {

      const result =
        await mammoth.extractRawText({

          buffer:
            fileBuffer

        });

      return result.value.trim();

    }

    throw new Error(
      "Unsupported file format. Only PDF and DOCX are allowed."
    );

  } catch (error) {

    console.error(
      "Text Extraction Error:",
      error.message
    );

    throw error;

  }

};

module.exports = {
  extractText
};