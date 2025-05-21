// src/db/prisma-client.ts (or where you centralize your Prisma client instance)
import {
  PrismaClient,
  PrismaClient as RegularPrismaClient,
} from "@cashflow/database"; // Adjust path
import { LEVEL_THRESHOLDS, calculateLevel } from "@/config/leveling.config";
import { XpService as ActualXpService } from "../services/xp.service"; // Import the service
import type { Enhanced } from "@zenstackhq/runtime";
import { enhance } from "@zenstackhq/runtime";

const regularPrismaInstance = new RegularPrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["query", "info", "warn", "error"]
      : ["error"],
});

// Instantiate your service(s)
export const xpService = new ActualXpService(regularPrismaInstance);
const prisma = new PrismaClient();

// This is your main ZenStack-enhanced Prisma client instance used throughout the app
export const db: Enhanced = enhance(regularPrismaInstance, {
  policy: "REJECT",
  getUser: async () => getUserContext(), // Important for policy enforcement
  logPrismaQuery: process.env.NODE_ENV === "development",
}).$extends({
  result: {
    user: {
      // Calculated field for XP needed to reach the next level
      xpForNextLevel: {
        needs: { totalXp: true, currentLevel: true },
        compute(user: any) {
          const currentLevel = user.currentLevel || 1;
          const nextLevelInfo = LEVEL_THRESHOLDS.find(
            (lt) => lt.level === currentLevel + 1
          );
          if (!nextLevelInfo) {
            return null; // Max level or no next level defined
          }
          return Math.max(0, nextLevelInfo.xpRequired - (user.totalXp || 0));
        },
      },
      // Calculated field for current level's progress percentage
      currentLevelProgressPercent: {
        needs: { totalXp: true, currentLevel: true },
        compute(user: any) {
          const currentLevel = user.currentLevel || 1;
          const currentLevelInfo = LEVEL_THRESHOLDS.find(
            (lt) => lt.level === currentLevel
          );
          const nextLevelInfo = LEVEL_THRESHOLDS.find(
            (lt) => lt.level === currentLevel + 1
          );

          if (!currentLevelInfo) return 0; // Should not happen if levels start at 0 XP

          const xpInCurrentLevel =
            (user.totalXp || 0) - currentLevelInfo.xpRequired;

          if (!nextLevelInfo) return 100; // Max level, 100% progress (or handle differently)

          const xpForThisLevelRange =
            nextLevelInfo.xpRequired - currentLevelInfo.xpRequired;
          if (xpForThisLevelRange <= 0) return 100; // Avoid division by zero if levels are misconfigured

          const progress = (xpInCurrentLevel / xpForThisLevelRange) * 100;
          return Math.min(100, Math.max(0, parseFloat(progress.toFixed(2))));
        },
      },
      currentLevelTitle: {
        needs: { currentLevel: true },
        compute(user: any) {
          const levelInfo = LEVEL_THRESHOLDS.find(
            (lt) => lt.level === (user.currentLevel || 1)
          );
          return levelInfo?.title || "Unknown Rank";
        },
      },
    },
  },
});

function getUserContext(c) {
  return c.get("user");

}
// Now, when you fetch a user with `db.user.findUnique(...)`,
// you can access `user.xpForNextLevel` and `user.currentLevelProgressPercent`
npx cursor-directory rules add gatsby-development-best-practices

You are an expert in TypeScript, Gatsby, React and Tailwind.

Code Style and Structure

Write concise, technical TypeScript code.
// - Use functional and declarative programming patterns; avoid classes.
 Prefer iteration and modularization over code duplication.
 Use descriptive variable names with auxiliary verbs (e.g., isLoaded, hasError).


 Favor named exports for components and utilities.


Use TypeScript for all code; prefer interfaces over types.
 Avoid enums; use objects or maps instead.
Avoid using `any` or `unknown` unless absolutely necessary. Look for type definitions in the codebase instead.
 Avoid type assertions with `as` or `!`.

Syntax and Formatting

 Use the "function" keyword for pure functions.
 Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.


 Use Tailwind for utility-based styling
 Use a mobile-first approach


    You are an expert in TypeScript, Node.js, Vite, Vue.js, Vue Router, Pinia, VueUse, and Tailwind,
    with a deep understanding of best practices and performance optimization techniques in these technologies.

    Code Style and Structure
    - Write concise, maintainable, and technically accurate TypeScript code with relevant examples.
    - Use functional and declarative programming patterns; avoid classes.
    - Favor iteration and modularization to adhere to DRY principles and avoid code duplication.
    - Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
    - Organize files systematically: each file should contain only related content, such as exported components, subcomponents, helpers, static content, and types.

    Naming Conventions
    - Use lowercase with dashes for directories (e.g., components/auth-wizard).
    - Favor named exports for functions.

    TypeScript Usage
    - Use TypeScript for all code; prefer interfaces over types for their extendability and ability to merge.
    - Avoid enums; use maps instead for better type safety and flexibility.
    - Use functional components with TypeScript interfaces.

    Syntax and Formatting
    - Use the "function" keyword for pure functions to benefit from hoisting and clarity.
    - Always use the Vue Composition API script setup style.

    UI and Styling
    - Use Tailwind for components and styling.
    - Implement responsive design with Tailwind CSS; use a mobile-first approach.

    Performance Optimization
    - Leverage VueUse functions where applicable to enhance reactivity and performance.
    - Wrap asynchronous components in Suspense with a fallback UI.
    - Use dynamic loading for non-critical components.
    - Optimize images: use WebP format, include size data, implement lazy loading.
    - Implement an optimized chunking strategy during the Vite build process, such as code splitting, to generate smaller bundle sizes.

