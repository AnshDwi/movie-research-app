const POSITIVE_WORDS = ["amazing", "great", "beautiful", "excellent", "love", "masterpiece", "fun", "smart", "bold", "heart"];
const NEGATIVE_WORDS = ["bad", "boring", "weak", "dull", "mess", "predictable", "flat", "awful", "slow", "waste"];

function heuristicSentiment(text) {
  const normalized = text.toLowerCase();
  const positiveHits = POSITIVE_WORDS.reduce((count, word) => count + (normalized.includes(word) ? 1 : 0), 0);
  const negativeHits = NEGATIVE_WORDS.reduce((count, word) => count + (normalized.includes(word) ? 1 : 0), 0);
  const score = positiveHits - negativeHits;

  if (score >= 2) return { label: "Positive", score: 0.82, pros: ["Strong audience praise", "High emotional resonance"], cons: ["Minor pacing issues"] };
  if (score <= -2) return { label: "Negative", score: 0.72, pros: ["Interesting premise"], cons: ["Weak execution", "Mixed engagement"] };
  return { label: "Mixed", score: 0.56, pros: ["Appeals to a niche audience"], cons: ["Divided critical response"] };
}

export async function analyzeReviewSentiment(reviews, movieTitle) {
  const reviewText = reviews.slice(0, 5).map((item) => item.content).join("\n\n");
  const apiUrl = import.meta.env.VITE_NLP_API_URL;

  if (apiUrl) {
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: reviewText, title: movieTitle })
      });

      if (response.ok) {
        return response.json();
      }
    } catch {
      return heuristicSentiment(reviewText || movieTitle);
    }
  }

  return heuristicSentiment(reviewText || movieTitle);
}
