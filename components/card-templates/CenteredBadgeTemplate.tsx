import { Person, Theme, SocialLink } from '@/types/card';
import { getSocialIcon } from '@/components/common/SocialIcon';

type Props = {
  person: Person;
  theme: Theme;
};

export default function Profile({ person, theme }: Props) {
  return (
    <div className="p-4">
      {/* ...existing code... */}

      {person.socials && person.socials.length > 0 && (
        <div className="flex justify-center gap-4 mt-4">
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
    </div>
  );
}