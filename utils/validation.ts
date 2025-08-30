import { SocialPlatform } from '@/types/card';

export type SupportedDomains =
  | 'linkedin'
  | 'github'
  | 'twitter'
  | 'whatsapp'
  | 'instagram'
  | 'facebook'
  | 'tiktok';

const patterns: Record<SupportedDomains, RegExp> = {
  linkedin: /^https?:\/\/(www\.)?linkedin\.com\/.+/i,
  github: /^https?:\/\/(www\.)?github\.com\/.+/i,
  twitter: /^https?:\/\/(x\.com|twitter\.com)\/.+/i,
  whatsapp: /^https?:\/\/(wa\.me|www\.whatsapp\.com)\/.+/i,
  instagram: /^https?:\/\/(www\.)?instagram\.com\/.+/i,
  facebook: /^https?:\/\/(www\.)?facebook\.com\/.+/i,
  tiktok: /^https?:\/\/(www\.)?tiktok\.com\/.+/i,
};

export function validatePlatformUrl(platform: SupportedDomains, url: string): boolean {
  if (!url) return true;
  return patterns[platform].test(url.trim());
}