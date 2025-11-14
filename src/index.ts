import dotenv from "dotenv";
import { writeFileSync } from "fs";
// TODO: improved error handling, documentation, extra functionality
// (include bash script for updating your data?)
dotenv.config();

const SESSION = process.env.SMOGON_SESSION;
const USER_ID = process.env.USER_ID || "641532";

if (!SESSION) {
  console.error("Error: SMOGON_SESSION not found in .env file");
  console.log(
    "Please create a .env file with: SMOGON_SESSION=your_session_value"
  );
  process.exit(1);
}

interface RawCredit {
  format_id: string;
  pokemon_id: string;
  language: string;
  credit_type: string;
  set_order: number;
  credit_order: number;
  gen_order: number;
}

interface Contribution {
  id: string;
  creditType: string;
  pokemon: string;
  format: string;
  generation: string;
  language: string;
  url: string;
  setNumber: number;
}

interface OutputData {
  userId: string;
  username: string;
  fetchedAt: string;
  totalContributions: number;
  contributions: Contribution[];
  stats: {
    written: number;
    qualityChecked: number;
    byFormat: Record<string, number>;
    byGeneration: Record<string, number>;
  };
}

async function fetchCmsUser(userId: string): Promise<string> {
  const url = `https://www.smogon.com/cms/user/${userId}`;

  try {
    const fetch = (await import("node-fetch")).default;

    const res = await fetch(url, {
      headers: {
        Cookie: `smogon_session=${SESSION}`,
        "User-Agent": "SmogonContribScraper/1.0",
      },
    });

    if (res.status === 403) {
      throw new Error(
        "Authentication failed: Access forbidden. Your session may have expired."
      );
    }

    if (res.status === 401) {
      throw new Error(
        "Authentication failed: Unauthorized. Please check your session cookie."
      );
    }

    if (res.status === 404) {
      throw new Error(`User ${userId} not found.`);
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    return await res.text();
  } catch (error) {
    throw new Error(
      `Network error: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

function parseContributions(html: string, userId: string): OutputData {
  // Extract username from the link
  const usernameMatch = html.match(/\/forums\/members\/\d+>([^<]+)<\/a>/);
  const username = usernameMatch ? usernameMatch[1] : `User ${userId}`;

  // Extract the JSON data from react-data attribute
  const reactDataMatch = html.match(/react-data="([^"]+)"/);

  if (!reactDataMatch) {
    throw new Error("Could not find contribution data in HTML");
  }

  // Decode HTML entities
  const jsonString = reactDataMatch[1]
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  const data = JSON.parse(jsonString);
  const rawCredits: RawCredit[] = data.credits || [];

  console.log(`\n✨ Found ${rawCredits.length} total credit entries`);

  // Transform the raw credits into our contribution format
  const contributions: Contribution[] = rawCredits.map((credit, index) => {
    // Extract generation and format from format_id (e.g., "sv/LC")
    const [gen, format] = credit.format_id.split("/");

    // Extract pokemon name from pokemon_id (e.g., "sv/Chinchou")
    const pokemonName = credit.pokemon_id.split("/")[1];

    // Clean up pokemon name for URL (handle forms like "Diglett-Alola")
    const urlPokemonName = pokemonName.toLowerCase().replace(/-/g, "-");

    return {
      id: `${credit.pokemon_id}_${credit.format_id}_${credit.set_order}_${index}`,
      creditType: credit.credit_type,
      pokemon: pokemonName,
      format: format,
      generation: gen,
      language: credit.language,
      url: `https://www.smogon.com/dex/${gen}/pokemon/${urlPokemonName}`,
      setNumber: credit.set_order,
    };
  });

  // Calculate statistics
  const stats = {
    written: contributions.filter((c) => c.creditType === "Written by").length,
    qualityChecked: contributions.filter(
      (c) => c.creditType === "Quality checked by"
    ).length,
    byFormat: {} as Record<string, number>,
    byGeneration: {} as Record<string, number>,
  };

  contributions.forEach((c) => {
    stats.byFormat[c.format] = (stats.byFormat[c.format] || 0) + 1;
    stats.byGeneration[c.generation] =
      (stats.byGeneration[c.generation] || 0) + 1;
  });

  return {
    userId,
    username,
    fetchedAt: new Date().toISOString(),
    totalContributions: contributions.length,
    contributions,
    stats,
  };
}

async function main() {
  console.log("🔍 Smogon Contribution Scraper");
  console.log("═".repeat(50));
  console.log(`Fetching data for user ${USER_ID}...\n`);

  try {
    const html = await fetchCmsUser(USER_ID);
    console.log(`Successfully fetched HTML (${html.length} characters)`);

    const data = parseContributions(html, USER_ID);

    // Save to JSON
    const outputFilename = "contributions.json";
    writeFileSync(outputFilename, JSON.stringify(data, null, 2));

    console.log("Success!");
    console.log("═".repeat(50));
    console.log(`Username: ${data.username}`);
    console.log(`Total Contributions: ${data.totalContributions}`);
    console.log(`\nBreakdown:`);
    console.log(`   Written: ${data.stats.written}`);
    console.log(`   Quality Checked: ${data.stats.qualityChecked}`);

    console.log(`\nBy Format:`);
    Object.entries(data.stats.byFormat)
      .sort(([, a], [, b]) => b - a)
      .forEach(([format, count]) => {
        console.log(`   ${format}: ${count}`);
      });

    console.log(`\n🎮 By Generation:`);
    Object.entries(data.stats.byGeneration)
      .sort(([, a], [, b]) => b - a)
      .forEach(([gen, count]) => {
        console.log(`   ${gen}: ${count}`);
      });

    console.log(`\nData saved to: ${outputFilename}`);

    console.log("\nSample Contributions:");
    data.contributions.slice(0, 3).forEach((c) => {
      console.log(`   • ${c.pokemon} (${c.format}) - ${c.creditType}`);
    });

    console.log("\n Next Steps:");
    console.log("1. Check contributions.json for your full data");
    console.log("2. Use this JSON as you please!");
    console.log("3. Run this script periodically to update your data");
  } catch (error) {
    console.error(
      "\n Error:",
      error instanceof Error ? error.message : String(error)
    );
    process.exit(1);
  }
}

main();
