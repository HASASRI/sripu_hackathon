import { afterEach, describe, expect, it, vi } from "vitest";
import { adaptAfterAnswer, computeMastery, engagementMinutes } from "../lib/adaptive";

describe("adaptAfterAnswer", () => {
  it("moves on after a correct answer", () => {
    expect(adaptAfterAnswer(true, "Gravity")).toEqual({ kind: "advance" });
  });

  it("re-teaches the concept after a wrong answer, keeping the misconception", () => {
    expect(adaptAfterAnswer(false, "Gravity", "Heavier falls faster")).toEqual({
      kind: "reteach",
      concept: "Gravity",
      misconception: "Heavier falls faster",
    });
  });

  it("omits the misconception when none is given", () => {
    expect(adaptAfterAnswer(false, "Gravity")).toEqual({ kind: "reteach", concept: "Gravity" });
  });
});

describe("computeMastery", () => {
  it("returns nothing for no answers", () => {
    expect(computeMastery([])).toEqual([]);
  });

  it("scores each concept and sorts best first", () => {
    const result = computeMastery([
      { chapterIndex: 0, concept: "Fractions", correct: false, misconception: "Adds bottoms" },
      { chapterIndex: 1, concept: "Fractions", correct: true },
      { chapterIndex: 2, concept: "Fractions", correct: false, misconception: "Adds bottoms" },
      { chapterIndex: 0, concept: "Shapes", correct: true },
    ]);
    expect(result.map((m) => [m.concept, m.mastery])).toEqual([
      ["Shapes", 100],
      ["Fractions", 33],
    ]);
    expect(result[1]!.misconceptions).toEqual(["Adds bottoms"]);
  });
});

describe("engagementMinutes", () => {
  afterEach(() => vi.useRealTimers());

  it("counts minutes between start and finish", () => {
    expect(
      engagementMinutes({
        storyId: "s",
        answers: [],
        xp: 0,
        startedAt: "2026-01-01T10:00:00Z",
        completedAt: "2026-01-01T10:12:00Z",
      }),
    ).toBe(12);
  });

  it("is at least 1 minute", () => {
    expect(
      engagementMinutes({
        storyId: "s",
        answers: [],
        xp: 0,
        startedAt: "2026-01-01T10:00:00Z",
        completedAt: "2026-01-01T10:00:05Z",
      }),
    ).toBe(1);
  });

  it("uses the current time for unfinished stories", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-01-01T10:30:00Z"));
    expect(
      engagementMinutes({ storyId: "s", answers: [], xp: 0, startedAt: "2026-01-01T10:00:00Z" }),
    ).toBe(30);
  });
});
