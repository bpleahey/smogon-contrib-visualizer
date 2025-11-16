#!/usr/bin/env node

import { config } from "dotenv";
import { writeFileSync } from "fs";
import { SmogonScraper } from "./index.js";
import { formatStatsForConsole } from "./parser.js";

// Load .env file from the current working directory
config();

interface CliArgs {
  userId?: string;
  sessionCookie?: string;
  output?: string;
  help?: boolean;
}

function parseArgs(): CliArgs {
  const args: CliArgs = {};
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h") {
      args.help = true;
    } else if (arg === "--user" || arg === "-u") {
      args.userId = argv[++i];
    } else if (arg === "--session" || arg === "-s") {
      args.sessionCookie = argv[++i];
    } else if (arg === "--output" || arg === "-o") {
      args.output = argv[++i];
    }
  }

  return args;
}

function printHelp() {
  console.log(`
Smogon Contribution Scraper

USAGE:
  smogon-scraper --user <USER_ID> [OPTIONS]

OPTIONS:
  --user, -u <ID>        Smogon user ID (required)
  --session, -s <COOKIE> Session cookie (or use SMOGON_SESSION env var)
  --output, -o <FILE>    Output file path (default: contributions.json)
  --help, -h             Show this help message

ENVIRONMENT VARIABLES:
  SMOGON_SESSION         Your Smogon session cookie
  USER_ID                Default user ID to fetch

EXAMPLES:
  # Using environment variables
  export SMOGON_SESSION="your_session_cookie"
  smogon-scraper --user 641532

  # Using command line arguments
  smogon-scraper --user 641532 --session "your_cookie" --output data.json

  # With custom output location
  smogon-scraper --user 641532 --output public/data/contributions.json

For more information, visit: https://github.com/yourusername/smogon-contribution-scraper
`);
}

async function main() {
  const args = parseArgs();

  if (args.help) {
    printHelp();
    process.exit(0);
  }

  const userId = args.userId || process.env.USER_ID;
  const sessionCookie = args.sessionCookie || process.env.SMOGON_SESSION;
  const outputFile = args.output || "contributions.json";

  if (!userId) {
    console.error("Error: User ID is required");
    console.log("   Use --user <ID> or set USER_ID environment variable");
    console.log("   Run with --help for more information");
    process.exit(1);
  }

  if (!sessionCookie) {
    console.error("Error: Session cookie is required");
    console.log(
      "   Use --session <COOKIE> or set SMOGON_SESSION environment variable"
    );
    console.log("   Run with --help for more information");
    process.exit(1);
  }

  console.log(" Smogon Contribution Scraper");
  console.log("═".repeat(50));
  console.log(`Fetching data for user ${userId}...\n`);

  try {
    const scraper = new SmogonScraper(sessionCookie);
    const data = await scraper.fetchContributions(userId);

    // Save to JSON
    writeFileSync(outputFile, JSON.stringify(data, null, 2));

    // Print stats
    console.log(formatStatsForConsole(data));
    console.log(`\n Data saved to: ${outputFile}`);

    console.log("\n Sample Contributions:");
    data.contributions.slice(0, 3).forEach((c) => {
      console.log(`   • ${c.pokemon} (${c.format}) - ${c.creditType}`);
    });

    console.log("\n Next Steps:");
    console.log("1. Check the JSON file for your full data");
    console.log("2. Use this data in your website or application");
    console.log("3. Run this script periodically to keep data updated");
  } catch (error) {
    console.error(
      "\n Error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

main();
