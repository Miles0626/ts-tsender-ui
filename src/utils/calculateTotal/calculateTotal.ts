// src/utils/calculateTotal/calculateTotal.ts
export function calculateTotal(amounts: string): number {
  // If the input string is empty or null, the total is 0
  if (!amounts) {
    return 0;
  }
  // 1. Split the string by one or more commas or newlines
  const amountArray = amounts
    .split(/[\n,]+/) // Regex: matches one or more newline or comma characters
    // 2. Trim whitespace from each resulting string segment
    .map((amt) => amt.trim())
    // 3. Filter out any empty strings that might result from splitting
    .filter((amt) => amt !== "")
    // 4. Convert each valid string segment to a number using parseFloat
    .map((amt) => parseFloat(amt));
  // 5. Filter out any results that are not valid numbers (NaN)
  // 6. Sum the remaining valid numbers using reduce
  return amountArray
    .filter((num) => !isNaN(num)) // Keep only valid numbers
    .reduce((sum, num) => sum + num, 0); // Sum them, starting from 0
}
