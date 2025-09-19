// This is a mock service to simulate fetching new content from external sources.
// In a real-world scenario, this would connect to RSS feeds, APIs, or scrape web pages.

export async function fetchUpdatedContent(
  researchQuestion: string,
  sourceUrls: string[]
): Promise<string> {
  console.log(
    `Fetching updated content for question: "${researchQuestion}" from sources: ${sourceUrls.join(
      ', '
    )}`
  );

  // Simulate a network delay
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Return mock content that might be relevant to the user's question.
  // This simulates finding new articles or blog posts.
  const mockResponses = [
    `A new study published on ${new Date().toLocaleDateString()} provides groundbreaking insights into topics related to "${researchQuestion}". The findings challenge previous assumptions.`,
    `Recent developments in the field show an emerging trend that directly impacts the conclusions of your research on "${researchQuestion}".`,
    `An expert opinion piece was just released, offering a fresh perspective that was not available when the initial sources (${sourceUrls.join(
      ', '
    )}) were analyzed.`,
  ];

  // Return a random mock response to simulate variability in fetched content.
  const randomIndex = Math.floor(Math.random() * mockResponses.length);
  return Promise.resolve(mockResponses[randomIndex]);
}
