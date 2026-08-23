import { RawItem } from "../../src/types";

/**
 * Real arXiv API connector
 * Queries cs.AI, cs.LG, cs.CL, cs.CV
 */
export async function fetchArxivItems(limit = 6): Promise<RawItem[]> {
  const url = `https://export.arxiv.org/api/query?search_query=cat:cs.AI+OR+cat:cs.LG+OR+cat:cs.CL+OR+cat:cs.CV&sortBy=submittedDate&sortOrder=descending&max_results=${limit}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) {
      throw new Error(`arXiv API responded with status ${res.status}`);
    }

    const xml = await res.text();
    return parseArxivXml(xml);
  } catch (err) {
    console.warn("arXiv live fetch failed or timed out, using fallback items:", err);
    return [];
  }
}

function parseArxivXml(xml: string): RawItem[] {
  const items: RawItem[] = [];
  const entryRegex = /<entry>([\s\S]*?)<\/entry>/g;
  let match: RegExpExecArray | null;

  while ((match = entryRegex.exec(xml)) !== null) {
    const entryBlock = match[1];
    
    const idMatch = /<id>(.*?)<\/id>/.exec(entryBlock);
    const titleMatch = /<title>([\s\S]*?)<\/title>/.exec(entryBlock);
    const summaryMatch = /<summary>([\s\S]*?)<\/summary>/.exec(entryBlock);
    const publishedMatch = /<published>(.*?)<\/published>/.exec(entryBlock);
    const authorMatch = /<author>\s*<name>(.*?)<\/name>/g;

    const authors: string[] = [];
    let aMatch: RegExpExecArray | null;
    while ((aMatch = authorMatch.exec(entryBlock)) !== null) {
      authors.push(aMatch[1]);
    }

    if (idMatch && titleMatch) {
      const sourceUrl = idMatch[1].trim();
      const rawTitle = titleMatch[1].replace(/\n/g, " ").trim();
      const rawSummary = summaryMatch ? summaryMatch[1].replace(/\n/g, " ").trim().slice(0, 500) + "..." : "";
      const publishedAt = publishedMatch ? publishedMatch[1].trim() : new Date().toISOString();

      items.push({
        id: "arxiv-" + sourceUrl.split("/abs/").pop()?.replace(/\//g, "-") || `arxiv-${Date.now()}-${Math.random()}`,
        source: "arxiv",
        sourceUrl,
        title: rawTitle,
        summary: rawSummary,
        contentType: "paper",
        publishedAt,
        ingestedAt: new Date().toISOString(),
        authorOrChannel: authors.slice(0, 3).join(", ") + (authors.length > 3 ? " et al." : ""),
        score: 90,
      });
    }
  }

  return items;
}
