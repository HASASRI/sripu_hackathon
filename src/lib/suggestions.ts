import type { Difficulty, StoryWorld } from "./story-types";

// Default Science and Math quest ideas, grouped by age band.
export interface QuestSuggestion {
  title: string;
  topic: string;
  blurb: string;
  world: StoryWorld;
  difficulty: Difficulty;
}

export type Subject = "science" | "math";

const BANDS: { min: number; max: number; science: QuestSuggestion[]; math: QuestSuggestion[] }[] = [
  {
    min: 6,
    max: 7,
    science: [
      { title: "The Sink or Float Ship", topic: "Sink or float", blurb: "Find out why some things float and some sink.", world: "Sky Pirates", difficulty: "Gentle" },
      { title: "The Magic Seed", topic: "How plants grow", blurb: "Help a tiny seed grow with sun and rain.", world: "Enchanted Forest", difficulty: "Gentle" },
      { title: "Five Senses Safari", topic: "The five senses", blurb: "See, hear, touch, smell and taste your way through.", world: "Dinosaur Valley", difficulty: "Gentle" },
    ],
    math: [
      { title: "Pirate Gem Counting", topic: "Adding numbers up to 20", blurb: "Count gems to open the treasure chest.", world: "Sky Pirates", difficulty: "Gentle" },
      { title: "Shape Castle", topic: "Basic shapes", blurb: "Find circles, squares and triangles to fix the castle.", world: "Enchanted Forest", difficulty: "Gentle" },
      { title: "Tick-Tock Clock Race", topic: "Telling time to the hour", blurb: "Read the clock to catch the balloon.", world: "Robot City", difficulty: "Gentle" },
    ],
  },
  {
    min: 8,
    max: 9,
    science: [
      { title: "The Water Cycle Run", topic: "The water cycle", blurb: "Ride a raindrop from cloud to river and back.", world: "Coral Reef Kingdom", difficulty: "Adventurous" },
      { title: "Magnet Mountain", topic: "Magnets and poles", blurb: "Use north and south poles to open magic gates.", world: "Robot City", difficulty: "Adventurous" },
      { title: "Fossil Hunt", topic: "How fossils form", blurb: "Dig through rock layers to find dinosaur bones.", world: "Dinosaur Valley", difficulty: "Adventurous" },
    ],
    math: [
      { title: "Pizza Fraction Feast", topic: "Simple fractions", blurb: "Share pizzas in halves, thirds and quarters.", world: "Sky Pirates", difficulty: "Adventurous" },
      { title: "Multiplication Galaxy", topic: "Times tables", blurb: "Power the rocket with times tables.", world: "Space Station", difficulty: "Adventurous" },
      { title: "Fence Builder Island", topic: "Perimeter and area", blurb: "Measure fences to keep the animals safe.", world: "Coral Reef Kingdom", difficulty: "Adventurous" },
    ],
  },
  {
    min: 10,
    max: 12,
    science: [
      { title: "Solar Engine Dome", topic: "Photosynthesis", blurb: "Balance sunlight, water and CO2 to power a bio-dome.", world: "Space Station", difficulty: "Spicy" },
      { title: "Gravity Escape", topic: "Gravity and orbits", blurb: "Use gravity to slingshot around an asteroid.", world: "Space Station", difficulty: "Spicy" },
      { title: "States of Matter Volcano", topic: "Solids, liquids and gases", blurb: "Track molecules as rock melts and steam rises.", world: "Dinosaur Valley", difficulty: "Spicy" },
    ],
    math: [
      { title: "Fraction & Decimal Peaks", topic: "Fractions and decimals", blurb: "Add unlike fractions and convert decimals to climb.", world: "Sky Pirates", difficulty: "Spicy" },
      { title: "Coordinate Grid Vault", topic: "Coordinate grids", blurb: "Plot (x, y) points to crack the vault.", world: "Robot City", difficulty: "Spicy" },
      { title: "Negative Number Depths", topic: "Negative numbers", blurb: "Dive below sea level and track the temperature.", world: "Coral Reef Kingdom", difficulty: "Spicy" },
    ],
  },
];

export function suggestionsForAge(age: number, subject: Subject): QuestSuggestion[] {
  const band = BANDS.find((b) => age >= b.min && age <= b.max) ?? BANDS[BANDS.length - 1]!;
  return band[subject];
}

export const AGE_BANDS = BANDS.map((b) => ({ min: b.min, max: b.max }));
