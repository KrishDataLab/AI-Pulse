import React, { useState } from "react";
import { FileText, Sparkles, Zap, RefreshCw, Layers, CheckCircle2, ArrowRight, ShieldAlert } from "lucide-react";
import { WeeklyDeepDive } from "../types";

interface WeeklyDeepDiveViewProps {
  deepDive: WeeklyDeepDive | null;
  onRegenerate: () => Promise<void>;
}

export const WeeklyDeepDiveView: React.FC<WeeklyDeepDiveViewProps> = ({ deepDive, onRegenerate }) => {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      await onRegenerate();
    } finally {
      setLoading(false);
    }
  };

  if (!deepDive) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4">
        <FileText className="w-10 h-10 text-indigo-400 mx-auto" />
        <h3 className="text-lg font-bold text-white">Loading Weekly Synthesis...</h3>
      </div>
    );
  }

  return (
    <div id="weekly-deepdive-view" className="space-y-6 max-w-4xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-gradient-to-br from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800">
              {deepDive.weekLabel}
            </span>
            <span className="text-xs text-slate-400">
              Executive AI Intelligence Synthesis
            </span>
          </div>

          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-medium text-slate-200 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>{loading ? "Synthesizing with Gemini..." : "Regenerate Synthesis"}</span>
          </button>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
          {deepDive.title}
        </h1>

        <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm sm:text-base text-slate-200 leading-relaxed font-normal">
          {deepDive.executiveSummary}
        </div>
      </div>

      {/* Strategic Themes */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-400" />
          <span>Core Strategic Themes This Week</span>
        </h2>

        <div className="grid grid-cols-1 gap-4">
          {deepDive.keyThemes.map((theme, idx) => (
            <div
              key={idx}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-base font-bold text-slate-100">
                  {idx + 1}. {theme.title}
                </h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-md font-semibold border ${
                    theme.impactLevel === "Transformative"
                      ? "bg-purple-950 text-purple-300 border-purple-800"
                      : "bg-indigo-950 text-indigo-300 border-indigo-800"
                  }`}
                >
                  {theme.impactLevel} Impact
                </span>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {theme.description}
              </p>

              {theme.referencedEntries && theme.referencedEntries.length > 0 && (
                <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-2 items-center">
                  <span className="text-[11px] text-slate-400 font-medium">Corroborated by:</span>
                  {theme.referencedEntries.map((ref, i) => (
                    <span
                      key={i}
                      className="text-[11px] text-slate-300 bg-slate-800 px-2 py-0.5 rounded border border-slate-700 truncate max-w-xs"
                    >
                      {ref.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Forward-Looking Weak Signals & Actionable Next Steps */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Emerging Weak Signals */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
            <Zap className="w-4 h-4" />
            <span>Emerging Signals & Shifts</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
            {deepDive.emergingSignals.map((signal, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <span className="text-amber-400 font-bold shrink-0">•</span>
                <span>{signal}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actionable Next Steps for Krishna */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tactical Advice for Krishna</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300">
            {deepDive.actionableInsightsForKrishna.map((action, idx) => (
              <li key={idx} className="flex items-start gap-2 leading-relaxed">
                <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-1" />
                <span>{action}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
