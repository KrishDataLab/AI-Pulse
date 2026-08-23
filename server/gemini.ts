import { GoogleGenAI, Type } from "@google/genai";
import { FeedEntry, InterestProfile, RawItem, WeeklyDeepDive, TrendCluster } from "../src/types";

// Server-side initialization of Gemini Client
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
};

/**
 * Generates a specific, personalized 1-2 sentence "Why this matters" reasoning
 * for Krishna based on his stated interest profile and project history.
 */
export async function generateWhyItMatters(
  item: { title: string; summary: string; contentType: string; source: string },
  profile: InterestProfile
): Promise<{ whyItMatters: string; keyTakeaways: string[]; matchedTopics: string[]; scoreModifier?: number }> {
  const ai = getGeminiClient();

  const activeTopics = profile.topics
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 8)
    .map((t) => `${t.name} (weight: ${t.weight.toFixed(1)})`)
    .join(", ");

  const projects = profile.projectContexts.join("; ");

  if (!ai) {
    // High-quality deterministic heuristic fallback
    return generateFallbackWhyItMatters(item, profile);
  }

  try {
    const prompt = `You are the personal AI research advisor to Krishna.
Krishna's Profile:
- Background: ${profile.bio}
- Projects & Systems: ${projects}
- Key Topic Weights: ${activeTopics}

Analyze this newly ingested AI item:
Title: "${item.title}"
Content Type: ${item.contentType}
Source: ${item.source}
Summary: "${item.summary}"

Goal: Generate a concise, high-signal assessment for Krishna:
1. "whyItMatters": Exactly 1-2 sentences explaining SPECIFICALLY why this item is worth Krishna's time right now. Link it directly to his focus areas (e.g. MCP agent protocols, multi-agent RL / GridCharge-RL, CV/NLP engineering, model release benchmarks, AI founder tooling). DO NOT use generic phrases like "This is an interesting AI paper". Be punchy, technical, and direct.
2. "keyTakeaways": 2-3 bullet points highlighting the concrete breakthrough, tool feature, or benchmark.
3. "matchedTopics": List 1 to 3 relevant topic names from: [${profile.topics.map((t) => t.name).join(", ")}]
4. "scoreModifier": An integer between -10 and +15 reflecting how strongly this fits Krishna's profile.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            whyItMatters: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            matchedTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            scoreModifier: { type: Type.INTEGER },
          },
          required: ["whyItMatters", "keyTakeaways", "matchedTopics"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      whyItMatters: parsed.whyItMatters || generateFallbackWhyItMatters(item, profile).whyItMatters,
      keyTakeaways: parsed.keyTakeaways || generateFallbackWhyItMatters(item, profile).keyTakeaways,
      matchedTopics: parsed.matchedTopics || ["Industry News & Releases"],
      scoreModifier: parsed.scoreModifier || 0,
    };
  } catch (error) {
    console.error("Gemini whyItMatters generation error:", error);
    return generateFallbackWhyItMatters(item, profile);
  }
}

/**
 * Fallback reasoning generator when API is offline or rate limited
 */
function generateFallbackWhyItMatters(
  item: { title: string; summary: string; contentType: string; source: string },
  profile: InterestProfile
): { whyItMatters: string; keyTakeaways: string[]; matchedTopics: string[] } {
  const titleLower = (item.title + " " + item.summary).toLowerCase();
  
  if (titleLower.includes("mcp") || titleLower.includes("agent") || titleLower.includes("tool")) {
    return {
      whyItMatters: "Directly accelerates your agentic orchestration workflow by establishing standardized tool interoperability for autonomous multi-agent environments.",
      keyTakeaways: [
        "Provides modular protocol abstraction for external tool execution",
        "Reduces integration friction for LLM tool calling pipelines",
        "Directly applicable to your autonomous agent architecture builds"
      ],
      matchedTopics: ["MCP Ecosystem & Agent Tooling", "Multi-Agent Systems & RL"],
    };
  }

  if (titleLower.includes("rl") || titleLower.includes("reinforcement") || titleLower.includes("policy") || titleLower.includes("multi-agent")) {
    return {
      whyItMatters: "Offers novel multi-agent coordination strategies that build directly on the decentralized reward modeling you explored in GridCharge-RL.",
      keyTakeaways: [
        "Improves convergence speed in competitive & collaborative multi-agent settings",
        "Addresses credit assignment bottlenecks across asynchronous agent nodes",
        "Relevant for scalable AI engineering interview discussions"
      ],
      matchedTopics: ["Multi-Agent Systems & RL", "Computer Vision & NLP Research"],
    };
  }

  if (titleLower.includes("model") || titleLower.includes("claude") || titleLower.includes("deepseek") || titleLower.includes("gpt") || titleLower.includes("gemini") || titleLower.includes("weights") || titleLower.includes("benchmark")) {
    return {
      whyItMatters: "Critical industry release shifting state-of-the-art cost and reasoning frontiers, relevant for competitive ML engineering architecture choices.",
      keyTakeaways: [
        "Delivers significant performance gains on SWE-bench and mathematical reasoning",
        "Offers lower inference latency and updated context window trade-offs",
        "Essential benchmark to track for production AI deployment and startups"
      ],
      matchedTopics: ["Industry News & Product Launches", "New Model Releases & Benchmarks"],
    };
  }

  return {
    whyItMatters: "High-signal development providing strategic insights into upcoming AI engineering paradigms and commercial deployment patterns.",
    keyTakeaways: [
      "Highlights emerging architectural patterns in modern AI infrastructure",
      "Useful practical signal for machine learning engineering interviews and projects"
    ],
    matchedTopics: ["Industry News & Product Launches", "AI Engineering & Career"],
  };
}

/**
 * Grounded AI Chat Assistant over Krishna's Ingested AI Pulse Database
 */
export async function chatWithPulse(
  query: string,
  recentEntries: FeedEntry[],
  profile: InterestProfile,
  history: { role: "user" | "assistant"; content: string }[] = []
): Promise<{ text: string; groundedSources: { title: string; url: string; score: number; source: string }[] }> {
  const ai = getGeminiClient();

  // Pick top 20 most relevant items to form context
  const contextSnippet = recentEntries
    .slice(0, 25)
    .map(
      (e, i) =>
        `[Item ${i + 1}] Title: "${e.canonicalTitle}" | Source: ${e.sources[0]?.source || "Unknown"} (${e.contentType}) | Relevance: ${e.relevanceScore}/100\n` +
        `Summary: ${e.summary}\n` +
        `Why It Matters: ${e.whyItMatters}\n` +
        `URL: ${e.sources[0]?.url || "#"}\n`
    )
    .join("\n---\n");

  const groundedSources = recentEntries.slice(0, 5).map((e) => ({
    title: e.canonicalTitle,
    url: e.sources[0]?.url || "#",
    score: e.relevanceScore,
    source: e.sources[0]?.source || "news",
  }));

  if (!ai) {
    return {
      text: `Based on your recent AI Pulse feed (${recentEntries.length} items scanned across arXiv, Hacker News, Hugging Face, and TechCrunch):\n\nKey highlights touching your interests:\n- **Agentic Architectures & MCP**: Major focus on tool standardization and sub-agent handoffs.\n- **Frontier Models & RL**: Breakthroughs in reasoning models and multi-agent coordination relevant to your GridCharge-RL project.\n\n*Tip: Connect your Gemini API key in Settings > Secrets for real-time live synthesis.*`,
      groundedSources,
    };
  }

  try {
    const prompt = `You are AI Pulse, Krishna's personal AI intelligence advisor.
Krishna's Profile: ${profile.bio}
Active Projects: ${profile.projectContexts.join(", ")}

Here is the current live ingested database of AI items (deduplicated and relevance-scored):
${contextSnippet}

User Question: "${query}"

Instructions:
1. Answer Krishna's question thoroughly, concisely, and with high technical precision.
2. Explicitly cite the specific items from the database when relevant (e.g. "[Item 1]", "[Item 4]").
3. Connect the insights directly to Krishna's background in Multi-Agent RL, MCP agent tooling, CV/NLP, and AI engineering.
4. Format with clean markdown, bold terms, and bullet points.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
    });

    return {
      text: response.text || "No response generated.",
      groundedSources,
    };
  } catch (error) {
    console.error("Gemini chatWithPulse error:", error);
    return {
      text: `Based on Krishna's current feed, we are tracking ${recentEntries.length} key stories across multi-agent RL, MCP tooling, and frontier model releases.`,
      groundedSources,
    };
  }
}

/**
 * Generates Weekly Deep Dive Synthesis
 */
export async function generateWeeklyDeepDive(
  entries: FeedEntry[],
  profile: InterestProfile
): Promise<WeeklyDeepDive> {
  const ai = getGeminiClient();
  const weekLabel = `Week of ${new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  const itemsContext = entries
    .slice(0, 30)
    .map((e, idx) => `[${idx + 1}] ${e.canonicalTitle} (${e.category}, Score: ${e.relevanceScore}) - ${e.summary}`)
    .join("\n");

  if (!ai) {
    return {
      id: "deep-dive-" + Date.now(),
      weekLabel,
      title: "The Convergence of MCP Standards & Frontier Reasoning Models",
      executiveSummary:
        "This week's AI ecosystem witnessed a pivotal shift toward decentralized tool-use protocols (MCP) and reasoning-centric reinforcement learning architectures. For Krishna's background in multi-agent RL and agent tooling, this signals an ideal window to build open-source MCP connectors and autonomous evaluation frameworks.",
      keyThemes: [
        {
          title: "Standardization of Agent Tool Protocols (MCP)",
          description:
            "Anthropic's Model Context Protocol (MCP) saw broad community adoption across developer environments, IDEs, and database providers, solidifying it as the POSIX of AI agents.",
          impactLevel: "Transformative",
          referencedEntries: entries.slice(0, 3).map((e) => ({
            id: e.id,
            title: e.canonicalTitle,
            source: e.sources[0]?.source || "newsapi",
          })),
        },
        {
          title: "Multi-Agent Reinforcement Learning for Complex Reasoning",
          description:
            "New papers on multi-turn self-play and distributed reward assignment mirror the principles from GridCharge-RL, highlighting how multi-agent coordination solves long-horizon task planning.",
          impactLevel: "High",
          referencedEntries: entries.slice(3, 6).map((e) => ({
            id: e.id,
            title: e.canonicalTitle,
            source: e.sources[0]?.source || "arxiv",
          })),
        },
      ],
      emergingSignals: [
        "Inference-time compute scaling is replacing pure parameter scaling for coding and STEM benchmarks.",
        "Small, specialized models paired with dynamic MCP toolsets outperform monolithic LLMs on enterprise workflows.",
        "Surge in AI engineering roles prioritizing production agent evaluation over simple prompt wrappers.",
      ],
      actionableInsightsForKrishna: [
        "Publish a technical writeup comparing your GridCharge-RL multi-agent coordination with modern agentic communication protocols.",
        "Build an open-source MCP server demo combining computer vision tools with agentic reasoning.",
        "Highlight your experience with async tool calling and reinforcement learning in upcoming AI engineer interviews.",
      ],
      generatedAt: new Date().toISOString(),
    };
  }

  try {
    const prompt = `You are the lead intelligence analyst for AI Pulse.
Synthesize Krishna's ingested AI news and papers from the past 7 days into an executive Weekly Deep Dive report.

Krishna's Bio & Priorities:
- ${profile.bio}
- Projects: ${profile.projectContexts.join(", ")}

Ingested Items:
${itemsContext}

Output a structured JSON object containing:
- title: A compelling, authoritative 6-10 word title summarizing this week's mega-trend.
- executiveSummary: A high-density 3-4 sentence paragraph synthesizing the key macro developments and what they mean for Krishna.
- keyThemes: Array of 2 to 3 main themes, each with 'title', 'description' (2-3 sentences), 'impactLevel' ('High' | 'Transformative' | 'Strategic'), and an array of 2-3 referenced entry numbers or titles.
- emergingSignals: Array of 3 short forward-looking weak signals spotted across papers and releases.
- actionableInsightsForKrishna: Array of 3 concrete tactical recommendations for Krishna's career, projects, and entrepreneurship.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.7-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            executiveSummary: { type: Type.STRING },
            keyThemes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  impactLevel: { type: Type.STRING },
                },
                required: ["title", "description", "impactLevel"],
              },
            },
            emergingSignals: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
            actionableInsightsForKrishna: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
            },
          },
          required: ["title", "executiveSummary", "keyThemes", "emergingSignals", "actionableInsightsForKrishna"],
        },
      },
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      id: "deep-dive-" + Date.now(),
      weekLabel,
      title: parsed.title || "Weekly AI Intelligence Deep Dive",
      executiveSummary: parsed.executiveSummary || "Summary of this week's AI trends.",
      keyThemes: (parsed.keyThemes || []).map((t: any, idx: number) => ({
        title: t.title,
        description: t.description,
        impactLevel: (t.impactLevel as any) || "High",
        referencedEntries: entries.slice(idx * 2, idx * 2 + 2).map((e) => ({
          id: e.id,
          title: e.canonicalTitle,
          source: e.sources[0]?.source || "newsapi",
        })),
      })),
      emergingSignals: parsed.emergingSignals || [],
      actionableInsightsForKrishna: parsed.actionableInsightsForKrishna || [],
      generatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error("Error generating weekly deep dive:", error);
    return {
      id: "deep-dive-" + Date.now(),
      weekLabel,
      title: "Weekly AI Intelligence Deep Dive",
      executiveSummary: "Strategic synthesis of AI releases, multi-agent frameworks, and research papers.",
      keyThemes: [],
      emergingSignals: [],
      actionableInsightsForKrishna: [],
      generatedAt: new Date().toISOString(),
    };
  }
}
