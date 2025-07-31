// src/utils/calculateTotal/calculateTotal.test.ts
import { describe, expect, it } from "vitest";
import { calculateTotal } from "./calculateTotal"; // Import the function to test
// 'describe' groups related tests for the 'calculateTotal' function
describe("calculateTotal", () => {
  // 'it' defines a specific test case or scenario
  it("should sum numbers separated by newlines", () => {
    const input = "100\n200\n50";
    const expectedOutput = 350;
    // 'expect' makes an assertion: does the actual output match the expected output?
    expect(calculateTotal(input)).toBe(expectedOutput);
  });
  it("should sum numbers separated by commas", () => {
    expect(calculateTotal("100,200,75")).toBe(375);
  });
  it("should handle a single number", () => {
    expect(calculateTotal("500")).toBe(500);
  });
  it("should return 0 for an empty string", () => {
    expect(calculateTotal("")).toBe(0);
  });
  it("should handle mixed delimiters and extra whitespace", () => {
    expect(calculateTotal(" 100 ,200\n 300 ")).toBe(600);
  });
  it("should ignore invalid entries and empty lines", () => {
    expect(calculateTotal("100\n\n200,abc,\n,300")).toBe(600);
  });
  it("should handle floating-point numbers", () => {
    expect(calculateTotal("10.5, 20.25")).toBe(30.75);
  });
  // Example of debugging a potentially incorrect assumption:
  it("should handle numbers mixed with text correctly", () => {
    // parseFloat('12three') actually returns 12, not NaN.
    // parseFloat('abc12') returns NaN.
    // parseFloat('123.45.67') returns 123.45 (stops at second decimal).
    expect(calculateTotal("12three\n45,abc12,123.45.67")).toBe(
      12 + 45 + 123.45
    ); // 180.45
  });
});
