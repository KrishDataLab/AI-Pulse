import React, { useState } from "react";
import { Server, RefreshCw, CheckCircle, AlertCircle, Play, Pause, Activity, ShieldCheck } from "lucide-react";
import { SourceHealth, SourceType } from "../types";

interface SourceHealthCenterProps {
  sources: SourceHealth[];
  onTriggerIngest: (source?: SourceType) => Promise<void>;
  onToggleSource: (source: SourceType, enabled: boolean) => Promise<void>;
}

export const SourceHealthCenter: React.FC<SourceHealthCenterProps> = ({
  sources,
  onTriggerIngest,
  onToggleSource,
}) => {
  const [syncingSource, setSyncingSource] = useState<string | null>(null);
  const [syncAllLoading, setSyncAllLoading] = useState(false);

  const handleSyncSingle = async (source: SourceType) => {
    setSyncingSource(source);
    try {
      await onTriggerIngest(source);
    } finally {
      setSyncingSource(null);
    }
  };

  const handleSyncAll = async () => {
    setSyncAllLoading(true);
    try {
      await onTriggerIngest();
    } finally {
      setSyncAllLoading(false);
    }
  };

  const getStatusBadge = (status: SourceHealth["status"]) => {
    switch (status) {
      case "healthy":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
            <CheckCircle className="w-3 h-3" />
            <span>Healthy</span>
          </span>
        );
      case "syncing":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-800 animate-pulse">
            <RefreshCw className="w-3 h-3 animate-spin" />
            <span>Syncing</span>
          </span>
        );
      case "degraded":
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800">
            <AlertCircle className="w-3 h-3" />
            <span>Degraded</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400">
            <span>Idle</span>
          </span>
        );
    }
  };

  return (
    <div id="source-health-view" className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-800">
            <Server className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Ingestion Connectors & Source Health
            </h2>
            <p className="text-xs text-slate-400">
              Monitoring rate limits, sync intervals, and health across 7 autonomous ingestion feeds.
            </p>
          </div>
        </div>

        <button
          onClick={handleSyncAll}
          disabled={syncAllLoading}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncAllLoading ? "animate-spin" : ""}`} />
          <span>{syncAllLoading ? "Running All Connectors..." : "Sync All Sources Now"}</span>
        </button>
      </div>

      {/* Grid of Sources */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sources.map((source) => {
          const isSyncing = syncingSource === source.source || syncAllLoading;
          return (
            <div
              key={source.source}
              id={`source-card-${source.source}`}
              className={`bg-slate-900/90 border rounded-2xl p-5 space-y-4 transition-all ${
                source.enabled ? "border-slate-800" : "border-slate-800/40 opacity-60"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                    {source.category}
                  </span>
                  <h3 className="text-sm font-bold text-slate-100 mt-0.5">
                    {source.name}
                  </h3>
                </div>
                {getStatusBadge(isSyncing ? "syncing" : source.status)}
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Ingested</span>
                  <span className="font-semibold text-slate-200">{source.itemsIngested} items</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Interval</span>
                  <span className="font-semibold text-slate-200">Every {source.fetchIntervalHours}h</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Errors</span>
                  <span className={`font-semibold ${source.errorCount > 0 ? "text-rose-400" : "text-emerald-400"}`}>
                    {source.errorCount}
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <span className="text-[11px] text-slate-400">
                  Last Sync: {new Date(source.lastRunAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onToggleSource(source.source, !source.enabled)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors cursor-pointer"
                    title={source.enabled ? "Disable Connector" : "Enable Connector"}
                  >
                    {source.enabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                  </button>

                  <button
                    onClick={() => handleSyncSingle(source.source)}
                    disabled={isSyncing || !source.enabled}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-lg font-medium transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3 h-3 ${isSyncing ? "animate-spin" : ""}`} />
                    <span>Sync</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
