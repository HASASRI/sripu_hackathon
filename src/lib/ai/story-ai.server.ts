import { createOpenAI } from "@ai-sdk/openai";
import { streamText, Output } from "ai";
import { z } from "zod";
import { createLovableAiGatewayRunIdFetch, getLovableAiGatewayRunId } from "./run-id";
import type { Chapter, Story, StoryRequest } from "../story-types";

// Server-only module: the gateway key and prompt never leave the server.

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1";
const MODEL = "openai/gpt-6-astra";

// Strict-schema compatible: every property required, optionals nullable,
// single object root, no defaults.
const checkpointSchema = z.object({
  concept: z.string(),
  question: z.string(),
  options: z.array(z.string()).length(4),
  correctIndex: z.number().int().min(0).max(3),
  // Index of the wrong option that reveals the classic misconception.
  misconceptionIndex: z.number().int().min(0).max(3),
  misconception: z.string(),
  explanation: z.string(),
  reteach: z.string(),
});

const chapterSchema = z.object({
  title: z.string(),
  text: z.string(),
  imagePrompt: z.string(),
  checkpoint: checkpointSchema.nullable(),
});

const storySchema = z.object({
  title: z.string(),
  characterSheet: z.string(),
  chapters: z.array(chapterSchema).min(3).max(5),
});

// Strict reading-level rules per age so young kids get truly simple wording.
function readingLevel(age: number): string {
  if (age <= 6)
    return `READING LEVEL (age 6, beginning reader) — STRICT: every sentence 4-8 words. Only simple present or simple past tense. One idea per sentence. No commas joining clauses, no semicolons, no passive voice, no "which/whom/although/however". Use only very common 1-2 syllable words a 6-year-old says daily (e.g. "big", "wet", "sun", "run"). Explain any topic word with tiny words right away ("Rain falls. It is water."). Questions under 10 words; each option 1-5 words. Paragraphs of 2-3 sentences.`;
  if (age === 7)
    return `READING LEVEL (age 7) — STRICT: sentences 6-10 words. Simple tenses. Only joiners "and", "but", "so", "because". Everyday words; at most one new topic word per chapter, explained simply. No passive voice or complex clauses. Questions under 12 words; options 1-6 words.`;
  if (age === 8)
    return `READING LEVEL (age 8) — sentences 8-12 words, early chapter-book style. Simple cause-and-effect ("so", "because", "when"). Introduce topic words with clear clues in the same sentence. Avoid long multi-clause sentences. Options under 8 words.`;
  if (age === 9)
    return `READING LEVEL (age 9) — sentences 10-14 words with some variety. Introductory clauses okay. Topic vocabulary allowed when explained. Keep grammar clear and friendly.`;
  if (age === 10)
    return `READING LEVEL (age 10) — sentences 10-16 words, varied structure, some figurative language. Proper topic vocabulary with brief explanations.`;
  return `READING LEVEL (age ${age}) — age-appropriate middle-grade vocabulary and varied sentences.`;
}

function buildPrompt(request: StoryRequest): string {
  const chapterCount = request.length === "Short" ? 3 : request.length === "Long" ? 5 : 4;
  const young = request.age <= 7;
  return [
    `Write an interactive learning story for a child age ${request.age}.`,
    `Topic to teach: ${request.topic}. Story world: ${request.world}. Difficulty: ${request.difficulty}.`,
    readingLevel(request.age),
    `The reading level rules apply to ALL text: chapter text, titles, questions, options, explanations, and reteach. Difficulty changes the challenge of the idea, never the hardness of the words.`,
    `Requirements:`,
    `- Exactly ${chapterCount} chapters. All chapters except the finale end with a checkpoint quiz about ONE core concept of the topic; the finale's checkpoint is null.`,
    `- Story first: a vivid adventure in the ${request.world} world where the hero must USE the concept to progress.`,
    young
      ? `- Each chapter's text is 2-3 very short paragraphs separated by blank lines.`
      : `- Each chapter's text is 3-5 short paragraphs separated by blank lines.`,
    `- Each checkpoint: a clear question, exactly 4 options, correctIndex (0-3), a short encouraging explanation of the right answer, and a "reteach" text that re-explains the concept a different, simpler way (shown when the child answers wrong).`,
    `- misconceptionIndex points at the wrong option that reflects the classic misconception about the concept; misconception names that misconception in one sentence for the parent report.`,
    `- characterSheet: one paragraph fixing the exact look of the hero and recurring characters (name, age, hair, skin, clothing colors, distinctive items) so illustrations stay consistent.`,
    `- Each chapter's imagePrompt: one sentence describing the key scene to illustrate, showing the learning concept visually (e.g. a pizza cut into 4 equal slices for fractions; clouds, rain and sun for the water cycle). Name characters, don't redescribe them.`,
    `- Put character dialogue in double quotes inside the text.`,
    `- Keep everything safe, warm, and encouraging for children. No violence, no scary content.`,
  ].join("\n");
}

export async function generateStoryWithAi(
  request: Request,
  input: StoryRequest,
): Promise<Story> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("AI key not configured");

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(request));
  const provider = createOpenAI({
    baseURL: GATEWAY_URL,
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const result = streamText({
    model: provider.responses(MODEL),
    messages: [{ role: "user", content: buildPrompt(input) }],
    abortSignal: request.signal,
    output: Output.object({ schema: storySchema }),
    providerOptions: {
      openai: {
        store: false,
        forceReasoning: true,
        reasoningEffort: "low",
        reasoningSummary: "auto",
        include: ["reasoning.encrypted_content"],
      },
    },
  });

  const generated = await result.output;
  if (!generated) throw new Error("AI returned no story");

  const storyId = `story-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const chapters: Chapter[] = generated.chapters.map((c, i) => ({
    title: c.title,
    text: c.text,
    imagePrompt: c.imagePrompt,
    ...(c.checkpoint
      ? {
          checkpoint: {
            concept: c.checkpoint.concept,
            question: c.checkpoint.question,
            options: c.checkpoint.options.map((text, oi) => ({
              id: `${storyId}-ch${i + 1}-opt${oi + 1}`,
              text,
              isCorrect: oi === c.checkpoint!.correctIndex,
              ...(oi === c.checkpoint!.misconceptionIndex && oi !== c.checkpoint!.correctIndex
                ? { misconception: c.checkpoint!.misconception }
                : {}),
            })),
            explanation: c.checkpoint.explanation,
            reteach: c.checkpoint.reteach,
          },
        }
      : {}),
  }));

  return {
    id: storyId,
    title: generated.title,
    topic: input.topic,
    world: input.world,
    difficulty: input.difficulty,
    age: input.age,
    chapters,
    createdAt: new Date().toISOString(),
    source: "ai",
    characterSheet: generated.characterSheet,
  };
}
