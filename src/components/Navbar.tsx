import React from "react";
import {
  Activity,
  Layers,
  Sparkles,
  TrendingUp,
  FileText,
  MessageSquareText,
  Server,
  Sliders,
  Send,
  RefreshCw,
  Bookmark,
  CheckCircle2,
} from "lucide-react";

export type NavTab =
  | "feed"
  | "digest"
  | "trends"
  | "deepdive"
  | "chat"
  | "sources"
  | "profile"
  | "dispatch";

interface NavbarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  onRefreshFeed: () => void;
  isRefreshing: boolean;
  bookmarkedCount: number;
  unreadCount: number;
  onToggleBookmarksOnly: () => void;
  showingBookmarksOnly: boolean;
  onToggleUnreadOnly: () => void;
  showingUnreadOnly: boolean;
  onMarkAllRead: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onRefreshFeed,
  isRefreshing,
  bookmarkedCount,
  unreadCount,
  onToggleBookmarksOnly,
  showingBookmarksOnly,
  onToggleUnreadOnly,
  showingUnreadOnly,
  onMarkAllRead,
}) => {
  return (
    <header id="main-navbar" className="bg-slate-950 border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand Logo & User Profile Badge */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab("feed")}
              className="flex items-center gap-2.5 text-left group cursor-pointer focus:outline-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-white tracking-tight">AI Pulse</span>
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-indigo-950 text-indigo-300 border border-indigo-800">
                    v1.0
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-none">
                  Personal Intelligence · Krishna (CS/AI)
                </p>
              </div>
            </button>
          </div>

          {/* Center Navigation Tabs */}
          <nav className="hidden xl:flex items-center gap-1">
            <button
              id="nav-tab-feed"
              onClick={() => setActiveTab("feed")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "feed"
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Curated Feed</span>
            </button>

            <button
              id="nav-tab-digest"
              onClick={() => setActiveTab("digest")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "digest"
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>5-Min Digest</span>
            </button>

            <button
              id="nav-tab-trends"
              onClick={() => setActiveTab("trends")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "trends"
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              <span>Trend Radar</span>
            </button>

            <button
              id="nav-tab-deepdive"
              onClick={() => setActiveTab("deepdive")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "deepdive"
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Weekly Deep Dive</span>
            </button>

            <button
              id="nav-tab-chat"
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "chat"
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <MessageSquareText className="w-3.5 h-3.5 text-purple-400" />
              <span>Ask AI Pulse</span>
            </button>

            <button
              id="nav-tab-sources"
              onClick={() => setActiveTab("sources")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "sources"
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Server className="w-3.5 h-3.5 text-emerald-400" />
              <span>Source Health</span>
            </button>

            <button
              id="nav-tab-profile"
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "profile"
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Sliders className="w-3.5 h-3.5 text-amber-400" />
              <span>Weights Matrix</span>
            </button>

            <button
              id="nav-tab-dispatch"
              onClick={() => setActiveTab("dispatch")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                activeTab === "dispatch"
                  ? "bg-indigo-600/20 text-indigo-300 border border-indigo-500/40"
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900"
              }`}
            >
              <Send className="w-3.5 h-3.5 text-sky-400" />
              <span>Telegram / Email</span>
            </button>
          </nav>

          {/* Actions & Filters */}
          <div className="flex items-center gap-2">
            {activeTab === "feed" && (
              <>
                <button
                  id="nav-toggle-unread"
                  onClick={onToggleUnreadOnly}
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors cursor-pointer ${
                    showingUnreadOnly
                      ? "bg-indigo-950 text-indigo-300 border border-indigo-800"
                      : "text-slate-400 hover:text-slate-200 bg-slate-900"
                  }`}
                  title="Filter unread items"
                >
                  <span>Unread</span>
                  {unreadCount > 0 && (
                    <span className="bg-indigo-600 text-white text-[10px] px-1.5 py-0.2 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </button>

                <button
                  id="nav-toggle-bookmarks"
                  onClick={onToggleBookmarksOnly}
                  className={`p-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    showingBookmarksOnly
                      ? "bg-amber-950 text-amber-300 border border-amber-800"
                      : "text-slate-400 hover:text-slate-200 bg-slate-900"
                  }`}
                  title="Show bookmarked items"
                >
                  <Bookmark className={`w-4 h-4 ${showingBookmarksOnly ? "fill-amber-400 text-amber-400" : ""}`} />
                </button>

                <button
                  id="nav-mark-read-btn"
                  onClick={onMarkAllRead}
                  className="hidden md:flex items-center gap-1 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 px-2.5 py-1.5 rounded-lg text-xs transition-colors cursor-pointer"
                  title="Mark all items as read"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mark All Read</span>
                </button>
              </>
            )}

            <button
              id="nav-sync-ingest-btn"
              onClick={onRefreshFeed}
              disabled={isRefreshing}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shadow-sm cursor-pointer"
              title="Run Ingestion Pipeline Now"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{isRefreshing ? "Scanning Sources..." : "Run Ingestion"}</span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Horizontal Navigation Menu */}
        <div className="xl:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-900 no-scrollbar">
          {[
            { id: "feed", label: "Feed", icon: Layers },
            { id: "digest", label: "5-Min Digest", icon: Sparkles },
            { id: "trends", label: "Trends", icon: TrendingUp },
            { id: "deepdive", label: "Deep Dive", icon: FileText },
            { id: "chat", label: "Ask Pulse", icon: MessageSquareText },
            { id: "sources", label: "Sources", icon: Server },
            { id: "profile", label: "Weights", icon: Sliders },
            { id: "dispatch", label: "Dispatch", icon: Send },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as NavTab)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap cursor-pointer ${
                  active
                    ? "bg-indigo-600 text-white"
                    : "text-slate-400 hover:text-slate-200 bg-slate-900"
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
