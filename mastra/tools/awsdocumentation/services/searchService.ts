/**
 * Search service for AWS documentation
 */
import { SearchResult } from '../models';

const SEARCH_API_URL = 'https://proxy.search.docs.aws.amazon.com/search';
const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 ModelContextProtocol/1.0 (AWS Documentation Client)';

/**
 * Search AWS documentation using the official AWS Documentation Search API
 *
 * @param searchPhrase Search phrase to use
 * @param limit Maximum number of results to return
 * @returns List of search results with URLs, titles, and context snippets
 */
export async function searchDocumentation(
  searchPhrase: string,
  limit: number = 10
): Promise<SearchResult[]> {
  const requestBody = {
    textQuery: {
      input: searchPhrase,
    },
    contextAttributes: [{ key: 'domain', value: 'docs.aws.amazon.com' }],
    acceptSuggestionBody: 'RawText',
    locales: ['en_us'],
  };

  try {
    const response = await fetch(SEARCH_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': DEFAULT_USER_AGENT,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      return [
        {
          rank_order: 1,
          url: '',
          title: `Error searching AWS docs - status code ${response.status}`,
          context: undefined,
        },
      ];
    }

    const data = await response.json();
    const results: SearchResult[] = [];

    if (data.suggestions) {
      for (let i = 0; i < Math.min(data.suggestions.length, limit); i++) {
        const suggestion = data.suggestions[i];
        if (suggestion.textExcerptSuggestion) {
          const textSuggestion = suggestion.textExcerptSuggestion;
          let context: string | undefined = undefined;

          // Add context if available
          if (textSuggestion.summary) {
            context = textSuggestion.summary;
          } else if (textSuggestion.suggestionBody) {
            context = textSuggestion.suggestionBody;
          }

          results.push({
            rank_order: i + 1,
            url: textSuggestion.link || '',
            title: textSuggestion.title || '',
            context,
          });
        }
      }
    }

    return results;
  } catch (e) {
    return [
      {
        rank_order: 1,
        url: '',
        title: `Error searching AWS docs: ${e instanceof Error ? e.message : String(e)}`,
        context: undefined,
      },
    ];
  }
}
