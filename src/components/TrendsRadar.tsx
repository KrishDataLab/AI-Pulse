import React from "react";
import { TrendingUp, Layers, Sparkles, Zap, ArrowUpRight, Flame } from "lucide-react";
import { TrendCluster } from "../types";

interface TrendsRadarProps {
  trends: TrendCluster[];
  onSelectTopic: (topicName: string) => void;
}

export const TrendsRadar: React.FC<TrendsRadarProps> = ({ trends, onSelectTopic }) => {
  return (
    <div id="trends-radar-view" className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Topic Convergence & Emerging Signal Radar
            </h2>
            <p className="text-xs text-slate-400">
              Autonomous detection of topics where ≥2 independent sources (papers, launches, discussions) converge within 48h.
            </p>
          </div>
        </div>
      </div>

      {/* Grid of Trend Clusters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {trends.map((trend) => (
          <div
            key={trend.id}
            id={`trend-card-${trend.id}`}
            className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4 hover:border-slate-700 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>Velocity: {trend.velocityScore}/100</span>
                </span>
                <span className="text-[11px] text-slate-400">{trend.firstDetected}</span>
              </div>

              <h3 className="text-base font-bold text-slate-100 leading-snug">
                {trend.topicName}
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {trend.description}
              </p>

              {/* Converging Sources Badges */}
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Converged Sources ({trend.sources.length}):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {trend.sources.map((src, i) => (
                    <span
                      key={i}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-indigo-300 border border-slate-700"
                    >
                      {src.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>

              {/* Top Converging Stories */}
              <div className="space-y-1 pt-2">
                <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                  Recent Corroborating Items:
                </span>
                <ul className="space-y-1 text-xs text-slate-300">
                  {trend.topEntryTitles.map((title, idx) => (
                    <li key={idx} className="line-clamp-1 flex items-center gap-1.5 text-slate-300">
                      <span className="w-1 h-1 rounded-full bg-indigo-400" />
                      <span>{title}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <button
              onClick={() => onSelectTopic(trend.topicName)}
              className="w-full mt-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Filter Feed For This Topic</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
