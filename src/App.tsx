import React, { useState, useEffect } from "react";
import {
  FeedEntry,
  InterestProfile,
  SourceHealth,
  SystemStats,
  TrendCluster,
  WeeklyDeepDive,
  FeedbackRecord,
  SourceType,
} from "./types";
import { Navbar, NavTab } from "./components/Navbar";
import { StatsBar } from "./components/StatsBar";
import { FeedList } from "./components/FeedList";
import { DigestReader } from "./components/DigestReader";
import { TrendsRadar } from "./components/TrendsRadar";
import { WeeklyDeepDiveView } from "./components/WeeklyDeepDiveView";
import { AskPulseChat } from "./components/AskPulseChat";
import { SourceHealthCenter } from "./components/SourceHealthCenter";
import { ProfileManager } from "./components/ProfileManager";
import { DispatchPreviewModal } from "./components/DispatchPreviewModal";
import { RefreshCw, Sparkles, Layers, ShieldCheck, Activity } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>("feed");
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [profile, setProfile] = useState<InterestProfile | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [sources, setSources] = useState<SourceHealth[]>([]);
  const [trends, setTrends] = useState<TrendCluster[]>([]);
  const [deepDive, setDeepDive] = useState<WeeklyDeepDive | null>(null);
  const [feedbackHistory, setFeedbackHistory] = useState<FeedbackRecord[]>([]);
  const [telegramPreview, setTelegramPreview] = useState<any>(null);

  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showingBookmarksOnly, setShowingBookmarksOnly] = useState(false);
  const [showingUnreadOnly, setShowingUnreadOnly] = useState(false);

  // Load all initial data from server APIs
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [feedRes, profileRes, statsRes, sourcesRes, trendsRes, deepDiveRes, digestRes] =
        await Promise.all([
          fetch("/api/feed").then((r) => r.json()),
          fetch("/api/profile").then((r) => r.json()),
          fetch("/api/stats").then((r) => r.json()),
          fetch("/api/sources/health").then((r) => r.json()),
          fetch("/api/trends").then((r) => r.json()),
          fetch("/api/deep-dive").then((r) => r.json()),
          fetch("/api/digest/preview").then((r) => r.json()),
        ]);

      setEntries(feedRes.entries || []);
      setProfile(profileRes.profile || null);
      setFeedbackHistory(profileRes.feedbackHistory || []);
      setStats(statsRes || null);
      setSources(sourcesRes.sources || []);
      setTrends(trendsRes.trends || []);
      setDeepDive(deepDiveRes || null);
      setTelegramPreview(digestRes?.telegram || null);
    } catch (err) {
      console.error("Failed to load initial data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Run Ingestion Pipeline
  const handleRunIngestion = async (source?: SourceType) => {
    setIsRefreshing(true);
    try {
      await fetch("/api/admin/ingest/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source }),
      });
      // Refresh feed & stats
      const [feedRes, statsRes, sourcesRes, trendsRes] = await Promise.all([
        fetch("/api/feed").then((r) => r.json()),
        fetch("/api/stats").then((r) => r.json()),
        fetch("/api/sources/health").then((r) => r.json()),
        fetch("/api/trends").then((r) => r.json()),
      ]);
      setEntries(feedRes.entries || []);
      setStats(statsRes || null);
      setSources(sourcesRes.sources || []);
      setTrends(trendsRes.trends || []);
    } catch (err) {
      console.error("Ingestion failed", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Feedback (Thumbs Up / Down)
  const handleFeedback = async (id: string, rating: "up" | "down") => {
    try {
      // Optimistic update
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, feedback: rating } : e))
      );

      const res = await fetch(`/api/feed/${id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating }),
      });
      const data = await res.json();

      // Refresh profile & stats
      if (profile && data.updatedTopics) {
        setProfile({
          ...profile,
          topics: data.updatedTopics,
        });
      }
      const statsRes = await fetch("/api/stats").then((r) => r.json());
      setStats(statsRes);
    } catch (err) {
      console.error("Feedback failed", err);
    }
  };

  // Toggle Bookmark
  const handleToggleBookmark = async (id: string) => {
    try {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, bookmarked: !e.bookmarked } : e))
      );
      await fetch(`/api/feed/${id}/bookmark`, { method: "POST" });
    } catch (err) {
      console.error("Bookmark toggle failed", err);
    }
  };

  // Toggle Read Status
  const handleToggleRead = async (id: string) => {
    try {
      setEntries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, read: !e.read } : e))
      );
      await fetch(`/api/feed/${id}/read`, { method: "POST" });
    } catch (err) {
      console.error("Read toggle failed", err);
    }
  };

  // Mark All Read
  const handleMarkAllRead = async () => {
    try {
      setEntries((prev) => prev.map((e) => ({ ...e, read: true })));
      await fetch("/api/feed/mark-all-read", { method: "POST" });
    } catch (err) {
      console.error("Mark all read failed", err);
    }
  };

  // Profile Updates
  const handleUpdateProfile = async (updates: Partial<InterestProfile>) => {
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      const updated = await res.json();
      setProfile(updated);
    } catch (err) {
      console.error("Update profile failed", err);
    }
  };

  const handleAddTopic = async (topic: {
    name: string;
    category: any;
    weight: number;
    keywords: string[];
  }) => {
    try {
      const res = await fetch("/api/profile/topic", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(topic),
      });
      const data = await res.json();
      if (profile && data.topics) {
        setProfile({ ...profile, topics: data.topics });
      }
    } catch (err) {
      console.error("Add topic failed", err);
    }
  };

  const handleDeleteTopic = async (topicId: string) => {
    try {
      const res = await fetch(`/api/profile/topic/${topicId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (profile && data.topics) {
        setProfile({ ...profile, topics: data.topics });
      }
    } catch (err) {
      console.error("Delete topic failed", err);
    }
  };

  // Toggle Source Enabled
  const handleToggleSource = async (source: SourceType, enabled: boolean) => {
    try {
      await fetch("/api/sources/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, enabled }),
      });
      setSources((prev) =>
        prev.map((s) => (s.source === source ? { ...s, enabled } : s))
      );
    } catch (err) {
      console.error("Toggle source failed", err);
    }
  };

  // Deep Dive Regenerate
  const handleRegenerateDeepDive = async () => {
    const res = await fetch("/api/deep-dive/generate", { method: "POST" });
    const fresh = await res.json();
    setDeepDive(fresh);
  };

  // Grounded Chat
  const handleSendMessage = async (message: string) => {
    const res = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
    return await res.json();
  };

  // Send Test Dispatch
  const handleSendTestDispatch = async (channel: "telegram" | "email" | "all") => {
    const res = await fetch("/api/digest/send-test", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ channel }),
    });
    return await res.json();
  };

  // Filtered displayed entries for Feed view
  const displayedEntries = entries.filter((e) => {
    if (showingBookmarksOnly && !e.bookmarked) return false;
    if (showingUnreadOnly && e.read) return false;
    return true;
  });

  const bookmarkedCount = entries.filter((e) => e.bookmarked).length;
  const unreadCount = entries.filter((e) => !e.read).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased flex flex-col selection:bg-indigo-600 selection:text-white">
      {/* Top Metrics Stats Bar */}
      <StatsBar
        stats={stats}
        digestTime={profile?.digestSendTime || "08:00"}
        onOpenDigest={() => setActiveTab("digest")}
        onOpenDispatch={() => setActiveTab("dispatch")}
      />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRefreshFeed={() => handleRunIngestion()}
        isRefreshing={isRefreshing}
        bookmarkedCount={bookmarkedCount}
        unreadCount={unreadCount}
        onToggleBookmarksOnly={() => setShowingBookmarksOnly(!showingBookmarksOnly)}
        showingBookmarksOnly={showingBookmarksOnly}
        onToggleUnreadOnly={() => setShowingUnreadOnly(!showingUnreadOnly)}
        showingUnreadOnly={showingUnreadOnly}
        onMarkAllRead={handleMarkAllRead}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center animate-pulse border border-indigo-500/30">
              <Activity className="w-6 h-6 animate-spin" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-200">
                Initializing AI Pulse Intelligence Engine...
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Clustering papers, cross-referencing releases, and scoring relevance for Krishna
              </p>
            </div>
          </div>
        ) : (
          <>
            {activeTab === "feed" && (
              <FeedList
                entries={displayedEntries}
                onFeedback={handleFeedback}
                onToggleBookmark={handleToggleBookmark}
                onToggleRead={handleToggleRead}
                onStartDigest={() => setActiveTab("digest")}
              />
            )}

            {activeTab === "digest" && (
              <DigestReader
                entries={entries}
                onFeedback={handleFeedback}
                onToggleBookmark={handleToggleBookmark}
                onToggleRead={handleToggleRead}
                onClose={() => setActiveTab("feed")}
                onOpenDispatch={() => setActiveTab("dispatch")}
              />
            )}

            {activeTab === "trends" && (
              <TrendsRadar
                trends={trends}
                onSelectTopic={(topic) => {
                  setActiveTab("feed");
                }}
              />
            )}

            {activeTab === "deepdive" && (
              <WeeklyDeepDiveView
                deepDive={deepDive}
                onRegenerate={handleRegenerateDeepDive}
              />
            )}

            {activeTab === "chat" && (
              <AskPulseChat onSendMessage={handleSendMessage} />
            )}

            {activeTab === "sources" && (
              <SourceHealthCenter
                sources={sources}
                onTriggerIngest={handleRunIngestion}
                onToggleSource={handleToggleSource}
              />
            )}

            {activeTab === "profile" && profile && (
              <ProfileManager
                profile={profile}
                feedbackHistory={feedbackHistory}
                onUpdateProfile={handleUpdateProfile}
                onAddTopic={handleAddTopic}
                onDeleteTopic={handleDeleteTopic}
              />
            )}

            {activeTab === "dispatch" && profile && (
              <DispatchPreviewModal
                telegramPreview={telegramPreview}
                topEntries={entries}
                emailRecipient={profile.emailRecipient}
                telegramChatId={profile.telegramChatId}
                sendTime={profile.digestSendTime}
                onSendTestDispatch={handleSendTestDispatch}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-400">AI Pulse</span>
            <span>·</span>
            <span>Personal AI-Industry Intelligence System</span>
          </div>
          <div className="text-slate-500 text-[11px]">
            Powered by Gemini AI Reasoning & Autonomous Multi-Source Clustering
          </div>
        </div>
      </footer>
    </div>
  );
}
