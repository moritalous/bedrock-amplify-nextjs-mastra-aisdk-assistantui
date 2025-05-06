/**
 * Data models for AWS Documentation Client
 */

/**
 * Search result from AWS documentation search
 */
export interface SearchResult {
  rank_order: number;
  url: string;
  title: string;
  context?: string;
}

/**
 * Recommendation result from AWS documentation
 */
export interface RecommendationResult {
  url: string;
  title: string;
  context?: string;
}
