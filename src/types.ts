export type SourceType =
  | 'arxiv'
  | 'hackernews'
  | 'reddit'
  | 'youtube'
  | 'newsapi'
  | 'producthunt'
  | 'company_blog';

export type ContentType =
  | 'news'
  | 'paper'
  | 'video'
  | 'discussion'
  | 'product'
  | 'tool';

export interface SourceReference {
  source: SourceType;
  url: string;
  sourceTitle?: string;
  publishedAt: string;
  authorOrChannel?: string;
  engagement?: {
    upvotes?: number;
    comments?: number;
    views?: string;
  };
}

export interface RawItem {
  id: string;
  source: SourceType;
  sourceUrl: string;
  title: string;
  summary: string;
  contentType: ContentType;
  publishedAt: string;
  ingestedAt: string;
  authorOrChannel?: string;
  rawMetadata?: Record<string, any>;
  score?: number;
}

export interface Cluster {
  id: string;
  canonicalTitle: string;
  itemIds: string[];
  mergedSources: SourceType[];
  primaryUrl: string;
  additionalUrls: string[];
  createdAt: string;
}

export interface FeedEntry {
  id: string;
  clusterId: string;
  canonicalTitle: string;
  summary: string;
  contentType: ContentType;
  category: 'news' | 'paper' | 'video' | 'tool' | 'discussion';
  sources: SourceReference[];
  relevanceScore: number; // 0 - 100
  whyItMatters: string;
  keyTakeaways: string[];
  matchedTopics: string[];
  surfacedAt: string;
  read: boolean;
  bookmarked: boolean;
  feedback?: 'up' | 'down';
  feedbackReason?: string;
  deliveredVia: ('dashboard' | 'telegram' | 'email')[];
  trendClusterName?: string;
}

export interface InterestTopic {
  id: string;
  name: string;
  category: 'industry' | 'models' | 'research' | 'tooling' | 'career';
  weight: number; // 0.1 - 2.0
  feedbackUpCount: number;
  feedbackDownCount: number;
  keywords: string[];
}

export interface InterestProfile {
  userName: string;
  role: string;
  bio: string;
  projectContexts: string[];
  topics: InterestTopic[];
  dailyItemLimit: number;
  relevanceThreshold: number;
  digestSendTime: string;
  autoTuneEnabled: boolean;
  telegramChatId?: string;
  emailRecipient?: string;
  updatedAt: string;
}

export interface FeedbackRecord {
  id: string;
  feedEntryId: string;
  entryTitle: string;
  rating: 'up' | 'down';
  topicsAffected: string[];
  weightDeltas: Record<string, number>;
  timestamp: string;
}

export interface SourceHealth {
  source: SourceType;
  name: string;
  category: string;
  status: 'healthy' | 'degraded' | 'syncing' | 'idle';
  lastRunAt: string;
  itemsIngested: number;
  errorCount: number;
  lastErrorMessage?: string;
  enabled: boolean;
  fetchIntervalHours: number;
}

export interface WeeklyDeepDive {
  id: string;
  weekLabel: string;
  title: string;
  executiveSummary: string;
  keyThemes: {
    title: string;
    description: string;
    impactLevel: 'High' | 'Transformative' | 'Strategic';
    referencedEntries: { id: string; title: string; source: SourceType }[];
  }[];
  emergingSignals: string[];
  actionableInsightsForKrishna: string[];
  generatedAt: string;
}

export interface TrendCluster {
  id: string;
  topicName: string;
  description: string;
  sourceCount: number;
  sources: SourceType[];
  entryCount: number;
  velocityScore: number; // 0 - 100
  firstDetected: string;
  topEntryTitles: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  groundedSources?: { title: string; url: string; score: number; source: SourceType }[];
  timestamp: string;
}

export interface SystemStats {
  totalIngestedToday: number;
  curatedFeedCount: number;
  timeSavedMinutes: number;
  relevanceAccuracyPercent: number;
  activeSourcesCount: number;
  lastPipelineRun: string;
}
