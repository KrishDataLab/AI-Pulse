import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  ExternalLink,
  Clock,
  Zap,
  Check,
  Share2,
  RefreshCw,
} from "lucide-react";
import { FeedEntry } from "../types";

interface DigestReaderProps {
  entries: FeedEntry[];
  onFeedback: (id: string, rating: "up" | "down") => void;
  onToggleBookmark: (id: string) => void;
  onToggleRead: (id: string) => void;
  onClose: () => void;
  onOpenDispatch: () => void;
}

export const DigestReader: React.FC<DigestReaderProps> = ({
  entries,
  onFeedback,
  onToggleBookmark,
  onToggleRead,
  onClose,
  onOpenDispatch,
}) => {
  const digestItems = entries.slice(0, 15);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  const currentItem = digestItems[currentIndex];
  const progressPercent = Math.round(((currentIndex + 1) / digestItems.length) * 100);

  useEffect(() => {
    if (isCompleted) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#6366f1", "#38bdf8", "#34d399", "#f59e0b"],
      });
    }
  }, [isCompleted]);

  const handleNext = () => {
    if (currentItem && !currentItem.read) {
      onToggleRead(currentItem.id);
    }
    if (currentIndex < digestItems.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleFeedback = (rating: "up" | "down") => {
    if (!currentItem) return;
    onFeedback(currentItem.id, rating);
    setFeedbackNotice(rating === "up" ? "+0.06 topic weight updated" : "-0.08 topic weight adjusted");
    setTimeout(() => setFeedbackNotice(null), 2500);
  };

  if (digestItems.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 text-center max-w-xl mx-auto space-y-4">
        <Sparkles className="w-10 h-10 text-indigo-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">No Digest Items Available</h2>
        <p className="text-sm text-slate-400">
          Your daily digest is currently empty. Run the ingestion pipeline to fetch new stories!
        </p>
        <button
          onClick={onClose}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer"
        >
          Return to Feed
        </button>
      </div>
    );
  }

  if (isCompleted) {
    return (
      <div id="digest-completed-view" className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center max-w-2xl mx-auto space-y-6 shadow-2xl">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 mb-2">
            5-Minute Scan Complete
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            You're All Caught Up, Krishna!
          </h2>
          <p className="text-sm text-slate-300 mt-2 max-w-md mx-auto">
            You just reviewed the top {digestItems.length} highest-signal AI industry stories, research papers, and MCP tooling updates.
          </p>
        </div>

        {/* Impact Metric Cards */}
        <div className="grid grid-cols-3 gap-3 py-3 max-w-lg mx-auto">
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
            <div className="text-2xl font-black text-emerald-400">~38m</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Time Saved</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
            <div className="text-2xl font-black text-indigo-400">{digestItems.length}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Items Digested</div>
          </div>
          <div className="bg-slate-950/80 border border-slate-800 p-3.5 rounded-2xl">
            <div className="text-2xl font-black text-amber-400">96%</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Top Match</div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <button
            id="digest-return-feed-btn"
            onClick={onClose}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            Explore Full Feed
          </button>

          <button
            id="digest-open-dispatch-btn"
            onClick={onOpenDispatch}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl transition-colors cursor-pointer"
          >
            Preview Telegram / Email Push
          </button>
        </div>
      </div>
    );
  }

  return (
    <div id="digest-reader-view" className="max-w-3xl mx-auto space-y-4">
      {/* Top Header with Progress Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600/20 text-indigo-400 flex items-center justify-center">
              <Zap className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Daily 5-Min Digest Mode
              </span>
              <div className="text-sm font-bold text-slate-200">
                Story {currentIndex + 1} of {digestItems.length}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-400">
              {progressPercent}% Completed
            </span>
            <button
              onClick={onClose}
              className="text-xs text-slate-400 hover:text-slate-200 bg-slate-800 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
            >
              Exit Digest
            </button>
          </div>
        </div>

        {/* Progress bar line */}
        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
          <div
            className="bg-gradient-to-r from-indigo-500 to-sky-400 h-full transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Reader Card */}
      {currentItem && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl relative overflow-hidden">
          {/* Top metadata */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 rounded-md text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800 uppercase tracking-wider">
                {currentItem.category || currentItem.contentType}
              </span>
              <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 text-slate-300">
                {currentItem.sources[0]?.sourceTitle || currentItem.sources[0]?.source}
              </span>
              {currentItem.sources.length > 1 && (
                <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-950 text-emerald-300 border border-emerald-800">
                  {currentItem.sources.length} sources merged
                </span>
              )}
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>{currentItem.relevanceScore}% Match</span>
            </span>
          </div>

          {/* Canonical Title */}
          <h2 className="text-xl sm:text-2xl font-bold text-slate-100 leading-snug">
            {currentItem.canonicalTitle}
          </h2>

          {/* High-priority "Why This Matters" Container */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-950/80 via-slate-900 to-slate-900 border-l-4 border-l-indigo-400 border border-slate-800 shadow-inner">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-300 mb-1.5 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Personalized Take for Krishna:</span>
            </div>
            <p className="text-base text-slate-100 font-medium leading-relaxed">
              {currentItem.whyItMatters}
            </p>
          </div>

          {/* Summary */}
          <div className="text-sm text-slate-300 leading-relaxed">
            {currentItem.summary}
          </div>

          {/* Key Takeaways */}
          {currentItem.keyTakeaways && currentItem.keyTakeaways.length > 0 && (
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Core Takeaways
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-xs sm:text-sm text-slate-300">
                {currentItem.keyTakeaways.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Row */}
          <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleFeedback("up")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentItem.feedback === "up"
                    ? "bg-emerald-950 text-emerald-300 border border-emerald-700"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>Relevant</span>
              </button>

              <button
                onClick={() => handleFeedback("down")}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                  currentItem.feedback === "down"
                    ? "bg-rose-950 text-rose-300 border border-rose-700"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                <span>Skip</span>
              </button>

              <button
                onClick={() => onToggleBookmark(currentItem.id)}
                className={`p-2 rounded-xl text-xs transition-colors cursor-pointer ${
                  currentItem.bookmarked
                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                    : "bg-slate-800 hover:bg-slate-700 text-slate-300"
                }`}
                title="Bookmark for later"
              >
                <Bookmark className={`w-4 h-4 ${currentItem.bookmarked ? "fill-amber-400" : ""}`} />
              </button>

              {feedbackNotice && (
                <span className="text-xs text-indigo-300 font-medium ml-1">
                  {feedbackNotice}
                </span>
              )}
            </div>

            <a
              href={currentItem.sources[0]?.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:text-indigo-200 bg-slate-800 hover:bg-slate-700 px-3.5 py-2 rounded-xl font-medium transition-colors"
            >
              <span>Read Original Source</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      )}

      {/* Bottom Step Navigation */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:pointer-events-none text-slate-200 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 transition-all cursor-pointer"
        >
          <span>{currentIndex === digestItems.length - 1 ? "Finish Daily Digest" : "Next Story"}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
