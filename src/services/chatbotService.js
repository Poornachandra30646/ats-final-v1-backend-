const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_CHATBOT_KEY,
});

const askATSBot = async (message, report, userName) => {
  // Build structured ATS context if report exists
  let atsContext = "";
  if (report) {
    const score = report.score || 0;
    const atsGrade = report.atsGrade || "N/A";
    const matchedKeywords = report.matchedKeywords?.length
      ? report.matchedKeywords.join(", ")
      : "None";
    const missingKeywords = report.missingKeywords?.length
      ? report.missingKeywords.join(", ")
      : "None";
    const strengths = report.strengths?.length
      ? report.strengths.join("; ")
      : "None";
    const weaknesses = report.weaknesses?.length
      ? report.weaknesses.join("; ")
      : "None";
    const suggestions = report.suggestions?.length
      ? report.suggestions.join("; ")
      : "None";
    const skillAlignment = report.skillAlignment?.length
      ? report.skillAlignment
          .map((s) => `${s.skill}: ${s.percentage}%`)
          .join(", ")
      : "None";

    atsContext = `
ATS Context:

Current ATS Score: ${score}%
ATS Grade: ${atsGrade}
Matched Keywords: ${matchedKeywords}
Missing Keywords: ${missingKeywords}
Strengths: ${strengths}
Weaknesses: ${weaknesses}
Suggestions: ${suggestions}
Skill Alignment: ${skillAlignment}
`;
  }

  const prompt = `You are ATS Career Coach, a professional AI assistant specialized in ATS optimization, resume improvement, and career growth.

User: ${userName}
${report ? atsContext : "No ATS report available yet. Act as a general ATS assistant."}

Rules:
1. Personalize answers using the user's name and their ATS data when available.
2. If the user asks "How can I improve?", use missing keywords and suggestions to give actionable advice.
3. If the user asks "Why is my score low?", explain weaknesses and missing keywords.
4. If the user asks for "Interview questions", generate relevant questions based on their matched skills.
5. If the user asks for "Career roadmap", suggest steps using their skills, weaknesses, and the ATS report.
6. If no ATS report exists, give general ATS tips and encourage the user to analyze a resume first.
7. Never answer politics, religion, or completely unrelated topics. Politely redirect: "I specialize in ATS optimization, resumes, and career growth."
8. Keep answers friendly, professional, and under 250 words.

User Question: ${message}`;

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.4,
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  });

  return completion.choices[0].message.content;
};

module.exports = {
  askATSBot,
};