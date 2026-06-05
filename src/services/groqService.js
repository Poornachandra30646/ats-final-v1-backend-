const Groq =
  require("groq-sdk");

const groq =
  new Groq({
    apiKey:
      process.env.GROQ_API_KEY
  });

const analyzeWithGroq =
  async (
    resumeText,
    jobDescription
  ) => {

    try {

      console.log(
        "Sending Request To Groq..."
      );

      const prompt = `
You are a professional ATS system.

Analyze the resume against the job description.

IMPORTANT:
Return ONLY JSON.
No markdown.
No explanations.

{
  "score": number,
  "atsGrade": "A+|A|B|C|D",
  "summary": "short summary",
  "matchedKeywords": [],
  "missingKeywords": [],
  "strengths": [],
  "weaknesses": [],
  "formattingAnalysis": {
    "headings": true,
    "contactInfo": true,
    "dates": true,
    "fileType": true
  },
  "skillAlignment": [
    {
      "skill": "React",
      "percentage": 95
    }
  ],
  "suggestions": []
}

RESUME:

${resumeText.substring(0, 10000)}

JOB DESCRIPTION:

${jobDescription}
`;

      const completion =
        await groq.chat.completions.create({

          model:
            "llama-3.3-70b-versatile",

          temperature: 0.1,

          max_tokens: 1500,

          messages: [
            {
              role: "system",
              content:
                "Return valid JSON only."
            },
            {
              role: "user",
              content: prompt
            }
          ]

        });

      console.log(
        "Groq Response Received"
      );

      const content =
        completion.choices[0]
        .message.content;

      console.log(
        "RAW GROQ RESPONSE:"
      );

      console.log(content);

      const jsonMatch =
        content.match(
          /\{[\s\S]*\}/
        );

      if (!jsonMatch) {

        throw new Error(
          "Groq did not return JSON"
        );

      }

      const parsed =
        JSON.parse(
          jsonMatch[0]
        );

      return parsed;

    } catch (error) {

      console.error(
        "Groq Service Error:",
        error
      );

      throw error;

    }

  };

module.exports = {
  analyzeWithGroq
};