'use client';

import { Person, Theme, SocialLink } from '@/types/card';
import { Mail, Phone, Globe } from 'lucide-react';
import Image from 'next/image';
import { getSocialIcon } from '@/components/common/SocialIcon';

interface MinimalTemplateProps {
  person: Person;
  theme: Theme;
}

export default function MinimalTemplate({ person, theme }: MinimalTemplateProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-8 max-w-sm mx-auto">
      <div className="text-center">
        {person.avatarUrl && (
          <div className="flex justify-center mb-4">
            <img src={person.avatarUrl} alt="Avatar" className="rounded-full object-cover border border-gray-200" style={{ width: 200, height: 200 }} />
          </div>
        )}
        
        <h1 className="text-2xl font-light text-gray-900 mb-1">
          {person.givenName} {person.familyName}
        </h1>
        
        {person.jobTitle && (
          <p className="text-gray-600 mb-2">{person.jobTitle}</p>
        )}
        
        {person.organization && (
          <p className="text-sm text-gray-500 mb-6">{person.organization}</p>
        )}

        {person.bio && (
          <p className="text-gray-700 text-sm mb-6 leading-relaxed">{person.bio}</p>
        )}

        <div className="space-y-4">
          {person.email && (
            <div>
              <Mail className="w-4 h-4 mx-auto mb-1" style={{ color: theme.primary }} />
              <a href={`mailto:${person.email}`} className="text-sm text-gray-700 hover:underline block">
                {person.email}
              </a>
            </div>
          )}
          
          {person.phone && (
            <div>
              <Phone className="w-4 h-4 mx-auto mb-1" style={{ color: theme.primary }} />
              <a href={`tel:${person.phone}`} className="text-sm text-gray-700 hover:underline block">
                {person.phone}
              </a>
            </div>
          )}
          
          {person.website && (
            <div>
              <Globe className="w-4 h-4 mx-auto mb-1" style={{ color: theme.primary }} />
              <a href={person.website} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 hover:underline block">
                {person.website.replace(/https?:\/\//, '')}
              </a>
            </div>
          )}
        </div>

        {person.socials && person.socials.length > 0 && (
          <div className="flex justify-center space-x-4 mt-4">
            {person.socials.map((social: SocialLink, idx: number) => (
              <a
                key={idx}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                aria-label={social.type || social.url}
                title={social.type || social.url}
                style={{ color: theme.primary }}
              >
                {getSocialIcon(social, 'w-4 h-4')}
              </a>
            ))}
          </div>
        )}

        {person.logoUrl && (
          <div className="mt-8">
            <Image
              src={person.logoUrl}
              alt="Company logo"
              width={60}
              height={30}
              className="mx-auto opacity-50"
            />
          </div>
        )}
      </div>
    </div>
  );
}