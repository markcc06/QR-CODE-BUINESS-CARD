import { Person, Theme, SocialLink } from '@/types/card';
import { getSocialIcon } from '@/components/common/SocialIcon';

interface Props {
  person: Person;
  theme: Theme;
}

export default function Profile({ person, theme }: Props) {
  return (
    <div>
      {/* ...existing code... */}
      {person.socials && person.socials.length > 0 && (
        <div className="flex flex-wrap gap-3 mt-4">
          {person.socials.map((social: SocialLink, idx: number) => (
            <a
              key={idx}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              style={{ color: theme.primary }}
              aria-label={social.type || social.url}
              title={social.type || social.url}
            >
              {getSocialIcon(social, 'w-4 h-4')}
            </a>
          ))}
        </div>
      )}
      {/* ...existing code... */}
    </div>
  );
}