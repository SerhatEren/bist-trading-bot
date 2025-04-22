import RssParser from 'rss-parser';
import config from '../config';
import logger from '../utils/logger';

// Define the structure of a parsed news item we care about
export interface ParsedNewsItem {
    title: string;
    link?: string;
    pubDate?: string;
    contentSnippet?: string; // Often contains a summary
    fullText: string; // Combined title and snippet/content
}

class NewsService {
    private parser: RssParser;

    constructor() {
        this.parser = new RssParser();
    }

    /**
     * Fetches and parses the news feed.
     * @param maxItems Optional limit for the number of items to return.
     * @returns An array of parsed news items.
     */
    async fetchNews(maxItems?: number): Promise<ParsedNewsItem[]> {
        const feedUrl = config.news.rssUrl;
        logger.info(`Fetching news from RSS feed: ${feedUrl}`);
        try {
            const feed = await this.parser.parseURL(feedUrl);
            if (!feed?.items) {
                logger.warn(`No items found in RSS feed: ${feedUrl}`);
                return [];
            }

            const parsedItems = feed.items
                .map(item => {
                    // Combine title and snippet for analysis
                    const title = item.title || '';
                    // Use contentSnippet first, fallback to content
                    const snippet = item.contentSnippet || item.content || '';
                    const fullText = `${title}. ${snippet}`.trim();

                    // Basic check if item is valid
                    if (!title && !snippet) {
                        return null;
                    }

                    // Return a potential ParsedNewsItem structure
                    const potentialItem: Partial<ParsedNewsItem> & { fullText: string } = {
                        title: title,
                        link: item.link,
                        pubDate: item.pubDate,
                        contentSnippet: snippet,
                        fullText: fullText,
                    };
                    return potentialItem;
                })
                // Filter out nulls first, then assert the type for the remaining items
                .filter(item => item !== null) as ParsedNewsItem[];

            // Apply maxItems limit if provided
            const limitedItems = maxItems ? parsedItems.slice(0, maxItems) : parsedItems;

            logger.info(`Successfully fetched and parsed ${limitedItems.length} news items from ${feedUrl}`);
            return limitedItems;

        } catch (error) {
            logger.error(`Error fetching or parsing RSS feed from ${feedUrl}:`, error);
            return []; // Return empty array on error
        }
    }
}

export default new NewsService(); 