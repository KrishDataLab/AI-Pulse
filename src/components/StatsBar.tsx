import React from "react";
import { SystemStats } from "../types";
import { Zap, Clock, Target, Radio, Bell } from "lucide-react";

interface StatsBarProps {
  stats: SystemStats | null;
  digestTime: string;
  onOpenDigest: () => void;
  onOpenDispatch: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({
  stats,
  digestTime,
  onOpenDigest,
  onOpenDispatch,
}) => {
  if (!stats) return null;

  return (
    <div id="stats-bar" className="bg-slate-900 border-b border-slate-800 text-slate-200 text-xs py-2 px-4">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="flex items-center gap-1.5 font-medium text-slate-300">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Today's Curated Feed:</span>
            <span className="text-white font-semibold">{stats.curatedFeedCount} items</span>
            <span className="text-slate-500">({stats.totalIngestedToday} scanned)</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Time Saved:</span>
            <span className="text-emerald-300 font-semibold">~{stats.timeSavedMinutes} mins</span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-slate-400">
            <Target className="w-3.5 h-3.5 text-indigo-400" />
            <span>Relevance Accuracy:</span>
            <span className="text-indigo-300 font-semibold">{stats.relevanceAccuracyPercent}%</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-slate-400">
            <Radio className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
            <span>Active Connectors:</span>
            <span className="text-sky-300 font-semibold">{stats.activeSourcesCount} sources synced</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="stats-start-digest-btn"
            onClick={onOpenDigest}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded-md font-medium transition-colors shadow-sm cursor-pointer"
          >
            <Zap className="w-3 h-3 text-amber-300" />
            <span>Start 5-Min Digest</span>
          </button>

          <button
            id="stats-dispatch-preview-btn"
            onClick={onOpenDispatch}
            className="flex items-center gap-1 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
            title="Preview Telegram & Email Dispatch"
          >
            <Bell className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Digest at {digestTime}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
