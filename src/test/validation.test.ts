import { describe, expect, it } from "vitest";
import { validateStoryRequest } from "../lib/validation";
import { MAX_TOPIC_LENGTH } from "../lib/story-types";

const valid = {
  age: 8,
  topic: "Magnets",
  world: "Robot City" as const,
  difficulty: "Gentle" as const,
  length: "Short" as const,
};

describe("validateStoryRequest – edge cases", () => {
  it("accepts the youngest and oldest ages (6 and 12)", () => {
    expect(validateStoryRequest({ ...valid, age: 6 }).ok).toBe(true);
    expect(validateStoryRequest({ ...valid, age: 12 }).ok).toBe(true);
  });

  it("rejects ages 5 and 13", () => {
    expect(validateStoryRequest({ ...valid, age: 5 }).ok).toBe(false);
    expect(validateStoryRequest({ ...valid, age: 13 }).ok).toBe(false);
  });

  it("rejects non-whole ages", () => {
    expect(validateStoryRequest({ ...valid, age: 8.5 }).ok).toBe(false);
  });

  it("rejects a missing age", () => {
    const { age: _a, ...rest } = valid;
    expect(validateStoryRequest(rest).ok).toBe(false);
  });

  it("rejects a topic of only spaces", () => {
    expect(validateStoryRequest({ ...valid, topic: "   " }).errors).toContain("Please enter a topic.");
  });

  it("accepts a topic of exactly 80 characters and rejects 81", () => {
    expect(validateStoryRequest({ ...valid, topic: "a".repeat(MAX_TOPIC_LENGTH) }).ok).toBe(true);
    expect(validateStoryRequest({ ...valid, topic: "a".repeat(MAX_TOPIC_LENGTH + 1) }).ok).toBe(false);
  });

  it("rejects an unknown world, difficulty and length", () => {
    const r = validateStoryRequest({
      ...valid,
      world: "Mars" as never,
      difficulty: "Hard" as never,
      length: "Huge" as never,
    });
    expect(r.errors).toEqual([
      "Please choose a story world.",
      "Please choose a difficulty.",
      "Please choose a story length.",
    ]);
  });

  it("reports every problem at once for an empty request", () => {
    expect(validateStoryRequest({}).errors).toHaveLength(5);
  });
});
