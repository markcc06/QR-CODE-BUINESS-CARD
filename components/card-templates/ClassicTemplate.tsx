'use client';

import { Person, Theme, SocialLink } from '@/types/card';
import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import Image from 'next/image';
import { getSocialIcon } from '@/components/common/SocialIcon';

interface ClassicTemplateProps {
  person: Person;
  theme: Theme;
}

export default function ClassicTemplate({ person, theme }: ClassicTemplateProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm mx-auto">
      {/* Header */}
      <div className="text-center mb-6">
        {person.avatarUrl && (
          <div className="flex justify-center mb-4">
            <img
              src={person.avatarUrl}
              alt="Avatar"
              className="rounded-full object-cover border border-gray-200"
              style={{ width: 200, height: 200 }}
            />
          </div>
        )}
        <h1 className="text-xl font-bold text-gray-900">
          {person.givenName} {person.familyName}
        </h1>
        {person.jobTitle && (
          <p className="text-gray-600 text-sm">{person.jobTitle}</p>
        )}
        {person.organization && (
          <p className="text-gray-500 text-sm">{person.organization}</p>
        )}
      </div>

      {/* Bio */}
      {person.bio && (
        <div className="mb-6">
          <p className="text-gray-700 text-sm leading-relaxed">{person.bio}</p>
        </div>
      )}

      {/* Contact Info */}
      <div className="space-y-3 mb-6">
        {person.email && (
          <div className="flex items-center space-x-3">
            <Mail className="w-4 h-4" style={{ color: theme.primary }} />
            <a href={`mailto:${person.email}`} className="text-sm text-gray-700 hover:underline">
              {person.email}
            </a>
          </div>
        )}
        {person.phone && (
          <div className="flex items-center space-x-3">
            <Phone className="w-4 h-4" style={{ color: theme.primary }} />
            <a href={`tel:${person.phone}`} className="text-sm text-gray-700 hover:underline">
              {person.phone}
            </a>
          </div>
        )}
        {person.website && (
          <div className="flex items-center space-x-3">
            <Globe className="w-4 h-4" style={{ color: theme.primary }} />
            <a href={person.website} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 hover:underline">
              {person.website.replace(/https?:\/\//, '')}
            </a>
          </div>
        )}
        {person.location && (
          <div className="flex items-center space-x-3">
            <MapPin className="w-4 h-4" style={{ color: theme.primary }} />
            <span className="text-sm text-gray-700">{person.location}</span>
          </div>
        )}
      </div>

      {/* Social Links */}
      {person.socials && person.socials.length > 0 && (
        <div className="flex justify-center space-x-4">
          {person.socials.map((social: SocialLink, index: number) => (
            <a
              key={index}
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

      {person.logoUrl && (
        <div className="mt-6 text-center">
          <Image
            src={person.logoUrl}
            alt="Company logo"
            width={80}
            height={40}
            className="mx-auto opacity-60"
          />
        </div>
      )}
    </div>
  );
}