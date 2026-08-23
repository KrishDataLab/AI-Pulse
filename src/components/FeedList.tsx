import React, { useState } from "react";
import { FeedEntry } from "../types";
import { FeedCard } from "./FeedCard";
import {
  Search,
  Filter,
  SlidersHorizontal,
  Layers,
  FileText,
  Play,
  Cpu,
  Globe,
  MessageSquare,
  Sparkles,
  ArrowUpDown,
  LayoutGrid,
  List,
} from "lucide-react";

interface FeedListProps {
  entries: FeedEntry[];
  onFeedback: (id: string, rating: "up" | "down") => void;
  onToggleBookmark: (id: string) => void;
  onToggleRead: (id: string) => void;
  onStartDigest: () => void;
}

export const FeedList: React.FC<FeedListProps> = ({
  entries,
  onFeedback,
  onToggleBookmark,
  onToggleRead,
  onStartDigest,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [minScore, setMinScore] = useState<number>(50);
  const [sortBy, setSortBy] = useState<"relevance" | "newest" | "sources">("relevance");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const categories = [
    { id: "all", label: "All Curated", icon: Layers },
    { id: "news", label: "Industry & Releases", icon: Globe },
    { id: "paper", label: "Research Papers", icon: FileText },
    { id: "tool", label: "Tools & MCP", icon: Cpu },
    { id: "video", label: "Video Intelligence", icon: Play },
    { id: "discussion", label: "Community", icon: MessageSquare },
  ];

  // Filtering
  const filteredEntries = entries.filter((item) => {
    // Category match
    if (selectedCategory !== "all" && item.category !== selectedCategory) {
      return false;
    }

    // Min score
    if (item.relevanceScore < minScore) {
      return false;
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = item.canonicalTitle.toLowerCase().includes(q);
      const summaryMatch = item.summary.toLowerCase().includes(q);
      const whyMatch = item.whyItMatters.toLowerCase().includes(q);
      const topicMatch = item.matchedTopics.some((t) => t.toLowerCase().includes(q));
      if (!titleMatch && !summaryMatch && !whyMatch && !topicMatch) {
        return false;
      }
    }

    return true;
  });

  // Sorting
  const sortedEntries = [...filteredEntries].sort((a, b) => {
    if (sortBy === "relevance") {
      return b.relevanceScore - a.relevanceScore;
    }
    if (sortBy === "newest") {
      return new Date(b.surfacedAt).getTime() - new Date(a.surfacedAt).getTime();
    }
    if (sortBy === "sources") {
      return b.sources.length - a.sources.length;
    }
    return 0;
  });

  return (
    <div id="feed-list-view" className="space-y-6">
      {/* Category Pills and Search Filter Header */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm space-y-4">
        {/* Top bar with Search & Sort */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="feed-search-input"
              type="text"
              placeholder="Search by topic, model, author, or keyword (e.g. MCP, RL, Claude)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            {/* Sort Selector */}
            <div className="flex items-center gap-1 text-xs bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-300">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-400 hidden sm:inline">Sort:</span>
              <select
                id="feed-sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-transparent text-slate-200 focus:outline-none cursor-pointer text-xs"
              >
                <option value="relevance" className="bg-slate-900">Highest Relevance</option>
                <option value="newest" className="bg-slate-900">Newest First</option>
                <option value="sources" className="bg-slate-900">Most Sources Clustered</option>
              </select>
            </div>

            {/* Layout Toggle */}
            <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-0.5">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === "grid" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
                title="Grid layout"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-1.5 rounded-lg text-xs transition-colors cursor-pointer ${
                  viewMode === "list" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200"
                }`}
                title="Single column layout"
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Category Filter Pills & Min Score Range Slider */}
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-1.5 overflow-x-auto w-full lg:w-auto pb-1 lg:pb-0 no-scrollbar">
            {categories.map((cat) => {
              const Icon = cat.icon;
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`cat-filter-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
                      : "bg-slate-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800"
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-400 w-full lg:w-auto justify-between lg:justify-end">
            <div className="flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-400" />
              <span>Min Match Score:</span>
              <span className="text-slate-200 font-semibold">{minScore}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="90"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-24 sm:w-32 accent-indigo-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Feed List or Grid */}
      {sortedEntries.length > 0 ? (
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 lg:grid-cols-2 gap-5"
              : "space-y-4 max-w-4xl mx-auto"
          }
        >
          {sortedEntries.map((entry) => (
            <FeedCard
              key={entry.id}
              entry={entry}
              onFeedback={onFeedback}
              onToggleBookmark={onToggleBookmark}
              onToggleRead={onToggleRead}
            />
          ))}
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950 text-indigo-400 flex items-center justify-center mx-auto border border-indigo-800">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-100 mb-1">No items match your filter</h3>
            <p className="text-xs text-slate-400">
              Try adjusting the minimum match score slider, selecting "All Curated", or clearing your search term.
            </p>
          </div>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setMinScore(50);
              setSearchQuery("");
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};
