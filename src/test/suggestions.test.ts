import { describe, expect, it } from "vitest";
import { AGE_BANDS, suggestionsForAge } from "../lib/suggestions";

describe("suggestionsForAge", () => {
  it("has three age bands: 6–7, 8–9, 10–12", () => {
    expect(AGE_BANDS).toEqual([
      { min: 6, max: 7 },
      { min: 8, max: 9 },
      { min: 10, max: 12 },
    ]);
  });

  it("gives gentle ideas to a 6 year old", () => {
    expect(suggestionsForAge(6, "math").every((s) => s.difficulty === "Gentle")).toBe(true);
  });

  it("gives adventurous ideas to a 9 year old", () => {
    expect(suggestionsForAge(9, "science").every((s) => s.difficulty === "Adventurous")).toBe(true);
  });

  it("gives spicy ideas to a 12 year old", () => {
    expect(suggestionsForAge(12, "math").every((s) => s.difficulty === "Spicy")).toBe(true);
  });

  it("uses the oldest band for ages outside the range", () => {
    expect(suggestionsForAge(20, "science")).toEqual(suggestionsForAge(10, "science"));
  });

  it("returns three ideas per subject", () => {
    expect(suggestionsForAge(8, "math")).toHaveLength(3);
    expect(suggestionsForAge(8, "science")).toHaveLength(3);
  });
});
