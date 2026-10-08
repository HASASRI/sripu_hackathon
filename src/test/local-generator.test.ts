import { describe, expect, it } from "vitest";
import { buildLocalStory } from "../lib/local-generator";

const base = { age: 9, topic: "  Volcanoes ", world: "Dinosaur Valley" as const, difficulty: "Spicy" as const };

describe("buildLocalStory (offline fallback)", () => {
  it.each([
    ["Short", 3],
    ["Medium", 4],
    ["Long", 5],
  ] as const)("%s stories have %i chapters", (length, count) => {
    expect(buildLocalStory({ ...base, length }).chapters).toHaveLength(count);
  });

  it("trims the topic and uses it in the title", () => {
    const s = buildLocalStory({ ...base, length: "Short" });
    expect(s.topic).toBe("Volcanoes");
    expect(s.title).toBe("The Volcanoes Quest");
  });

  it("gives every chapter but the last a checkpoint with exactly one correct option", () => {
    const s = buildLocalStory({ ...base, length: "Long" });
    s.chapters.slice(0, -1).forEach((c) => {
      expect(c.checkpoint).toBeDefined();
      expect(c.checkpoint!.options.filter((o) => o.isCorrect)).toHaveLength(1);
    });
    expect(s.chapters.at(-1)!.checkpoint).toBeUndefined();
  });

  it("copies the child's age, world and difficulty", () => {
    const s = buildLocalStory({ ...base, length: "Short" });
    expect([s.age, s.world, s.difficulty]).toEqual([9, "Dinosaur Valley", "Spicy"]);
  });

  it("falls back to the Enchanted Forest for an unknown world", () => {
    const s = buildLocalStory({ ...base, world: "Nowhere" as never, length: "Short" });
    expect(s.chapters[0]!.text).toContain("the Enchanted Forest");
  });
});
