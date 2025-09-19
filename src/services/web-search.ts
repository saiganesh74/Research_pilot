import { getJson } from "google-search-results-nodejs";

export async function searchWeb(query: string) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.warn("SERPAPI_KEY is not set. Using mock search results.");
    return [
      {
        title: "Mock Search Result 1",
        link: "https://example.com/result1",
        snippet: `This is a mock search result snippet for the query: ${query}`,
      },
      {
        title: "Mock Search Result 2",
        link: "https://example.com/result2",
        snippet: `Another mock result to show how web search integrates with the research.`,
      },
    ];
  }

  const search = new (await import('google-search-results-nodejs')).GoogleSearch(apiKey);

  return new Promise((resolve, reject) => {
    const callback = function (data: any) {
      if (data.error) {
        return reject(new Error(data.error));
      }
      const results = (data.organic_results || []).map((item: any) => ({
        title: item.title,
        link: item.link,
        snippet: item.snippet,
      }));
      resolve(results.slice(0, 5)); // Return top 5 results
    };

    search.json({ q: query, engine: 'google' }, callback);
  });
}
