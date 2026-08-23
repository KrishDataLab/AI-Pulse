import React, { useState } from "react";
import {
  Sliders,
  Sparkles,
  User,
  Plus,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Clock,
  Send,
  Save,
  CheckCircle2,
  Brain,
  History,
} from "lucide-react";
import { FeedbackRecord, InterestProfile, InterestTopic } from "../types";

interface ProfileManagerProps {
  profile: InterestProfile;
  feedbackHistory: FeedbackRecord[];
  onUpdateProfile: (updates: Partial<InterestProfile>) => Promise<void>;
  onAddTopic: (topic: { name: string; category: any; weight: number; keywords: string[] }) => Promise<void>;
  onDeleteTopic: (id: string) => Promise<void>;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({
  profile,
  feedbackHistory,
  onUpdateProfile,
  onAddTopic,
  onDeleteTopic,
}) => {
  const [bio, setBio] = useState(profile.bio);
  const [dailyLimit, setDailyLimit] = useState(profile.dailyItemLimit);
  const [threshold, setThreshold] = useState(profile.relevanceThreshold);
  const [digestTime, setDigestTime] = useState(profile.digestSendTime);
  const [email, setEmail] = useState(profile.emailRecipient || "");
  const [telegram, setTelegram] = useState(profile.telegramChatId || "");
  const [savedNotice, setSavedNotice] = useState(false);

  // New topic modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTopicName, setNewTopicName] = useState("");
  const [newTopicCategory, setNewTopicCategory] = useState<any>("research");
  const [newTopicWeight, setNewTopicWeight] = useState(1.2);
  const [newTopicKeywords, setNewTopicKeywords] = useState("");

  const handleSaveSettings = async () => {
    await onUpdateProfile({
      bio,
      dailyItemLimit: dailyLimit,
      relevanceThreshold: threshold,
      digestSendTime: digestTime,
      emailRecipient: email,
      telegramChatId: telegram,
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const handleWeightChange = async (topicId: string, newWeight: number) => {
    const updatedTopics = profile.topics.map((t) =>
      t.id === topicId ? { ...t, weight: Number(newWeight.toFixed(2)) } : t
    );
    await onUpdateProfile({ topics: updatedTopics });
  };

  const handleCreateTopic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTopicName.trim()) return;

    const keywords = newTopicKeywords
      .split(",")
      .map((k) => k.trim())
      .filter(Boolean);

    await onAddTopic({
      name: newTopicName.trim(),
      category: newTopicCategory,
      weight: newTopicWeight,
      keywords: keywords.length > 0 ? keywords : [newTopicName.toLowerCase()],
    });

    setNewTopicName("");
    setNewTopicKeywords("");
    setShowAddModal(false);
  };

  return (
    <div id="profile-manager-view" className="space-y-6 max-w-5xl mx-auto">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <Brain className="w-6 h-6 text-indigo-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-white tracking-tight">{profile.userName}</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800">
                Active Personalization Vector
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {profile.role}
            </p>
          </div>
        </div>

        <button
          onClick={handleSaveSettings}
          className="flex items-center justify-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/30 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Profile Preferences</span>
        </button>
      </div>

      {savedNotice && (
        <div className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Personalization preferences & topic weights successfully updated!</span>
        </div>
      )}

      {/* Interest Topics & Weight Matrix */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              <span>Personalization Topic Weights Matrix</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Every thumbs up/down incrementally tunes these weights (0.1 = low interest, 2.0 = critical priority).
            </p>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Focus Topic</span>
          </button>
        </div>

        {/* Topic Slider Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {profile.topics.map((topic) => (
            <div
              key={topic.id}
              className="bg-slate-950/80 border border-slate-800/90 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider block">
                    {topic.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-100">{topic.name}</h4>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-indigo-950 text-indigo-300 border border-indigo-800">
                    {topic.weight.toFixed(2)}x
                  </span>
                  <button
                    onClick={() => onDeleteTopic(topic.id)}
                    className="text-slate-500 hover:text-rose-400 p-1 transition-colors cursor-pointer"
                    title="Remove topic"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Slider */}
              <div className="space-y-1">
                <input
                  type="range"
                  min="0.2"
                  max="2.0"
                  step="0.05"
                  value={topic.weight}
                  onChange={(e) => handleWeightChange(topic.id, parseFloat(e.target.value))}
                  className="w-full accent-indigo-500 cursor-pointer"
                />
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                  <span>0.2 (Low)</span>
                  <span>1.0 (Neutral)</span>
                  <span>2.0 (High Priority)</span>
                </div>
              </div>

              {/* Feedback counts */}
              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400 border-t border-slate-900">
                <span className="flex items-center gap-1">
                  <ThumbsUp className="w-3 h-3 text-emerald-400" />
                  <span>{topic.feedbackUpCount} helpful</span>
                </span>
                <span className="flex items-center gap-1">
                  <ThumbsDown className="w-3 h-3 text-rose-400" />
                  <span>{topic.feedbackDownCount} skipped</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Projects Context & Delivery Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Background & Bio */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-400" />
            <span>Research & Project Context</span>
          </h3>

          <div className="space-y-2">
            <label className="text-xs text-slate-400 block font-medium">
              Profile Summary & Target Ambitions:
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs text-slate-400 block font-medium">
              Active Stated Projects (used for "Why This Matters" LLM prompt):
            </label>
            <ul className="space-y-1 text-xs text-slate-300">
              {profile.projectContexts.map((proj, idx) => (
                <li key={idx} className="bg-slate-950 p-2 rounded-lg border border-slate-800">
                  {proj}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Digest Limits & Dispatch Channels */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" />
            <span>Digest & Channel Routing</span>
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Daily Feed Cap (items):
              </label>
              <input
                type="number"
                min="5"
                max="30"
                value={dailyLimit}
                onChange={(e) => setDailyLimit(parseInt(e.target.value) || 15)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
              />
            </div>
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Min Score Threshold:
              </label>
              <input
                type="number"
                min="30"
                max="90"
                value={threshold}
                onChange={(e) => setThreshold(parseInt(e.target.value) || 50)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Scheduled Daily Push Time:
              </label>
              <input
                type="time"
                value={digestTime}
                onChange={(e) => setDigestTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Telegram Bot Chat ID:
              </label>
              <input
                type="text"
                value={telegram}
                onChange={(e) => setTelegram(e.target.value)}
                placeholder="@krishna_aipulse_bot"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block mb-1">
                Email Digest Recipient:
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="krishdatalabofficial@gmail.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Learning Log History */}
      {feedbackHistory && feedbackHistory.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-purple-400" />
            <span>Recent Feedback Learning Logs</span>
          </h3>

          <div className="space-y-2 max-h-48 overflow-y-auto">
            {feedbackHistory.map((rec) => (
              <div
                key={rec.id}
                className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2">
                  {rec.rating === "up" ? (
                    <ThumbsUp className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  ) : (
                    <ThumbsDown className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                  )}
                  <span className="text-slate-200 line-clamp-1">{rec.entryTitle}</span>
                </div>
                <span className="text-[10px] text-indigo-300 font-mono shrink-0">
                  {rec.rating === "up" ? "+0.06 weight" : "-0.08 weight"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Topic Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Add New Interest Topic</h3>

            <form onSubmit={handleCreateTopic} className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Topic Name:</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Diffusion Models in Robotics"
                  value={newTopicName}
                  onChange={(e) => setNewTopicName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Category:</label>
                <select
                  value={newTopicCategory}
                  onChange={(e) => setNewTopicCategory(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                >
                  <option value="research">Research</option>
                  <option value="models">New Models & Benchmarks</option>
                  <option value="tooling">Tooling & MCP</option>
                  <option value="industry">Industry News</option>
                  <option value="career">Career & Engineering</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Initial Weight (0.5 - 2.0):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  max="2.0"
                  value={newTopicWeight}
                  onChange={(e) => setNewTopicWeight(parseFloat(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">
                  Trigger Keywords (comma-separated):
                </label>
                <input
                  type="text"
                  placeholder="diffusion, policy, trajectory, robotics"
                  value={newTopicKeywords}
                  onChange={(e) => setNewTopicKeywords(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2 text-xs text-slate-200"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                >
                  Add Topic
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
