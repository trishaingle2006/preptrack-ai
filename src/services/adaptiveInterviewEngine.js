import { adaptiveInterviewQuestions } from "../data/adaptiveInterviewQuestions";

const levels = ["easy", "medium", "hard"];
const normalize = (value) => value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);

function similarity(first, second) {
  const a = new Set(normalize(first));
  const b = new Set(normalize(second));
  if (!a.size || !b.size) return 0;
  const intersection = [...a].filter((word) => b.has(word)).length;
  const union = new Set([...a, ...b]).size;
  return intersection / union;
}

export function adjustDifficulty(current, direction) {
  const index = levels.indexOf(current);
  if (direction === "increase") return levels[Math.min(index + 1, levels.length - 1)];
  if (direction === "decrease") return levels[Math.max(index - 1, 0)];
  return current;
}

export function evaluateAnswer({ answer, question, previousAnswers = [], skipped = false }) {
  if (skipped || !answer.trim()) return { score: 0, decision: "decrease", repeated: false, feedback: "Question skipped. The next question will reinforce a foundational concept." };
  const repeated = previousAnswers.some((previous) => similarity(previous, answer) >= 0.82);
  if (repeated) return { score: 1, decision: "decrease", repeated: true, feedback: "This answer is very similar to an earlier response. Add details specific to the current question." };

  const lowerAnswer = answer.toLowerCase();
  const keywordHits = question.keywords.filter((keyword) => lowerAnswer.includes(keyword)).length;
  const coverage = question.keywords.length ? keywordHits / question.keywords.length : 0;
  const words = normalize(answer).length;
  const depth = Math.min(words / 70, 1);
  const exampleBonus = /for example|for instance|such as|in my project|because/.test(lowerAnswer) ? 0.1 : 0;
  const score = Math.max(1, Math.min(10, Math.round((coverage * 0.7 + depth * 0.2 + exampleBonus) * 10)));
  const decision = score >= 8 ? "increase" : score <= 4 ? "decrease" : "maintain";
  const feedback = score >= 8
    ? "Strong answer with relevant concepts and useful depth. The interview will become more challenging."
    : score >= 5
      ? "Good foundation. Add a concrete example, trade-off, or implementation detail for a stronger response."
      : `The answer needs more precision. Revisit: ${question.keywords.slice(0, 3).join(", ")}.`;
  return { score, decision, repeated: false, feedback };
}

export function selectNextQuestion({ topic, difficulty, askedIds }) {
  const available = adaptiveInterviewQuestions.filter((question) => question.topic === topic && !askedIds.includes(question.id));
  return available.find((question) => question.difficulty === difficulty)
    ?? available.sort((a, b) => Math.abs(levels.indexOf(a.difficulty) - levels.indexOf(difficulty)) - Math.abs(levels.indexOf(b.difficulty) - levels.indexOf(difficulty)))[0]
    ?? null;
}

export function createReport(responses) {
  const answered = responses.filter((item) => !item.skipped);
  const averageScore = answered.length ? Math.round((answered.reduce((sum, item) => sum + item.score, 0) / answered.length) * 10) / 10 : 0;
  const strengths = responses.filter((item) => item.score >= 8).map((item) => item.concept);
  const improvements = responses.filter((item) => item.score <= 4).map((item) => item.concept);
  return {
    averageScore,
    answered: answered.length,
    skipped: responses.filter((item) => item.skipped).length,
    repeatedAnswers: responses.filter((item) => item.repeated).length,
    startingDifficulty: responses[0]?.difficulty ?? "easy",
    endingDifficulty: responses.at(-1)?.nextDifficulty ?? responses.at(-1)?.difficulty ?? "easy",
    strengths: [...new Set(strengths)],
    improvements: [...new Set(improvements)],
  };
}
