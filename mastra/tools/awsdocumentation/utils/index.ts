/**
 * Utility functions for AWS Documentation Client
 */
import TurndownService from 'turndown';
import { RecommendationResult } from '../models';

/**
 * Extract and convert HTML content to Markdown format
 *
 * @param html Raw HTML content to process
 * @returns Simplified markdown version of the content
 */
export function extractContentFromHtml(html: string): string {
  if (!html) {
    return '<e>Empty HTML content</e>';
  }

  try {
    // Use TurndownService to convert HTML to Markdown
    const turndownService = new TurndownService({
      headingStyle: 'atx',
      codeBlockStyle: 'fenced',
    });

    // Define tags to strip - these are elements we don't want in the output
    const tagsToStrip = [
      'script',
      'style',
      'noscript',
      'meta',
      'link',
      'footer',
      'nav',
      'aside',
      'header',
      // AWS documentation specific elements
      'awsdocs-cookie-consent-container',
      'awsdocs-feedback-container',
      'awsdocs-page-header',
      'awsdocs-page-header-container',
      'awsdocs-filter-selector',
      'awsdocs-breadcrumb-container',
      'awsdocs-page-footer',
      'awsdocs-page-footer-container',
      'awsdocs-footer',
      'awsdocs-cookie-banner',
    ];

    // Add rules to remove unwanted elements
    tagsToStrip.forEach(tag => {
      // 型エラー修正: turndownService.removeは文字列を受け付ける
      turndownService.remove(tag as any);
    });

    // For browser environments, use DOMParser
    let mainContent: Document | HTMLElement;

    if (typeof DOMParser !== 'undefined') {
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Try to find the main content area
      const contentSelectors = [
        'main',
        'article',
        '#main-content',
        '.main-content',
        '#content',
        '.content',
        "div[role='main']",
        '#awsdocs-content',
        '.awsui-article',
      ];

      let mainContentElement = null;
      for (const selector of contentSelectors) {
        const content = doc.querySelector(selector);
        if (content) {
          mainContentElement = content;
          break;
        }
      }

      // If no main content found, use the body
      // 型エラー修正: HTMLElementに明示的にキャスト
      mainContent = (mainContentElement || doc.body || doc) as HTMLElement;

      // Remove navigation elements that might be in the main content
      const navSelectors = [
        'noscript',
        '.prev-next',
        '#main-col-footer',
        '.awsdocs-page-utilities',
        '#quick-feedback-yes',
        '#quick-feedback-no',
        '.page-loading-indicator',
        '#tools-panel',
        '.doc-cookie-banner',
        'awsdocs-copyright',
        'awsdocs-thumb-feedback',
      ];

      for (const selector of navSelectors) {
        mainContent.querySelectorAll(selector).forEach(el => el.remove());
      }
    } else {
      // For non-browser environments, just use the raw HTML
      // This is a fallback, but in a real implementation you might want to use a library like jsdom
      mainContent = html as unknown as HTMLElement;
    }

    // Convert to markdown
    // 型エラー修正: 明示的にstring型にキャスト
    const content = turndownService.turndown(mainContent as unknown as string);

    if (!content) {
      return '<e>Page failed to be simplified from HTML</e>';
    }

    return content;
  } catch (e) {
    return `<e>Error converting HTML to Markdown: ${e instanceof Error ? e.message : String(e)}</e>`;
  }
}

/**
 * Determine if content is HTML
 *
 * @param pageRaw Raw page content
 * @param contentType Content-Type header
 * @returns True if content is HTML, False otherwise
 */
export function isHtmlContent(pageRaw: string, contentType: string): boolean {
  return (
    pageRaw.substring(0, 100).includes('<html') || contentType.includes('text/html') || !contentType
  );
}

/**
 * Format documentation result with pagination information
 *
 * @param url Documentation URL
 * @param content Content to format
 * @param startIndex Start index for pagination
 * @param maxLength Maximum content length
 * @returns Formatted documentation result
 */
export function formatDocumentationResult(
  url: string,
  content: string,
  startIndex: number,
  maxLength: number
): string {
  const originalLength = content.length;

  if (startIndex >= originalLength) {
    return `AWS Documentation from ${url}:\n\n<e>No more content available.</e>`;
  }

  // Calculate the end index, ensuring we don't go beyond the content length
  const endIndex = Math.min(startIndex + maxLength, originalLength);
  const truncatedContent = content.substring(startIndex, endIndex);

  if (!truncatedContent) {
    return `AWS Documentation from ${url}:\n\n<e>No more content available.</e>`;
  }

  const actualContentLength = truncatedContent.length;
  const remainingContent = originalLength - (startIndex + actualContentLength);

  let result = `AWS Documentation from ${url}:\n\n${truncatedContent}`;

  // Only add the prompt to continue fetching if there is still remaining content
  if (remainingContent > 0) {
    const nextStart = startIndex + actualContentLength;
    result += `\n\n<e>Content truncated. Call the read_documentation tool with start_index=${nextStart} to get more content.</e>`;
  }

  return result;
}

/**
 * Parse recommendation API response into RecommendationResult objects
 *
 * @param data Raw API response data
 * @returns List of recommendation results
 */
export function parseRecommendationResults(data: Record<string, any>): RecommendationResult[] {
  const results: RecommendationResult[] = [];

  // Process highly rated recommendations
  if (data.highlyRated?.items) {
    for (const item of data.highlyRated.items) {
      // 型エラー修正: nullではなくundefinedを使用
      const context = item.abstract || undefined;

      results.push({
        url: item.url || '',
        title: item.assetTitle || '',
        context,
      });
    }
  }

  // Process journey recommendations (organized by intent)
  if (data.journey?.items) {
    for (const intentGroup of data.journey.items) {
      const intent = intentGroup.intent || '';
      if (intentGroup.urls) {
        for (const urlItem of intentGroup.urls) {
          // Add intent as part of the context
          // 型エラー修正: nullではなくundefinedを使用
          const context = intent ? `Intent: ${intent}` : undefined;

          results.push({
            url: urlItem.url || '',
            title: urlItem.assetTitle || '',
            context,
          });
        }
      }
    }
  }

  // Process new content recommendations
  if (data.new?.items) {
    for (const item of data.new.items) {
      // Add "New content" label to context
      const dateCreated = item.dateCreated || '';
      const context = dateCreated ? `New content added on ${dateCreated}` : 'New content';

      results.push({
        url: item.url || '',
        title: item.assetTitle || '',
        context,
      });
    }
  }

  // Process similar recommendations
  if (data.similar?.items) {
    for (const item of data.similar.items) {
      const context = item.abstract || 'Similar content';

      results.push({
        url: item.url || '',
        title: item.assetTitle || '',
        context,
      });
    }
  }

  return results;
}
