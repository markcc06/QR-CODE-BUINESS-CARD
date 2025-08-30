import { Globe, Linkedin, Github, MessageCircle, Instagram, Facebook, Play, Twitter } from 'lucide-react';
import { SocialLink } from '@/types/card';

// 简洁的 X 图标（使用描边，跟 lucide 风格一致）
function XIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 4L20 20M20 4L4 20" />
    </svg>
  );
}

// 依据 type 与 url 推断平台类型（统一标准化为 twitter）
function resolveType(social: Pick<SocialLink, 'type' | 'url'>): string {
  const raw = (social.type || '').toLowerCase().trim();

  // 先用 type 里的别名进行标准化
  if (raw) {
    if (raw.includes('twitter') || raw === 'x' || raw === 'x/twitter' || raw === 'x-twitter' || raw === 'tw') return 'twitter';
    if (raw === 'github' || raw === 'gh' || raw.includes('git')) return 'github';
    if (raw.includes('linkedin') || raw === 'li') return 'linkedin';
    if (raw.includes('instagram') || raw === 'ig') return 'instagram';
    if (raw.includes('facebook') || raw === 'fb') return 'facebook';
    if (raw.includes('whatsapp') || raw === 'wa') return 'whatsapp';
    if (raw.includes('wechat') || raw.includes('weixin') || raw === 'wx') return 'wechat';
    if (raw.includes('tiktok') || raw.includes('douyin') || raw === 'tt') return 'tiktok';
  }

  // 再从 URL 域名自动识别
  const url = social.url || '';
  try {
    const u = /^https?:\/\//i.test(url) ? new URL(url) : new URL(`https://${url}`);
    const h = u.hostname.replace(/^www\./, '').toLowerCase();

    if (h === 'x.com' || h === 'twitter.com') return 'twitter';
    if (h === 'github.com') return 'github';
    if (h === 'linkedin.com' || h === 'lnkd.in') return 'linkedin';
    if (h === 'instagram.com') return 'instagram';
    if (h === 'facebook.com' || h === 'fb.com') return 'facebook';
    if (h === 'whatsapp.com' || h === 'wa.me') return 'whatsapp';
    if (h === 'weixin.qq.com' || h === 'wechat.com') return 'wechat';
    if (h === 'tiktok.com' || h === 'douyin.com') return 'tiktok';
  } catch {
    // ignore
  }

  return 'unknown';
}

export function getSocialIcon(
  social: Pick<SocialLink, 'type' | 'url'>,
  className = 'w-4 h-4'
) {
  const type = resolveType(social);

  switch (type) {
    case 'linkedin': return <Linkedin className={className} />;
    case 'github': return <Github className={className} />;
    case 'twitter': return <Twitter className={className} style={{ color: '#1DA1F2' }} />; // 蓝色小鸟
    case 'instagram': return <Instagram className={className} />;
    case 'facebook': return <Facebook className={className} />;
    case 'whatsapp': return <MessageCircle className={className} />;
    case 'wechat': return <MessageCircle className={className} />;  // 无品牌图标，用对话气泡代替
    case 'tiktok': return <Play className={className} />;           // 无品牌图标，用播放键代替
    default: return <Globe className={className} />;
  }
}