import { RawItem } from "../../src/types";

const AI_KEYWORDS = [
  "ai",
  "llm",
  "gpt",
  "claude",
  "deepseek",
  "openai",
  "anthropic",
  "gemini",
  "agent",
  "mcp",
  "vision",
  "robotics",
  "reinforcement",
  "rag",
  "transformer",
  "benchmark",
  "diffusion",
];

/**
 * Real Hacker News Firebase API connector
 */
export async function fetchHackerNewsItems(limit = 6): Promise<RawItem[]> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const topStoriesRes = await fetch("https://hacker-news.firebaseio.com/v0/topstories.json", {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!topStoriesRes.ok) return [];

    const storyIds: number[] = await topStoriesRes.json();
    const candidateIds = storyIds.slice(0, 40);

    const items: RawItem[] = [];

    for (const id of candidateIds) {
      if (items.length >= limit) break;
      try {
        const itemRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (!itemRes.ok) continue;
        const data = await itemRes.json();

        if (!data || !data.title || data.type !== "story") continue;

        const titleLower = data.title.toLowerCase();
        const isAiRelated = AI_KEYWORDS.some((kw) => {
          const regex = new RegExp(`\\b${kw}\\b`, "i");
          return regex.test(titleLower);
        });

        if (isAiRelated) {
          const sourceUrl = data.url || `https://news.ycombinator.com/item?id=${data.id}`;
          const isTool = titleLower.includes("release") || titleLower.includes("show hn") || titleLower.includes("library") || titleLower.includes("sdk");
          
          items.push({
            id: `hn-${data.id}`,
            source: "hackernews",
            sourceUrl,
            title: data.title,
            summary: `Hacker News submission with ${data.score || 1} points and ${data.descendants || 0} comments by ${data.by}. Discusses ${data.title}.`,
            contentType: isTool ? "tool" : "news",
            publishedAt: new Date(data.time * 1000).toISOString(),
            ingestedAt: new Date().toISOString(),
            authorOrChannel: data.by || "Hacker News",
            rawMetadata: { points: data.score, comments: data.descendants },
            score: 88,
          });
        }
      } catch (err) {
        // ignore individual item failure
      }
    }

    return items;
  } catch (error) {
    console.warn("Hacker News fetch error:", error);
    return [];
  }
}
