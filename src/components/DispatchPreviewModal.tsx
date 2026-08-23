import React, { useState } from "react";
import { Send, Mail, CheckCircle2, MessageSquare, Copy, ExternalLink, Sparkles, RefreshCw } from "lucide-react";
import { FeedEntry } from "../types";

interface DispatchPreviewModalProps {
  telegramPreview: { messageText: string; itemCount: number } | null;
  topEntries: FeedEntry[];
  emailRecipient: string;
  telegramChatId: string;
  sendTime: string;
  onSendTestDispatch: (channel: "telegram" | "email" | "all") => Promise<{ message: string }>;
}

export const DispatchPreviewModal: React.FC<DispatchPreviewModalProps> = ({
  telegramPreview,
  topEntries,
  emailRecipient,
  telegramChatId,
  sendTime,
  onSendTestDispatch,
}) => {
  const [activeChannel, setActiveChannel] = useState<"telegram" | "email">("telegram");
  const [copied, setCopied] = useState(false);
  const [sending, setSending] = useState(false);
  const [dispatchStatus, setDispatchStatus] = useState<string | null>(null);

  const handleSendTest = async (channel: "telegram" | "email" | "all") => {
    setSending(true);
    try {
      const res = await onSendTestDispatch(channel);
      setDispatchStatus(res.message);
      setTimeout(() => setDispatchStatus(null), 4000);
    } finally {
      setSending(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (telegramPreview) {
      navigator.clipboard.writeText(telegramPreview.messageText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div id="dispatch-preview-view" className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-950 text-sky-400 flex items-center justify-center border border-sky-800">
            <Send className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white tracking-tight">
              Multi-Channel Digest Dispatch Previews
            </h2>
            <p className="text-xs text-slate-400">
              Autonomous daily delivery scheduled at {sendTime} AM via Telegram Bot & HTML Email.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSendTest(activeChannel)}
            disabled={sending}
            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
          >
            <Send className={`w-3.5 h-3.5 ${sending ? "animate-spin" : ""}`} />
            <span>{sending ? "Dispatching..." : `Trigger Test ${activeChannel === "telegram" ? "Telegram" : "Email"}`}</span>
          </button>
        </div>
      </div>

      {dispatchStatus && (
        <div className="bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs px-4 py-3 rounded-2xl flex items-center gap-2 animate-fade-in shadow-lg">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{dispatchStatus}</span>
        </div>
      )}

      {/* Channel Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          id="dispatch-tab-telegram"
          onClick={() => setActiveChannel("telegram")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeChannel === "telegram"
              ? "bg-sky-600 text-white shadow-sm shadow-sky-600/30"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Telegram Bot Push ({telegramChatId})</span>
        </button>

        <button
          id="dispatch-tab-email"
          onClick={() => setActiveChannel("email")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
            activeChannel === "email"
              ? "bg-indigo-600 text-white shadow-sm shadow-indigo-600/30"
              : "bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800"
          }`}
        >
          <Mail className="w-4 h-4" />
          <span>HTML Email Digest ({emailRecipient})</span>
        </button>
      </div>

      {/* Previews */}
      {activeChannel === "telegram" ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Telegram Message Bubble Simulator
            </span>
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 bg-slate-800 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? "Copied!" : "Copy Telegram Markdown"}</span>
            </button>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 rounded-2xl p-6 font-sans max-w-2xl mx-auto text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-line shadow-inner">
            {telegramPreview?.messageText || "Generating Telegram preview..."}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              HTML Email Digest Layout
            </span>
            <span className="text-xs text-slate-400">Recipient: {emailRecipient}</span>
          </div>

          {/* Email Newsletter Mock */}
          <div className="bg-white text-slate-900 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl space-y-6">
            <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
              <div>
                <div className="text-xl font-black text-indigo-700 tracking-tight">AI PULSE</div>
                <div className="text-xs text-slate-500">
                  Daily Curated Intelligence for Krishna
                </div>
              </div>
              <div className="text-right text-xs text-slate-500 font-medium">
                {new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </div>
            </div>

            <div className="text-xs text-slate-700 leading-relaxed">
              Good morning Krishna! Here are your top {topEntries.slice(0, 5).length} personalized AI stories across multi-agent RL, MCP tooling, and frontier model releases for today.
            </div>

            <div className="space-y-4">
              {topEntries.slice(0, 5).map((entry, idx) => (
                <div key={entry.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-indigo-700 uppercase tracking-wider text-[10px]">
                      {entry.sources[0]?.source} · {entry.category}
                    </span>
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                      {entry.relevanceScore}% Match
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    <a href={entry.sources[0]?.url} target="_blank" rel="noopener noreferrer" className="hover:text-indigo-600 underline">
                      {entry.canonicalTitle}
                    </a>
                  </h3>

                  <div className="p-2.5 bg-indigo-50/80 rounded-lg text-xs text-indigo-950 border-l-2 border-indigo-600 font-medium">
                    🎯 <strong>Why it matters:</strong> {entry.whyItMatters}
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {entry.summary}
                  </p>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-4 text-center text-xs text-slate-400">
              AI Pulse Intelligence Engine · Custom configured for Krishna
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
