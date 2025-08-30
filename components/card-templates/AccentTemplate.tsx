'use client';

import { Person, Theme, SocialLink } from '@/types/card';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Twitter, MessageCircle, Instagram, Facebook } from 'lucide-react';
import Image from 'next/image';

interface AccentTemplateProps {
  person: Person;
  theme: Theme;
}

export default function AccentTemplate({ person, theme }: AccentTemplateProps) {
  const getSocialIcon = (type: string) => {
    switch (type) {
      case 'linkedin': return <Linkedin className="w-4 h-4" />;
      case 'github': return <Github className="w-4 h-4" />;
      case 'x':
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'facebook': return <Facebook className="w-4 h-4" />;
      case 'whatsapp': return <MessageCircle className="w-4 h-4" />;
      case 'wechat': return <MessageCircle className="w-4 h-4" />;
      default: return <Globe className="w-4 h-4" />;
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-sm mx-auto">
      {/* Accent bar */}
      <div className="h-2" style={{ backgroundColor: theme.primary }}></div>
      
      <div className="p-6">
        <div className="flex items-start space-x-4 mb-6">
          {person.avatarUrl && (
            <div className="flex justify-center mb-4">
              <img src={person.avatarUrl} alt="Avatar" className="rounded-full object-cover border border-gray-200" style={{ width: 200, height: 200 }} />
            </div>
          )}
          <div className="flex-1">
            <h1 className="text-lg font-semibold text-gray-900 mb-1">
              {person.givenName} {person.familyName}
            </h1>
            {person.jobTitle && (
              <p className="text-sm text-gray-600 mb-1">{person.jobTitle}</p>
            )}
            {person.organization && (
              <p className="text-sm font-medium" style={{ color: theme.primary }}>
                {person.organization}
              </p>
            )}
          </div>
        </div>

        {person.bio && (
          <div className="mb-6">
            <p className="text-gray-700 text-sm leading-relaxed">{person.bio}</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-3 mb-6">
          {person.email && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <Mail className="w-4 h-4 text-gray-500" />
              <a href={`mailto:${person.email}`} className="text-sm text-gray-700 hover:underline">
                {person.email}
              </a>
            </div>
          )}
          {person.phone && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <Phone className="w-4 h-4 text-gray-500" />
              <a href={`tel:${person.phone}`} className="text-sm text-gray-700 hover:underline">
                {person.phone}
              </a>
            </div>
          )}
          {person.website && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <Globe className="w-4 h-4 text-gray-500" />
              <a href={person.website} target="_blank" rel="noopener noreferrer" className="text-sm text-gray-700 hover:underline">
                {person.website.replace(/https?:\/\//, '')}
              </a>
            </div>
          )}
          {person.location && (
            <div className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-700">{person.location}</span>
            </div>
          )}
        </div>

        {person.socials && person.socials.length > 0 && (
          <div className="flex justify-center space-x-4">
            {person.socials.map((social: SocialLink, index: number) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-gray-100 transition-colors"
                style={{ color: theme.primary }}
              >
                {getSocialIcon(social.type ?? '')}
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
    </div>
  );
}