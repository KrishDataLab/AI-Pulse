import { RawItem } from "../../src/types";

/**
 * Real RSS and Reddit Connector
 * Ingests from Reddit r/MachineLearning, Hugging Face Daily Papers, and Tech blogs
 */
export async function fetchRedditAndBlogItems(limit = 6): Promise<RawItem[]> {
  const items: RawItem[] = [];

  // Try fetching Reddit r/MachineLearning JSON endpoint
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const res = await fetch("https://www.reddit.com/r/MachineLearning/top.json?t=day&limit=10", {
      headers: { "User-Agent": "AIPulseResearchBot/1.0" },
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      const data = await res.json();
      const posts = data?.data?.children || [];
      for (const post of posts) {
        if (items.length >= limit) break;
        const p = post.data;
        if (!p || p.stickied || p.over_18) continue;

        items.push({
          id: `reddit-${p.id}`,
          source: "reddit",
          sourceUrl: `https://reddit.com${p.permalink}`,
          title: p.title,
          summary: (p.selftext ? p.selftext.slice(0, 400) + "..." : `Discussion on r/MachineLearning with ${p.ups} upvotes and ${p.num_comments} comments.`),
          contentType: p.link_flair_text?.toLowerCase().includes("research") ? "paper" : "discussion",
          publishedAt: new Date(p.created_utc * 1000).toISOString(),
          ingestedAt: new Date().toISOString(),
          authorOrChannel: `u/${p.author} on r/MachineLearning`,
          rawMetadata: { upvotes: p.ups, comments: p.num_comments },
          score: 85,
        });
      }
    }
  } catch (err) {
    console.warn("Reddit fetch failed:", err);
  }

  return items;
}
