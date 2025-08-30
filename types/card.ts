export type CardTemplate = 'classic' | 'minimal' | 'accent' | 'left' | 'centered';

export type SocialPlatform =
  | 'linkedin'
  | 'github'
  | 'twitter'
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'tiktok';

export type SocialLink = {
  // 兼容旧代码：部分模板和公共页使用 social.type
  type?: SocialPlatform;
  // 新字段：新功能与校验使用 platform
  platform?: SocialPlatform;
  url: string;
};

export interface Person {
  givenName: string;
  familyName?: string;
  jobTitle?: string;
  organization?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  bio?: string;
  avatarUrl?: string;
  logoUrl?: string;
  socials?: SocialLink[]; // 新增：统一放在 person 下
}

export interface Theme {
  primary: string;
  secondary?: string;
}

export interface Assets {
  paperCardImageUrl?: string;
  qrPngUrl?: string;
  vcardUrl?: string;
}

export interface Card {
  id: string;
  createdAt: string;
  template: CardTemplate;
  theme: Theme;
  person: Person;
  assets?: Assets;
  slug?: string;
  avatarDataUrl?: string;
  socials?: SocialLink[];
}

export type FeedbackData = {
  message: string;
  email?: string;
  rating?: number;
  timestamp?: string;
};

// 名片核心数据（如已存在请合并）
export type CardData = {
  // ...existing fields...
  avatarDataUrl?: string; // base64/dataURL，供预览、落地页、vCard 导出
  socials?: SocialLink[];
};