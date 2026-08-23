import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { chatWithPulse, generateWeeklyDeepDive } from "./server/gemini";
import { pulseStore } from "./server/pipeline";
import { SourceType } from "./src/types";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // 1. Feed Endpoint with filtering, search, sorting
  app.get("/api/feed", (req, res) => {
    const { category, search, minScore, bookmarked, onlyUnread, limit = 50 } = req.query;

    let entries = Array.from(pulseStore.feedEntries.values());

    // Filter by Category
    if (category && category !== "all") {
      entries = entries.filter((e) => e.category === category);
    }

    // Filter by search term
    if (search && typeof search === "string") {
      const q = search.toLowerCase();
      entries = entries.filter(
        (e) =>
          e.canonicalTitle.toLowerCase().includes(q) ||
          e.summary.toLowerCase().includes(q) ||
          e.whyItMatters.toLowerCase().includes(q) ||
          e.matchedTopics.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Filter by minimum score
    if (minScore) {
      const scoreNum = Number(minScore);
      if (!isNaN(scoreNum)) {
        entries = entries.filter((e) => e.relevanceScore >= scoreNum);
      }
    }

    // Filter bookmarked
    if (bookmarked === "true") {
      entries = entries.filter((e) => e.bookmarked);
    }

    // Filter unread
    if (onlyUnread === "true") {
      entries = entries.filter((e) => !e.read);
    }

    // Sort by relevance score descending, then surfacedAt descending
    entries.sort((a, b) => {
      if (b.relevanceScore !== a.relevanceScore) {
        return b.relevanceScore - a.relevanceScore;
      }
      return new Date(b.surfacedAt).getTime() - new Date(a.surfacedAt).getTime();
    });

    const parsedLimit = Number(limit);
    if (!isNaN(parsedLimit) && parsedLimit > 0) {
      entries = entries.slice(0, parsedLimit);
    }

    res.json({
      entries,
      totalCount: entries.length,
      profile: pulseStore.interestProfile,
    });
  });

  // 2. Single Feed Item Detail
  app.get("/api/feed/:id", (req, res) => {
    const entry = pulseStore.feedEntries.get(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: "Feed entry not found" });
    }
    res.json(entry);
  });

  // 3. Feedback (Thumbs Up / Down)
  app.post("/api/feed/:id/feedback", (req, res) => {
    const { rating } = req.body;
    if (rating !== "up" && rating !== "down") {
      return res.status(400).json({ error: "Rating must be 'up' or 'down'" });
    }
    const result = pulseStore.submitFeedback(req.params.id, rating);
    const entry = pulseStore.feedEntries.get(req.params.id);
    res.json({ success: result.success, updatedTopics: result.updatedTopics, entry });
  });

  // 4. Bookmark Toggle
  app.post("/api/feed/:id/bookmark", (req, res) => {
    const entry = pulseStore.feedEntries.get(req.params.id);
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    entry.bookmarked = !entry.bookmarked;
    if (entry.bookmarked) pulseStore.bookmarks.add(entry.id);
    else pulseStore.bookmarks.delete(entry.id);

    res.json({ bookmarked: entry.bookmarked, entry });
  });

  // 5. Read Status Toggle
  app.post("/api/feed/:id/read", (req, res) => {
    const entry = pulseStore.feedEntries.get(req.params.id);
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    entry.read = req.body.read !== undefined ? !!req.body.read : !entry.read;
    if (entry.read) pulseStore.readItems.add(entry.id);
    else pulseStore.readItems.delete(entry.id);

    res.json({ read: entry.read, entry });
  });

  // 6. Mark All As Read
  app.post("/api/feed/mark-all-read", (req, res) => {
    for (const entry of pulseStore.feedEntries.values()) {
      entry.read = true;
      pulseStore.readItems.add(entry.id);
    }
    res.json({ success: true, count: pulseStore.feedEntries.size });
  });

  // 7. Interest Profile Endpoints
  app.get("/api/profile", (req, res) => {
    res.json({
      profile: pulseStore.interestProfile,
      feedbackHistory: pulseStore.feedbackHistory.slice(0, 20),
    });
  });

  app.put("/api/profile", (req, res) => {
    const updates = req.body;
    pulseStore.interestProfile = {
      ...pulseStore.interestProfile,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    res.json(pulseStore.interestProfile);
  });

  app.post("/api/profile/topic", (req, res) => {
    const { name, category, weight = 1.0, keywords = [] } = req.body;
    if (!name) return res.status(400).json({ error: "Topic name is required" });

    const newTopic = {
      id: `top-${Date.now()}`,
      name,
      category: category || "industry",
      weight: Number(weight) || 1.0,
      feedbackUpCount: 0,
      feedbackDownCount: 0,
      keywords: keywords.length > 0 ? keywords : [name.toLowerCase()],
    };

    pulseStore.interestProfile.topics.push(newTopic);
    res.json({ success: true, topic: newTopic, topics: pulseStore.interestProfile.topics });
  });

  app.delete("/api/profile/topic/:id", (req, res) => {
    pulseStore.interestProfile.topics = pulseStore.interestProfile.topics.filter((t) => t.id !== req.params.id);
    res.json({ success: true, topics: pulseStore.interestProfile.topics });
  });

  // 8. Ingestion & Source Health
  app.get("/api/sources/health", (req, res) => {
    res.json({
      sources: Array.from(pulseStore.sourceHealth.values()),
      lastRun: new Date().toISOString(),
    });
  });

  app.post("/api/sources/toggle", (req, res) => {
    const { source, enabled } = req.body;
    const s = pulseStore.sourceHealth.get(source as SourceType);
    if (s) {
      s.enabled = enabled;
      res.json({ success: true, source: s });
    } else {
      res.status(404).json({ error: "Source not found" });
    }
  });

  app.post("/api/admin/ingest/run", async (req, res) => {
    const { source } = req.body;
    try {
      const result = await pulseStore.runIngestion(source as SourceType);
      res.json({
        success: true,
        ingestedCount: result.ingestedCount,
        feedCount: result.newFeedCount,
        sources: Array.from(pulseStore.sourceHealth.values()),
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // 9. Digest Previews & Dispatch Simulator
  app.get("/api/digest/preview", (req, res) => {
    const telegramPreview = pulseStore.getTelegramDigestPreview();
    const topEntries = Array.from(pulseStore.feedEntries.values())
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, pulseStore.interestProfile.dailyItemLimit);

    res.json({
      telegram: telegramPreview,
      emailRecipient: pulseStore.interestProfile.emailRecipient,
      sendTime: pulseStore.interestProfile.digestSendTime,
      itemCount: topEntries.length,
      topEntries,
    });
  });

  app.post("/api/digest/send-test", (req, res) => {
    const { channel } = req.body; // 'telegram' | 'email' | 'all'
    const preview = pulseStore.getTelegramDigestPreview();

    res.json({
      success: true,
      channel: channel || "all",
      dispatchedAt: new Date().toISOString(),
      recipient: channel === "email" ? pulseStore.interestProfile.emailRecipient : pulseStore.interestProfile.telegramChatId,
      previewText: preview.messageText,
      message: `Test ${channel || "digest"} dispatched successfully to ${
        channel === "email" ? pulseStore.interestProfile.emailRecipient : pulseStore.interestProfile.telegramChatId
      }`,
    });
  });

  // 10. Weekly Deep Dive Synthesis
  app.get("/api/deep-dive", async (req, res) => {
    if (pulseStore.weeklyDeepDives.length === 0) {
      const entries = Array.from(pulseStore.feedEntries.values());
      const deepDive = await generateWeeklyDeepDive(entries, pulseStore.interestProfile);
      pulseStore.weeklyDeepDives.push(deepDive);
    }
    res.json(pulseStore.weeklyDeepDives[0]);
  });

  app.post("/api/deep-dive/generate", async (req, res) => {
    const entries = Array.from(pulseStore.feedEntries.values());
    const deepDive = await generateWeeklyDeepDive(entries, pulseStore.interestProfile);
    pulseStore.weeklyDeepDives.unshift(deepDive);
    res.json(deepDive);
  });

  // 11. Topic Convergence Radar / Trends
  app.get("/api/trends", (req, res) => {
    const trends = pulseStore.getEmergingTrends();
    res.json({ trends });
  });

  // 12. Grounded AI Chat with Pulse
  app.post("/api/chat", async (req, res) => {
    const { message, history = [] } = req.body;
    if (!message) return res.status(400).json({ error: "Message is required" });

    const entries = Array.from(pulseStore.feedEntries.values());
    const reply = await chatWithPulse(message, entries, pulseStore.interestProfile, history);
    res.json(reply);
  });

  // 13. System Metrics & Stats
  app.get("/api/stats", (req, res) => {
    const stats = pulseStore.getStats();
    res.json(stats);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Pulse server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
