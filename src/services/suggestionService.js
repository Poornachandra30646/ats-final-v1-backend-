const generateSuggestions = (
  missingKeywords
) => {

  const suggestions = [];

  missingKeywords.forEach(
    (keyword) => {

      suggestions.push(
        `Add the keyword '${keyword}' in your resume where relevant`
      );

    }
  );

  return suggestions;
};

module.exports = {
  generateSuggestions
};