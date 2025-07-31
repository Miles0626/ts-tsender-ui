// vitest.config.mts
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";
export default defineConfig({
  plugins: [
    // Apply vite-tsconfig-paths plugin to handle TS path aliases like @/
    tsconfigPaths(),
  ],
  test: {
    // Set the test environment to jsdom to simulate browser APIs
    environment: "jsdom",
    // Define patterns for files/directories to exclude from testing
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/test/**", // Exclude potential separate E2E test folders
      "**/playwright-report/**",
      "**/test-results/**",
    ],
    deps: {
      // List dependencies that might cause issues if externalized by Vitest
      // Process these directly during tests. Important for libraries like wagmi.
      inline: ["wagmi", "@wagmi/core"],
    },
  },
});
