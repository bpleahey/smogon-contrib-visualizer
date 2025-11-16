import { parseContributions } from "./parser.js";
import type { ContributionData, ScraperOptions } from "./types.js";

/**
 * Smogon Contribution Scraper
 * Fetches and parses contribution data from Smogon CMS
 */
export class SmogonScraper {
  private sessionCookie: string;
  private userAgent: string;

  constructor(options: ScraperOptions | string) {
    if (typeof options === "string") {
      this.sessionCookie = options;
      this.userAgent = "SmogonContributionScraper/1.0";
    } else {
      this.sessionCookie = options.sessionCookie;
      this.userAgent = options.userAgent || "SmogonContributionScraper/1.0";
    }

    if (!this.sessionCookie) {
      throw new Error("Session cookie is required");
    }
  }

  /**
   * Fetch contribution data for a specific user
   * @param userId - Smogon user ID
   * @returns Parsed contribution data
   */
  async fetchContributions(userId: string | number): Promise<ContributionData> {
    const userIdStr = String(userId);
    const html = await this.fetchCmsPage(userIdStr);
    return parseContributions(html, userIdStr);
  }

  /**
   * Fetch the raw HTML from Smogon CMS
   * @private
   */
  private async fetchCmsPage(userId: string): Promise<string> {
    const url = `https://www.smogon.com/cms/user/${userId}`;

    try {
      const fetch = (await import("node-fetch")).default;

      const res = await fetch(url, {
        headers: {
          Cookie: `smogon_session=${this.sessionCookie}`,
          "User-Agent": this.userAgent,
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
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(`Network error: ${String(error)}`);
    }
  }
}

// Export types and utilities
export { parseContributions, formatStatsForConsole } from "./parser.js";
export type {
  Contribution,
  ContributionData,
  ContributionStats,
  ScraperOptions,
  RawCredit,
} from "./types.js";
