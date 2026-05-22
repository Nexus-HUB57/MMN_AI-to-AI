import axios, { AxiosInstance } from "axios";

interface SocialMediaConfig {
  platform: "instagram" | "twitter" | "linkedin" | "tiktok";
  accessToken: string;
  refreshToken?: string;
  userId?: string;
  businessAccountId?: string;
}

interface PostContent {
  text: string;
  mediaUrls?: string[];
  hashtags?: string[];
  mentions?: string[];
  scheduledFor?: Date;
}

interface PostResult {
  success: boolean;
  postId?: string;
  url?: string;
  platform: string;
  error?: string;
}

interface AnalyticsData {
  views: number;
  likes: number;
  shares: number;
  comments: number;
  engagementRate: number;
  reach: number;
  impressions: number;
}

const API_ENDPOINTS = {
  instagram: { base: "https://graph.instagram.com/v18.0", media: "/me/media", insights: "/insights" },
  twitter: { base: "https://api.twitter.com/2", tweets: "/tweets", analytics: "/analytics/protected/query" },
  linkedin: { base: "https://api.linkedin.com/v2", posts: "/ugcPosts", analytics: "/organizationalEntityAcls" },
  tiktok: { base: "https://open.tiktokapis.com/v1", videos: "/video/upload", analytics: "/video/query" },
};

class InstagramIntegration {
  private client: AxiosInstance;
  private accessToken: string;
  private businessAccountId: string;

  constructor(accessToken: string, businessAccountId: string) {
    this.accessToken = accessToken;
    this.businessAccountId = businessAccountId;
    this.client = axios.create({ baseURL: API_ENDPOINTS.instagram.base, headers: { Authorization: `Bearer ${accessToken}` } });
  }

  async publishPost(content: PostContent): Promise<PostResult> {
    try {
      let mediaIds: string[] = [];
      if (content.mediaUrls && content.mediaUrls.length > 0) mediaIds = await this.uploadMedia(content.mediaUrls);
      const caption = [content.text, ...(content.hashtags || []), ...(content.mentions || [])].join(" ");
      const response = await this.client.post(`/${this.businessAccountId}${API_ENDPOINTS.instagram.media}`, { image_url: mediaIds[0] || undefined, caption, user_tags: content.mentions });
      return { success: true, postId: response.data.id, platform: "instagram" };
    } catch (error: any) {
      console.error("[Instagram] Erro ao publicar:", error.message);
      return { success: false, platform: "instagram", error: error.message };
    }
  }

  async uploadMedia(mediaUrls: string[]): Promise<string[]> {
    const mediaIds: string[] = [];
    for (const url of mediaUrls) {
      try {
        const response = await this.client.post(`/${this.businessAccountId}${API_ENDPOINTS.instagram.media}`, { image_url: url });
        mediaIds.push(response.data.id);
      } catch (error) { console.error("[Instagram] Erro ao fazer upload de midia:", error); }
    }
    return mediaIds;
  }

  async getAnalytics(postId: string): Promise<AnalyticsData> {
    try {
      const response = await this.client.get(`/${postId}${API_ENDPOINTS.instagram.insights}`, { params: { metric: "engagement,impressions,reach" } });
      const data = response.data.data || [];
      return {
        views: data.find((m: any) => m.name === "impressions")?.values[0]?.value || 0,
        likes: data.find((m: any) => m.name === "engagement")?.values[0]?.value || 0,
        shares: 0, comments: 0, engagementRate: 0,
        reach: data.find((m: any) => m.name === "reach")?.values[0]?.value || 0,
        impressions: data.find((m: any) => m.name === "impressions")?.values[0]?.value || 0,
      };
    } catch (error: any) { console.error("[Instagram] Erro ao obter analytics:", error.message); throw error; }
  }
}

class TwitterIntegration {
  private client: AxiosInstance;
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.client = axios.create({ baseURL: API_ENDPOINTS.twitter.base, headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } });
  }

  async publishPost(content: PostContent): Promise<PostResult> {
    try {
      const text = [content.text, ...(content.hashtags || []), ...(content.mentions || [])].join(" ");
      const response = await this.client.post(API_ENDPOINTS.twitter.tweets, { text, media: content.mediaUrls ? { media_ids: content.mediaUrls } : undefined });
      return { success: true, postId: response.data.data.id, url: `https://twitter.com/i/web/status/${response.data.data.id}`, platform: "twitter" };
    } catch (error: any) { console.error("[Twitter] Erro ao publicar:", error.message); return { success: false, platform: "twitter", error: error.message }; }
  }

  async getAnalytics(postId: string): Promise<AnalyticsData> {
    try {
      const response = await this.client.get(`${API_ENDPOINTS.twitter.tweets}/${postId}`, { params: { "tweet.fields": "public_metrics" } });
      const metrics = response.data.data.public_metrics;
      return { views: metrics.impression_count || 0, likes: metrics.like_count || 0, shares: metrics.retweet_count || 0, comments: metrics.reply_count || 0, engagementRate: 0, reach: metrics.impression_count || 0, impressions: metrics.impression_count || 0 };
    } catch (error: any) { console.error("[Twitter] Erro ao obter analytics:", error.message); throw error; }
  }
}

class LinkedInIntegration {
  private client: AxiosInstance;
  private accessToken: string;
  private userId: string;

  constructor(accessToken: string, userId: string) {
    this.accessToken = accessToken;
    this.userId = userId;
    this.client = axios.create({ baseURL: API_ENDPOINTS.linkedin.base, headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } });
  }

  async publishPost(content: PostContent): Promise<PostResult> {
    try {
      const text = [content.text, ...(content.hashtags || []), ...(content.mentions || [])].join(" ");
      const response = await this.client.post(API_ENDPOINTS.linkedin.posts, {
        author: `urn:li:person:${this.userId}`, lifecycleState: "PUBLISHED",
        specificContent: { "com.linkedin.ugc.PublishContent": { content: { "com.linkedin.ugc.Text": { text } }, visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" } } },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      });
      return { success: true, postId: response.data.id, platform: "linkedin" };
    } catch (error: any) { console.error("[LinkedIn] Erro ao publicar:", error.message); return { success: false, platform: "linkedin", error: error.message }; }
  }

  async getAnalytics(_postId: string): Promise<AnalyticsData> {
    return { views: 0, likes: 0, shares: 0, comments: 0, engagementRate: 0, reach: 0, impressions: 0 };
  }
}

class TikTokIntegration {
  private client: AxiosInstance;
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
    this.client = axios.create({ baseURL: API_ENDPOINTS.tiktok.base, headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" } });
  }

  async publishPost(content: PostContent): Promise<PostResult> {
    try {
      const text = [content.text, ...(content.hashtags || []), ...(content.mentions || [])].join(" ");
      if (!content.mediaUrls || content.mediaUrls.length === 0) return { success: false, platform: "tiktok", error: "TikTok requer pelo menos um video" };
      const response = await this.client.post(API_ENDPOINTS.tiktok.videos, { video_url: content.mediaUrls[0], caption: text, privacy_level: "PUBLIC" });
      return { success: true, postId: response.data.data.video_id, platform: "tiktok" };
    } catch (error: any) { console.error("[TikTok] Erro ao publicar:", error.message); return { success: false, platform: "tiktok", error: error.message }; }
  }

  async getAnalytics(postId: string): Promise<AnalyticsData> {
    try {
      const response = await this.client.get(API_ENDPOINTS.tiktok.analytics, { params: { video_id: postId } });
      const data = response.data.data || {};
      return { views: data.video_view_count || 0, likes: data.like_count || 0, shares: data.share_count || 0, comments: data.comment_count || 0, engagementRate: 0, reach: data.video_view_count || 0, impressions: data.video_view_count || 0 };
    } catch (error: any) { console.error("[TikTok] Erro ao obter analytics:", error.message); throw error; }
  }
}

export function createSocialMediaIntegration(config: SocialMediaConfig): InstagramIntegration | TwitterIntegration | LinkedInIntegration | TikTokIntegration {
  switch (config.platform) {
    case "instagram": return new InstagramIntegration(config.accessToken, config.businessAccountId || "");
    case "twitter": return new TwitterIntegration(config.accessToken);
    case "linkedin": return new LinkedInIntegration(config.accessToken, config.userId || "");
    case "tiktok": return new TikTokIntegration(config.accessToken);
    default: throw new Error(`Plataforma nao suportada: ${(config as any).platform}`);
  }
}

export async function publishToMultiplePlatforms(configs: SocialMediaConfig[], content: PostContent): Promise<PostResult[]> {
  const results: PostResult[] = [];
  for (const config of configs) {
    try {
      const integration = createSocialMediaIntegration(config);
      results.push(await integration.publishPost(content));
    } catch (error: any) {
      results.push({ success: false, platform: config.platform, error: error.message });
    }
  }
  return results;
}

export { InstagramIntegration, TwitterIntegration, LinkedInIntegration, TikTokIntegration, SocialMediaConfig, PostContent, PostResult, AnalyticsData };
