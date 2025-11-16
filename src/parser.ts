import type { RawCredit, Contribution, ContributionData } from "./types";

/**
 * Parse HTML response from Smogon CMS to extract contribution data
 */
export function parseContributions(
  html: string,
  userId: string
): ContributionData {
  // Extract username from the link
  const usernameMatch = html.match(/\/forums\/members\/\d+>([^<]+)<\/a>/);
  const username = usernameMatch ? usernameMatch[1] : `User ${userId}`;

  // Extract the JSON data from react-data attribute
  const reactDataMatch = html.match(/react-data="([^"]+)"/);

  if (!reactDataMatch) {
    throw new Error(
      "Could not find contribution data in HTML. The page structure may have changed."
    );
  }

  // Decode HTML entities
  const jsonString = reactDataMatch[1]
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");

  let data;
  try {
    data = JSON.parse(jsonString);
  } catch (error) {
    throw new Error(`Failed to parse contribution data: ${error}`);
  }

  const rawCredits: RawCredit[] = data.credits || [];

  // Transform the raw credits into our contribution format
  const contributions: Contribution[] = rawCredits.map((credit, index) => {
    // Extract generation and format from format_id (e.g., "sv/LC")
    const [gen, format] = credit.format_id.split("/");

    // Extract pokemon name from pokemon_id (e.g., "sv/Chinchou")
    const pokemonName = credit.pokemon_id.split("/")[1];

    // Clean up pokemon name for URL (handle forms like "Diglett-Alola")
    const urlPokemonName = pokemonName.toLowerCase();

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

/**
 * Format contribution data for console output
 */
export function formatStatsForConsole(data: ContributionData): string {
  const lines = [
    `\n✨ Success!`,
    `═`.repeat(50),
    `Username: ${data.username}`,
    `Total Contributions: ${data.totalContributions}`,
    `\n Breakdown:`,
    `   Written: ${data.stats.written}`,
    `   Quality Checked: ${data.stats.qualityChecked}`,
    `\n By Format:`,
  ];

  Object.entries(data.stats.byFormat)
    .sort(([, a], [, b]) => b - a)
    .forEach(([format, count]) => {
      lines.push(`   ${format}: ${count}`);
    });

  lines.push(`\n By Generation:`);
  Object.entries(data.stats.byGeneration)
    .sort(([, a], [, b]) => b - a)
    .forEach(([gen, count]) => {
      lines.push(`   ${gen}: ${count}`);
    });

  return lines.join("\n");
}
