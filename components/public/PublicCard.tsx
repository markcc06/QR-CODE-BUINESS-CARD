import { SocialLink } from '@/types/card';
import { getSocialIcon } from '@/components/common/SocialIcon';

// 用于渲染公共页中的社交图标
function PublicSocialIcons({ socials, color }: { socials?: SocialLink[]; color?: string }) {
  if (!socials?.length) return null;
  return (
    <div className="flex justify-center gap-4 mt-4">
      {socials.map((social: SocialLink, idx: number) => (
        <a
          key={idx}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label={social.type || social.url}
          title={social.type || social.url}
          style={color ? { color } : undefined}
        >
          {getSocialIcon(social, 'w-4 h-4')}
        </a>
      ))}
    </div>
  );
}

// 在组件的 JSX 中合适位置调用：
// <PublicSocialIcons socials={person.socials} color={theme?.primary} />