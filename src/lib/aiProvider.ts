import type { AIQuestion, AIQuestionRequest } from "@/types";
import { generateId } from "@/lib/utils";

export interface AIQuestionProvider {
  generateQuestions(req: AIQuestionRequest): Promise<AIQuestion[]>;
}

// Simple deterministic hash to seed mock generation
function strHash(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h;
}

// MockProvider: safe offline fallback that creates syllabus-aware questions
export class MockProvider implements AIQuestionProvider {
  async generateQuestions(req: AIQuestionRequest) {
    const count = req.count ?? 5;
    const base = `${req.university}|${req.branch}|${req.semester}|${req.subject}|${req.unit}|${req.topic}|${req.difficulty}|${req.questionType}`;
    const seed = strHash(base);
    const out: AIQuestion[] = [];
    for (let i = 0; i < count; i++) {
      const id = generateId();
      const qtext = `${req.topic}: Explain the main idea (${i + 1})`;
      const correct = `Core concept of ${req.topic}`;
      const opts = [correct, `Common misconception about ${req.topic}`, `Related concept`, `Unrelated option`];
      // deterministic shuffle
      const rnd = (n: number) => ((seed + i * 9973) % (n)) / n;
      const options = opts.sort((a, b) => (rnd(100) - 0.5));
      out.push({
        id,
        question: qtext,
        options,
        correctAnswer: correct,
        explanation: `Key idea: ${correct}. This is a demo-generated explanation.`,
        difficulty: req.difficulty ?? "Medium",
        subject: req.subject,
        unit: req.unit,
        topic: req.topic,
        questionType: req.questionType ?? "MCQ",
        bloom: "Understand",
      });
    }
    return out;
  }
}

// GeminiProvider stub — not implemented without server-side key
export class GeminiProvider implements AIQuestionProvider {
  constructor(private apiKey?: string) {}
  async generateQuestions(_req: AIQuestionRequest) {
    throw new Error("GeminiProvider not configured in frontend. Provide server-side implementation with GEMINI_API_KEY.");
  }
}

// Factory chooses provider based on environment — default to MockProvider
export function createAIProvider(): AIQuestionProvider {
  // Do NOT read any secret key here. Use server-side when available.
  return new MockProvider();
}
