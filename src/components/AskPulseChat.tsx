import React, { useState } from "react";
import { MessageSquareText, Send, Sparkles, User, Bot, ExternalLink, RefreshCw } from "lucide-react";
import { ChatMessage } from "../types";

interface AskPulseChatProps {
  onSendMessage: (msg: string) => Promise<{ text: string; groundedSources?: any[] }>;
}

export const AskPulseChat: React.FC<AskPulseChatProps> = ({ onSendMessage }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome-1",
      role: "assistant",
      content:
        "Hey Krishna! I'm your AI Pulse research partner, grounded in all currently scanned news, arXiv papers, Hacker News discussions, and MCP releases. Ask me anything about recent shifts in multi-agent RL, frontier models, agentic protocols, or AI engineering career trends!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const promptChips = [
    "What happened in MCP & Agent tooling this week?",
    "Are there any multi-agent RL breakthroughs relevant to GridCharge-RL?",
    "Compare Claude 3.7 Sonnet hybrid reasoning vs DeepSeek-R1",
    "What skills are high-tier AI/ML engineering roles looking for?",
  ];

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: query,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const response = await onSendMessage(query);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: response.text,
        groundedSources: response.groundedSources,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I ran into an issue querying the database. Please try again.",
          timestamp: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="ask-pulse-chat-view" className="max-w-4xl mx-auto space-y-4">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-950 text-purple-400 flex items-center justify-center border border-purple-800">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white">Ask AI Pulse</h2>
            <p className="text-xs text-slate-400">
              Grounded AI reasoning over your personal ingested stream
            </p>
          </div>
        </div>
      </div>

      {/* Chat Messages Log */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-6 min-h-[420px] max-h-[550px] overflow-y-auto space-y-4 shadow-sm">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white"
                  : "bg-purple-950 text-purple-300 border border-purple-800"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-2 ${
                msg.role === "user"
                  ? "bg-indigo-600 text-white rounded-tr-none"
                  : "bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none"
              }`}
            >
              <div className="whitespace-pre-line">{msg.content}</div>

              {/* Grounded Citations if available */}
              {msg.groundedSources && msg.groundedSources.length > 0 && (
                <div className="pt-2.5 mt-2 border-t border-slate-800/80 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                    Grounded Feed Citations:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.groundedSources.map((src, i) => (
                      <a
                        key={i}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] text-indigo-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700 hover:border-slate-500 transition-colors"
                      >
                        <span className="truncate max-w-[180px]">{src.title}</span>
                        <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-purple-950 text-purple-300 flex items-center justify-center border border-purple-800">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-slate-400 flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-purple-400" />
              <span>Analyzing feed & synthesizing response for Krishna...</span>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Prompt Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {promptChips.map((chip, i) => (
          <button
            key={i}
            onClick={() => handleSend(chip)}
            className="text-xs whitespace-nowrap bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-3 py-1.5 rounded-full transition-colors cursor-pointer"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-2 flex items-center gap-2">
        <input
          id="ask-pulse-input"
          type="text"
          placeholder="Ask a question about today's AI releases, papers, or career signals..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="flex-1 bg-transparent px-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none"
        />
        <button
          id="ask-pulse-send-btn"
          onClick={() => handleSend()}
          disabled={!input.trim() || loading}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white rounded-xl transition-colors cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
