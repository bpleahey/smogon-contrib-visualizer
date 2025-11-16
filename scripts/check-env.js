#!/usr/bin/env node

// Check environment variables
import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config();

console.log("Environment Variable Check\n");
console.log("Current directory:", process.cwd());
console.log("Script location:", __dirname);
console.log("\nEnvironment Variables:");
console.log("─".repeat(50));

const vars = {
  SMOGON_SESSION: process.env.SMOGON_SESSION,
  USER_ID: process.env.USER_ID,
};

let hasIssues = false;

for (const [key, value] of Object.entries(vars)) {
  if (value) {
    // Only show first/last 4 chars for security
    const masked =
      value.length > 8 ? `${value.slice(0, 4)}...${value.slice(-4)}` : "***";
    console.log(`${key}: ${masked} (${value.length} chars)`);
  } else {
    console.log(`${key}: NOT SET`);
    hasIssues = true;
  }
}

console.log("─".repeat(50));

if (hasIssues) {
  console.log("\n sIssues Found!\n");
  console.log(" Make sure you have a .env file in the project root with:");
  console.log("   SMOGON_SESSION=your_session_cookie_here");
  console.log("   USER_ID=641532");
  console.log("\n Create .env file:");
  console.log("   cp .env.example .env");
  console.log("   # Then edit .env with your actual values");
  process.exit(1);
} else {
  console.log("\nAll environment variables are set!");
  console.log(" You can now run: npm run scrape");
}
