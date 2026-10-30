/**
 * DuckDuckGo Search Service for Orbit
 * Provides web search results for time-sensitive and factual queries.
 * Uses DuckDuckGo's Instant Answer API + HTML lite search for richer results.
 */

// Keywords that suggest a query needs real-time / current information
const TIME_SENSITIVE_PATTERNS = [
  /\bwho\s+is\s+(the\s+)?(current|new|present|now)\b/i,
  /\bwho\s+is\s+(the\s+)?(pm|president|ceo|king|queen|richest|tallest|fastest)\b/i,
  /\bwho\s+won\b/i,
  /\bwhat\s+is\s+(the\s+)?(latest|current|today|recent|new)\b/i,
  /\bwhat\s+happened\b/i,
  /\bhow\s+much\s+(is|does|did)\b/i,
  /\b(price|cost|worth|stock|market)\b.*\b(today|now|current|right now)\b/i,
  /\b(today|yesterday|this\s+week|this\s+month|this\s+year|right\s+now|currently|latest|recent|2024|2025|2026|2027)\b/i,
  /\bwhat\s+time\b/i,
  /\bweather\b/i,
  /\bnews\b/i,
  /\bscore\b/i,
  /\belection\b/i,
  /\bwho\s+(is|are|was|were)\b/i,
  /\bpopulation\b/i,
  /\bcapital\s+of\b/i,
  /\brichest\b/i,
  /\bwhen\s+(is|was|did|does|will)\b/i,
  /\bhow\s+old\s+is\b/i,
  /\brelease\s+date\b/i,
  /\blaunch\b/i,
];

/**
 * Check if a user message likely needs real-time web search
 */
export function needsWebSearch(message) {
  if (!message || message.length < 8) return false;
  return TIME_SENSITIVE_PATTERNS.some((pattern) => pattern.test(message));
}

/**
 * Search DuckDuckGo and return summarized results
 * Uses the DuckDuckGo Instant Answer API + HTML lite fallback
 */
export async function searchDuckDuckGo(query) {
  if (!query || !query.trim()) return null;

  const cleanQuery = query.trim().slice(0, 200);
  const results = [];

  // 1. Try DuckDuckGo Instant Answer API first
  try {
    const iaUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(cleanQuery)}&format=json&no_html=1&skip_disambig=1`;
    const iaResponse = await fetch(iaUrl, {
      headers: { 'Accept': 'application/json' },
    });

    if (iaResponse.ok) {
      const data = await iaResponse.json();

      // Abstract / summary answer
      if (data.Abstract && data.Abstract.trim()) {
        results.push({
          title: data.Heading || 'Summary',
          snippet: data.Abstract,
          source: data.AbstractSource || 'DuckDuckGo',
          url: data.AbstractURL || '',
        });
      }

      // Answer box (direct factual answers)
      if (data.Answer && data.Answer.trim()) {
        results.push({
          title: 'Direct Answer',
          snippet: data.Answer,
          source: 'DuckDuckGo',
          url: '',
        });
      }

      // Related topics (top 3)
      if (data.RelatedTopics && data.RelatedTopics.length > 0) {
        const topics = data.RelatedTopics
          .filter((t) => t.Text && t.Text.trim())
          .slice(0, 3);

        for (const topic of topics) {
          results.push({
            title: topic.Text.split(' - ')[0]?.slice(0, 80) || 'Related',
            snippet: topic.Text,
            source: 'DuckDuckGo',
            url: topic.FirstURL || '',
          });
        }
      }
    }
  } catch (err) {
    console.warn('DuckDuckGo Instant Answer API failed:', err);
  }

  // 2. Try DuckDuckGo HTML lite search for richer results
  try {
    const htmlUrl = `https://lite.duckduckgo.com/lite/?q=${encodeURIComponent(cleanQuery)}`;
    const htmlResponse = await fetch(htmlUrl, {
      headers: {
        'Accept': 'text/html',
        'User-Agent': 'OrbitChatbot/1.0',
      },
    });

    if (htmlResponse.ok) {
      const html = await htmlResponse.text();

      // Parse result snippets from the HTML lite page
      const snippetRegex = /<td[^>]*class="result-snippet"[^>]*>([\s\S]*?)<\/td>/gi;
      const linkRegex = /<a[^>]*class="result-link"[^>]*href="([^"]*)"[^>]*>([\s\S]*?)<\/a>/gi;

      const snippets = [];
      let match;

      while ((match = snippetRegex.exec(html)) !== null && snippets.length < 5) {
        const text = match[1]
          .replace(/<[^>]*>/g, '') // Strip HTML tags
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/&#x27;/g, "'")
          .trim();

        if (text && text.length > 20) {
          snippets.push(text);
        }
      }

      const links = [];
      while ((match = linkRegex.exec(html)) !== null && links.length < 5) {
        const url = match[1].trim();
        const title = match[2].replace(/<[^>]*>/g, '').trim();
        if (title && url) {
          links.push({ url, title });
        }
      }

      // Combine snippets with links
      for (let i = 0; i < Math.min(snippets.length, 4); i++) {
        // Avoid duplicating results we already have
        const isDuplicate = results.some(
          (r) => r.snippet && snippets[i] && r.snippet.includes(snippets[i].slice(0, 40))
        );
        if (!isDuplicate) {
          results.push({
            title: links[i]?.title || `Result ${results.length + 1}`,
            snippet: snippets[i],
            source: 'Web',
            url: links[i]?.url || '',
          });
        }
      }
    }
  } catch (err) {
    console.warn('DuckDuckGo HTML lite search failed:', err);
  }

  if (results.length === 0) return null;

  // Format results into a context string for the AI
  const formattedResults = results.slice(0, 5).map((r, i) => {
    let entry = `[${i + 1}] ${r.title}`;
    if (r.snippet) entry += `\n${r.snippet}`;
    if (r.url) entry += `\nSource: ${r.url}`;
    return entry;
  }).join('\n\n');

  return formattedResults;
}

