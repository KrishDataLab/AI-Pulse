import { RawItem, SourceType } from "../../src/types";

export async function fetchProductHuntItems(limit = 4): Promise<RawItem[]> {
  const now = Date.now();
  const items: RawItem[] = [
    {
      id: "ph-fastmcp-v2",
      source: "producthunt",
      sourceUrl: "https://www.producthunt.com/posts/fastmcp-v2",
      title: "FastMCP 2.0: Build Model Context Protocol Servers in 10 Lines of TypeScript",
      summary:
        "The fastest framework to expose APIs and local databases to Claude, Cursor, and autonomous agent loops with automatic schema generation and SSE streaming.",
      contentType: "tool",
      publishedAt: new Date(now - 3600000 * 10).toISOString(),
      ingestedAt: new Date().toISOString(),
      authorOrChannel: "FastMCP Team",
      score: 94,
      rawMetadata: { upvotes: 740 },
    },
    {
      id: "ph-smolagents-hf",
      source: "producthunt",
      sourceUrl: "https://www.producthunt.com/posts/smolagents-by-huggingface",
      title: "Smolagents 2.0: Lightweight Code-Action Agent Framework by Hugging Face",
      summary:
        "An innovative Python library where agents write executable code blocks rather than clumsy JSON payloads, drastically boosting mathematical and tool composition benchmarks.",
      contentType: "tool",
      publishedAt: new Date(now - 3600000 * 36).toISOString(),
      ingestedAt: new Date().toISOString(),
      authorOrChannel: "Hugging Face",
      score: 91,
      rawMetadata: { upvotes: 1120 },
    },
  ];
  return items.slice(0, limit);
}
