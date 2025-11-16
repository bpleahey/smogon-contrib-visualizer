// Basic usage example for Smogon Contribution Scraper
import { config } from "dotenv";
import { SmogonScraper } from "../dist/index.js";
import { writeFileSync } from "fs";

config();

async function main() {
  // Get credentials from environment variables
  const sessionCookie = process.env.SMOGON_SESSION;
  const userId = process.env.USER_ID || "641532";

  if (!sessionCookie) {
    console.error("Please set SMOGON_SESSION environment variable");
    process.exit(1);
  }

  // Create scraper instance
  const scraper = new SmogonScraper(sessionCookie);

  // Fetch contributions
  console.log(`Fetching contributions for user ${userId}...`);
  const data = await scraper.fetchContributions(userId);

  // Display summary
  console.log(`\nUser: ${data.username}`);
  console.log(`Total contributions: ${data.totalContributions}`);
  console.log(`Written: ${data.stats.written}`);
  console.log(`Quality checked: ${data.stats.qualityChecked}`);

  // Save to JSON file
  const outputFile = "contributions.json";
  writeFileSync(outputFile, JSON.stringify(data, null, 2));
  console.log(`\n Saved to ${outputFile}`);

  // Example: Filter only written contributions
  const writtenContributions = data.contributions.filter(
    (c) => c.creditType === "Written by"
  );
  console.log(`\nYou've written ${writtenContributions.length} analyses:`);
  writtenContributions.slice(0, 5).forEach((c) => {
    console.log(`  - ${c.pokemon} (${c.generation}/${c.format})`);
  });
}

main().catch(console.error);
