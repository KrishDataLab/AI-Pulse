import React, { useState } from "react";
import {
  ThumbsUp,
  ThumbsDown,
  Bookmark,
  ExternalLink,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  Copy,
  Share2,
  Layers,
  FileText,
  Play,
  Cpu,
  Globe,
  MessageSquare,
} from "lucide-react";
import { FeedEntry, SourceType } from "../types";

interface FeedCardProps {
  entry: FeedEntry;
  onFeedback: (id: string, rating: "up" | "down") => void;
  onToggleBookmark: (id: string) => void;
  onToggleRead: (id: string) => void;
}

export const FeedCard: React.FC<FeedCardProps> = ({
  entry,
  onFeedback,
  onToggleBookmark,
  onToggleRead,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const [feedbackFeedbackNotice, setFeedbackFeedbackNotice] = useState<string | null>(null);

  const handleFeedback = (rating: "up" | "down") => {
    onFeedback(entry.id, rating);
    if (rating === "up") {
      setFeedbackFeedbackNotice("+0.06 topic weight updated!");
    } else {
      setFeedbackFeedbackNotice("-0.08 topic weight adjusted");
    }
    setTimeout(() => setFeedbackFeedbackNotice(null), 3000);
  };

  const handleCopy = () => {
    const text = `${entry.canonicalTitle}\n\nWhy it matters: ${entry.whyItMatters}\n\nLink: ${entry.sources[0]?.url}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatSource = (src: SourceType) => {
    switch (src) {
      case "arxiv":
        return "arXiv Paper";
      case "hackernews":
        return "Hacker News";
      case "reddit":
        return "Reddit ML";
      case "youtube":
        return "YouTube";
      case "producthunt":
        return "Product Hunt";
      case "company_blog":
        return "Official Blog";
      case "newsapi":
        return "Tech News";
      default:
        return src;
    }
  };

  const getContentTypeIcon = (type: FeedEntry["contentType"]) => {
    switch (type) {
      case "paper":
        return <FileText className="w-3.5 h-3.5 text-purple-400" />;
      case "video":
        return <Play className="w-3.5 h-3.5 text-rose-400" />;
      case "tool":
      case "product":
        return <Cpu className="w-3.5 h-3.5 text-emerald-400" />;
      case "discussion":
        return <MessageSquare className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Globe className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  const formatTimeAgo = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    if (diffHours < 1) return "Just now";
    if (diffHours === 1) return "1h ago";
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  const scoreBadgeColor =
    entry.relevanceScore >= 92
      ? "bg-emerald-950/80 text-emerald-300 border-emerald-700/60"
      : entry.relevanceScore >= 80
      ? "bg-indigo-950/80 text-indigo-300 border-indigo-700/60"
      : "bg-slate-900 text-slate-300 border-slate-700";

  return (
    <article
      id={`feed-card-${entry.id}`}
      className={`rounded-xl border transition-all duration-200 ${
        entry.read
          ? "bg-slate-900/40 border-slate-800/60 opacity-85"
          : "bg-slate-900/90 border-slate-800 hover:border-slate-700 hover:shadow-lg hover:shadow-indigo-950/20"
      }`}
    >
      <div className="p-5">
        {/* Top Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Content Type Badge */}
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/90 border border-slate-700/80 text-slate-200">
              {getContentTypeIcon(entry.contentType)}
              <span className="capitalize">{entry.category || entry.contentType}</span>
            </span>

            {/* Primary Source Badge */}
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800/60 text-slate-300 border border-slate-700/50">
              {formatSource(entry.sources[0]?.source || "newsapi")}
            </span>

            {/* Clustered Merged Sources Badge */}
            {entry.sources.length > 1 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-indigo-950 text-indigo-300 border border-indigo-800">
                <Layers className="w-3 h-3" />
                <span>Merged {entry.sources.length} sources</span>
              </span>
            )}

            <span className="text-xs text-slate-400">
              {formatTimeAgo(entry.surfacedAt)}
            </span>
          </div>

          {/* Relevance Score Badge */}
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${scoreBadgeColor}`}
              title="Personalized Relevance Score based on Krishna's Profile"
            >
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>{entry.relevanceScore}% Match</span>
            </span>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-lg font-bold text-slate-100 leading-snug mb-2 group">
          <a
            href={entry.sources[0]?.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-indigo-300 transition-colors inline-flex items-start gap-1.5"
          >
            <span>{entry.canonicalTitle}</span>
            <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-300 shrink-0 mt-1" />
          </a>
        </h2>

        {/* Highlighted "Why This Matters for Krishna" Callout */}
        <div className="my-3.5 p-3.5 rounded-lg bg-gradient-to-r from-indigo-950/70 via-slate-900/80 to-slate-900 border-l-4 border-l-indigo-500 border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Why this matters for your profile:</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed font-normal">
            {entry.whyItMatters}
          </p>
        </div>

        {/* Summary */}
        <p className="text-sm text-slate-300 leading-relaxed line-clamp-2 mb-3">
          {entry.summary}
        </p>

        {/* Expandable Key Takeaways & Multiple Sources */}
        {expanded && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-3">
            {entry.keyTakeaways && entry.keyTakeaways.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Key Technical Insights
                </h4>
                <ul className="list-disc list-inside space-y-1 text-xs text-slate-300">
                  {entry.keyTakeaways.map((point, idx) => (
                    <li key={idx} className="leading-normal">
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {entry.sources.length > 1 && (
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Cluster Sources & Coverage
                </h4>
                <div className="flex flex-wrap gap-2">
                  {entry.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-indigo-300 hover:text-indigo-200 bg-slate-800 px-2 py-1 rounded border border-slate-700 hover:border-slate-600 transition-colors"
                    >
                      <span>{formatSource(src.source)}</span>
                      {src.sourceTitle && <span className="text-slate-400">({src.sourceTitle})</span>}
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Matched Topics Tags */}
        <div className="flex flex-wrap items-center gap-1.5 mt-3">
          {entry.matchedTopics.map((topic, i) => (
            <span
              key={i}
              className="text-[11px] font-medium text-slate-400 bg-slate-800/50 px-2 py-0.5 rounded border border-slate-800"
            >
              #{topic}
            </span>
          ))}

          <button
            onClick={() => setExpanded(!expanded)}
            className="ml-auto text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-0.5 cursor-pointer"
          >
            <span>{expanded ? "Show Less" : "Technical Details"}</span>
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Action Footer */}
      <div className="px-5 py-3 bg-slate-950/70 border-t border-slate-800/80 rounded-b-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Feedback loop with real weight updates */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px] mr-1">Relevance:</span>
          <button
            id={`feedback-up-${entry.id}`}
            onClick={() => handleFeedback("up")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              entry.feedback === "up"
                ? "bg-emerald-950 text-emerald-400 border border-emerald-700"
                : "text-slate-400 hover:text-emerald-400 hover:bg-slate-800"
            }`}
            title="Helpful & Highly Relevant (+Weight)"
          >
            <ThumbsUp className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Relevant</span>
          </button>

          <button
            id={`feedback-down-${entry.id}`}
            onClick={() => handleFeedback("down")}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 ${
              entry.feedback === "down"
                ? "bg-rose-950 text-rose-400 border border-rose-700"
                : "text-slate-400 hover:text-rose-400 hover:bg-slate-800"
            }`}
            title="Not Relevant (-Weight)"
          >
            <ThumbsDown className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Less</span>
          </button>

          {feedbackFeedbackNotice && (
            <span className="text-[11px] text-indigo-300 font-medium animate-fade-in ml-1">
              {feedbackFeedbackNotice}
            </span>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="flex items-center gap-2">
          <button
            id={`read-toggle-${entry.id}`}
            onClick={() => onToggleRead(entry.id)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded transition-colors cursor-pointer ${
              entry.read
                ? "text-emerald-400 bg-emerald-950/40 border border-emerald-900"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
            title={entry.read ? "Mark unread" : "Mark read"}
          >
            <CheckCircle className="w-3.5 h-3.5" />
            <span>{entry.read ? "Read" : "Mark Read"}</span>
          </button>

          <button
            id={`bookmark-toggle-${entry.id}`}
            onClick={() => onToggleBookmark(entry.id)}
            className={`p-1.5 rounded transition-colors cursor-pointer ${
              entry.bookmarked
                ? "text-amber-400 bg-amber-950/40 border border-amber-800"
                : "text-slate-400 hover:text-amber-400 hover:bg-slate-800"
            }`}
            title={entry.bookmarked ? "Bookmarked" : "Save for later"}
          >
            <Bookmark className={`w-3.5 h-3.5 ${entry.bookmarked ? "fill-amber-400" : ""}`} />
          </button>

          <button
            id={`copy-summary-${entry.id}`}
            onClick={handleCopy}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-colors cursor-pointer"
            title="Copy summary & reason"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </article>
  );
};
