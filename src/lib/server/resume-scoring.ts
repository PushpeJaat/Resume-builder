// Simple resume scoring engine
// In production, use NLP and section parsing for better accuracy

export async function scoreResume(text: string): Promise<{ score: number; feedback: string }> {
  let score = 0;
  let feedback: string[] = [];
  const lower = text.toLowerCase();

  // Section checks
  const hasContact = /email|phone|contact|@/.test(lower);
  const hasEducation = /education|degree|university|college|bachelor|master|phd/.test(lower);
  const hasExperience = /experience|work|internship|employment|project/.test(lower);
  const hasSkills = /skills|technologies|tools|languages/.test(lower);

  if (hasContact) score += 25; else feedback.push("Missing contact info");
  if (hasEducation) score += 20; else feedback.push("Missing education section");
  if (hasExperience) score += 35; else feedback.push("Missing experience section");
  if (hasSkills) score += 20; else feedback.push("Missing skills section");

  // Bonus for action verbs
  const actionVerbs = ["led", "managed", "developed", "created", "improved", "designed", "built", "launched", "achieved", "delivered"];
  const actionCount = actionVerbs.reduce((acc, verb) => acc + (lower.split(verb).length - 1), 0);
  if (actionCount > 2) score += 5;

  // Clamp score
  if (score > 100) score = 100;

  let summary = score >= 80 ? "Excellent resume!" : score >= 60 ? "Good, but could be improved." : "Needs improvement.";
  if (feedback.length) summary += "\n" + feedback.join("; ");

  return { score, feedback: summary };
}
