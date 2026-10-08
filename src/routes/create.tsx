import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import {
  DIFFICULTIES,
  MAX_AGE,
  MAX_TOPIC_LENGTH,
  MIN_AGE,
  STORY_LENGTHS,
  STORY_WORLDS,
  type Difficulty,
  type StoryLength,
  type StoryWorld,
} from "../lib/story-types";
import { validateStoryRequest } from "../lib/validation";
import { buildLocalStory } from "../lib/local-generator";
import { saveStory } from "../lib/story-store";
import { generateStory } from "../lib/story.functions";
import { suggestionsForAge, type Subject } from "../lib/suggestions";

export const Route = createFileRoute("/create")({
  validateSearch: (s: Record<string, unknown>): { age?: number; topic?: string; subject?: Subject } => {
    const age = Number(s["age"]);
    return {
      ...(Number.isInteger(age) && age >= MIN_AGE && age <= MAX_AGE ? { age } : {}),
      ...(typeof s["topic"] === "string" ? { topic: s["topic"].slice(0, MAX_TOPIC_LENGTH) } : {}),
      ...(s["subject"] === "science" || s["subject"] === "math" ? { subject: s["subject"] } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Create a Story — Katha" },
      {
        name: "description",
        content: "Pick an age, a topic, and a world. Katha builds an adaptive learning adventure.",
      },
      { property: "og:title", content: "Create a Story — Katha" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: CreateStory,
});

function OptionPill({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-2 border-ink px-4 py-2.5 font-display text-sm font-bold transition-colors ${
        selected ? "bg-flame text-paper" : "bg-white hover:bg-ink hover:text-paper"
      }`}
    >
      {children}
    </button>
  );
}

function CreateStory() {
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [age, setAge] = useState(search.age ?? 9);
  const [topic, setTopic] = useState(search.topic ?? "");
  const [subject, setSubject] = useState<Subject>(search.subject ?? "science");
  const [world, setWorld] = useState<StoryWorld>("Sky Pirates");
  const [difficulty, setDifficulty] = useState<Difficulty>("Adventurous");
  const [length, setLength] = useState<StoryLength>("Medium");
  const [errors, setErrors] = useState<string[]>([]);
  const [building, setBuilding] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const request = { age, topic, world, difficulty, length };
    const result = validateStoryRequest(request);
    if (!result.ok) {
      setErrors(result.errors);
      return;
    }
    setErrors([]);
    setBuilding(true);
    try {
      // Live AI generation; fall back to the local builder if it fails.
      const story = await generateStory({ data: request });
      saveStory(story);
      navigate({ to: "/story/$storyId", params: { storyId: story.id } });
    } catch {
      const story = buildLocalStory(request);
      saveStory(story);
      navigate({ to: "/story/$storyId", params: { storyId: story.id } });
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <span className="inline-block -rotate-2 bg-ink px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.2em] text-paper">
        Quest builder
      </span>
      <h1 className="mt-4 font-display text-5xl font-extrabold uppercase leading-[0.92]">
        Build tonight's <span className="text-flame">adventure</span>
      </h1>
      <p className="mt-4 max-w-lg text-lg font-medium text-ink/70">
        Four dials, one adventure. The story adapts while your child plays.
      </p>

      <form onSubmit={handleSubmit} className="mt-10 space-y-8">
        <div>
          <label className="font-display text-sm font-bold uppercase tracking-widest">
            Child's age <span className="text-ink/40">({MIN_AGE}–{MAX_AGE})</span>
          </label>
          <div className="mt-3 flex flex-wrap gap-2">
            {Array.from({ length: MAX_AGE - MIN_AGE + 1 }, (_, i) => MIN_AGE + i).map((a) => (
              <OptionPill key={a} selected={age === a} onClick={() => setAge(a)}>
                {a}
              </OptionPill>
            ))}
          </div>
        </div>

        <div className="border-2 border-ink bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="font-display text-sm font-bold uppercase tracking-widest">
              Suggested for age {age}
            </p>
            <div className="flex gap-2">
              {(["science", "math"] as const).map((s) => (
                <OptionPill key={s} selected={subject === s} onClick={() => setSubject(s)}>
                  {s === "science" ? "🔬 Science" : "📐 Math"}
                </OptionPill>
              ))}
            </div>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {suggestionsForAge(age, subject).map((q) => (
              <button
                key={q.title}
                type="button"
                onClick={() => {
                  setTopic(q.topic);
                  setWorld(q.world);
                  setDifficulty(q.difficulty);
                }}
                className={`border-2 border-ink p-3 text-left transition-colors hover:bg-ink hover:text-paper ${
                  topic === q.topic ? "bg-flame/15" : ""
                }`}
              >
                <p className="font-display font-extrabold">{q.title}</p>
                <p className="mt-1 text-xs font-medium opacity-70">{q.blurb}</p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="topic" className="font-display text-sm font-bold uppercase tracking-widest">
            School topic
          </label>
          <input
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            maxLength={MAX_TOPIC_LENGTH}
            placeholder="e.g. Fractions, The Water Cycle, Photosynthesis"
            className="mt-3 w-full border-2 border-ink bg-white px-4 py-3 font-medium outline-none placeholder:text-ink/40 focus:shadow-brutal"
          />
          <p className="mt-1 text-xs font-semibold text-ink/50">
            {topic.length}/{MAX_TOPIC_LENGTH} characters
          </p>
        </div>

        <div>
          <label className="font-display text-sm font-bold uppercase tracking-widest">Story world</label>
          <div className="mt-3 flex flex-wrap gap-2">
            {STORY_WORLDS.map((w) => (
              <OptionPill key={w} selected={world === w} onClick={() => setWorld(w)}>
                {w}
              </OptionPill>
            ))}
          </div>
        </div>

        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <label className="font-display text-sm font-bold uppercase tracking-widest">Difficulty</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {DIFFICULTIES.map((d) => (
                <OptionPill key={d} selected={difficulty === d} onClick={() => setDifficulty(d)}>
                  {d}
                </OptionPill>
              ))}
            </div>
          </div>
          <div>
            <label className="font-display text-sm font-bold uppercase tracking-widest">Length</label>
            <div className="mt-3 flex flex-wrap gap-2">
              {STORY_LENGTHS.map((l) => (
                <OptionPill key={l} selected={length === l} onClick={() => setLength(l)}>
                  {l}
                </OptionPill>
              ))}
            </div>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="border-2 border-flame bg-flame/10 p-4">
            <p className="font-display font-bold text-flame">Hold on, adventurer:</p>
            <ul className="mt-1 list-inside list-disc text-sm font-semibold text-ink/70">
              {errors.map((e) => (
                <li key={e}>{e}</li>
              ))}
            </ul>
          </div>
        )}

        <button
          type="submit"
          disabled={building}
          className="-rotate-1 bg-flame px-8 py-4 font-display text-lg font-bold uppercase tracking-wide text-paper transition-transform hover:rotate-0 hover:scale-[1.03] disabled:opacity-60"
        >
          {building ? "Building your quest…" : "🚀 Start Learning"}
        </button>
      </form>
    </div>
  );
}
