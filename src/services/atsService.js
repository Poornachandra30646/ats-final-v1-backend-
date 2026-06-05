const calculateATSScore = (
  resumeText,
  jobDescription
) => {

  try {

    const stopWords = [

      "for",
      "with",
      "the",
      "and",
      "or",
      "a",
      "an",
      "in",
      "on",
      "at",
      "to",
      "of",
      "is",
      "are",
      "was",
      "were",
      "be",
      "been",
      "being",
      "from",
      "by",
      "as",
      "that",
      "this",
      "these",
      "those",
      "it",
      "its",
      "their",
      "his",
      "her",
      "our",
      "your",
      "looking",
      "seeking",
      "required",
      "preferred",
      "must",
      "should",
      "will"

    ];

    const resumeWords =
      resumeText
        .toLowerCase()
        .split(/\W+/)
        .filter(
          word =>
            word.length >= 3
        );

    const jdWords =
      jobDescription
        .toLowerCase()
        .split(/\W+/)
        .filter(
          word =>
            word.length >= 3 &&
            !stopWords.includes(
              word
            )
        );

    const uniqueJDWords =
      [
        ...new Set(
          jdWords
        )
      ];

    const uniqueResumeWords =
      [
        ...new Set(
          resumeWords
        )
      ];

    const matchedKeywords =
      [];

    const missingKeywords =
      [];

    uniqueJDWords.forEach(
      (word) => {

        if (
          uniqueResumeWords.includes(
            word
          )
        ) {

          matchedKeywords.push(
            word
          );

        } else {

          missingKeywords.push(
            word
          );

        }

      }
    );

    const score =
      uniqueJDWords.length === 0
        ? 0
        : Math.round(
            (
              matchedKeywords.length /
              uniqueJDWords.length
            ) * 100
          );

    return {

      score,

      atsGrade:
        score >= 90
          ? "A+"
          : score >= 80
          ? "A"
          : score >= 70
          ? "B"
          : score >= 60
          ? "C"
          : "D",

      summary:
        `Fallback ATS analysis based on keyword matching.`,

      matchedKeywords,

      missingKeywords,

      strengths:
        matchedKeywords
          .slice(0, 5)
          .map(
            skill =>
              `Found keyword: ${skill}`
          ),

      weaknesses:
        missingKeywords
          .slice(0, 5)
          .map(
            skill =>
              `Missing keyword: ${skill}`
          ),

      formattingAnalysis: {

        headings: true,

        contactInfo: true,

        dates: true,

        fileType: true

      },

      skillAlignment:

        matchedKeywords
          .slice(0, 8)
          .map(
            keyword => ({

              skill:
                keyword,

              percentage:
                85

            })
          ),

      suggestions:

        missingKeywords
          .slice(0, 5)
          .map(
            keyword =>
              `Add experience related to ${keyword}`
          )

    };

  } catch (error) {

    console.error(
      "Fallback ATS Error:",
      error
    );

    return {

      score: 0,

      atsGrade: "D",

      summary:
        "Analysis failed",

      matchedKeywords: [],

      missingKeywords: [],

      strengths: [],

      weaknesses: [],

      formattingAnalysis: {

        headings: false,

        contactInfo: false,

        dates: false,

        fileType: false

      },

      skillAlignment: [],

      suggestions: []

    };

  }

};

module.exports = {

  calculateATSScore

};