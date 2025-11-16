/**
 * Raw credit data from Smogon CMS
 */
export interface RawCredit {
  format_id: string;
  pokemon_id: string;
  language: string;
  credit_type: string;
  set_order: number;
  credit_order: number;
  gen_order: number;
}

/**
 * Parsed contribution data
 */
export interface Contribution {
  id: string;
  creditType: string;
  pokemon: string;
  format: string;
  generation: string;
  language: string;
  url: string;
  setNumber: number;
}

/**
 * Statistics about contributions
 */
export interface ContributionStats {
  written: number;
  qualityChecked: number;
  byFormat: Record<string, number>;
  byGeneration: Record<string, number>;
}

/**
 * Complete contribution data for a user
 */
export interface ContributionData {
  userId: string;
  username: string;
  fetchedAt: string;
  totalContributions: number;
  contributions: Contribution[];
  stats: ContributionStats;
}

/**
 * Scraper options
 */
export interface ScraperOptions {
  sessionCookie: string;
  userAgent?: string;
}
