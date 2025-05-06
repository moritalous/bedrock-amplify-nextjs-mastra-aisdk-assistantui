/**
 * Documentation service for fetching AWS documentation
 */
import { extractContentFromHtml, isHtmlContent, formatDocumentationResult } from '../utils';

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36 ModelContextProtocol/1.0 (AWS Documentation Client)';

/**
 * Fetch and convert an AWS documentation page to markdown format
 *
 * @param url URL of the AWS documentation page to read
 * @param maxLength Maximum number of characters to return
 * @param startIndex On return output starting at this character index
 * @returns Markdown content of the AWS documentation
 */
export async function readDocumentation(
  url: string,
  maxLength: number = 5000,
  startIndex: number = 0
): Promise<string> {
  console.log(
    `[readDocumentation] Starting with url: ${url}, maxLength: ${maxLength}, startIndex: ${startIndex}`
  );

  // Validate that URL is from docs.aws.amazon.com and ends with .html
  if (!url.match(/^https?:\/\/docs\.aws\.amazon\.com\//)) {
    console.error(`[readDocumentation] Invalid URL domain: ${url}`);
    throw new Error('URL must be from the docs.aws.amazon.com domain');
  }

  if (!url.endsWith('.html')) {
    console.error(`[readDocumentation] URL does not end with .html: ${url}`);
    throw new Error('URL must end with .html');
  }

  try {
    console.log(`[readDocumentation] Fetching URL: ${url}`);
    const response = await fetch(url, {
      headers: {
        'User-Agent': DEFAULT_USER_AGENT,
      },
    });

    console.log(`[readDocumentation] Fetch response status: ${response.status}`);

    if (!response.ok) {
      const errorMsg = `Failed to fetch ${url} - status code ${response.status}`;
      console.error(`[readDocumentation] ${errorMsg}`);
      return errorMsg;
    }

    const pageRaw = await response.text();
    console.log(`[readDocumentation] Received raw content length: ${pageRaw.length}`);

    const contentType = response.headers.get('content-type') || '';
    console.log(`[readDocumentation] Content-Type: ${contentType}`);

    let content;
    if (isHtmlContent(pageRaw, contentType)) {
      console.log('[readDocumentation] Processing as HTML content');
      content = extractContentFromHtml(pageRaw);
    } else {
      console.log('[readDocumentation] Processing as raw content');
      content = pageRaw;
    }

    console.log(`[readDocumentation] Processed content length: ${content.length}`);

    const result = formatDocumentationResult(url, content, startIndex, maxLength);
    console.log(`[readDocumentation] Final result length: ${result.length}`);

    return result;
  } catch (e) {
    const errorMsg = `Failed to fetch ${url}: ${e instanceof Error ? e.message : String(e)}`;
    console.error(`[readDocumentation] Error: ${errorMsg}`);
    console.error(
      '[readDocumentation] Error stack:',
      e instanceof Error ? e.stack : 'No stack trace'
    );
    return errorMsg;
  }
}
