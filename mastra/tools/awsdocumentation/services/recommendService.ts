/**
 * Recommendation service for AWS documentation
 */
import { RecommendationResult } from '../models';
import { parseRecommendationResults } from '../utils';

const RECOMMENDATIONS_API_URL = 'https://contentrecs-api.docs.aws.amazon.com/v1/recommendations';
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 ModelContextProtocol/1.0 (AWS Documentation Client)';

/**
 * Get content recommendations for an AWS documentation page
 *
 * @param url URL of the AWS documentation page to get recommendations for
 * @returns List of recommended pages with URLs, titles, and context
 */
export async function recommend(url: string): Promise<RecommendationResult[]> {
  const recommendationUrl = `${RECOMMENDATIONS_API_URL}?path=${encodeURIComponent(url)}`;

  try {
    const response = await fetch(recommendationUrl, {
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
      },
    });

    if (!response.ok) {
      return [
        {
          url: '',
          title: `Error getting recommendations - status code ${response.status}`,
          context: undefined,
        },
      ];
    }

    const data = await response.json();
    return parseRecommendationResults(data);
  } catch (e) {
    return [
      {
        url: '',
        title: `Error getting recommendations: ${e instanceof Error ? e.message : String(e)}`,
        context: undefined,
      },
    ];
  }
}
