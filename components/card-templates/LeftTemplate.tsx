'use client';

import { Person, Theme, SocialLink } from '@/types/card';
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Twitter, MessageCircle, Instagram, Facebook } from 'lucide-react';
import Image from 'next/image';

interface LeftTemplateProps {
  person: Person;
  theme: Theme;
}

export default function LeftTemplate({ person, theme }: LeftTemplateProps) {
  const getSocialIcon = (type?: string) => {
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
    <div className="bg-white rounded-xl shadow-lg overflow-hidden max-w-md mx-auto">
      <div className="flex">
        {/* Left side - Avatar and basic info */}
        <div className="w-32 p-4 flex flex-col items-center justify-center" style={{ backgroundColor: theme.primary }}>
          {person.avatarUrl && (
            <div className="flex justify-center mb-4">
              <img src={person.avatarUrl} alt="Avatar" className="rounded-full object-cover border border-gray-200" style={{ width: 200, height: 200 }} />
            </div>
          )}
          <h1 className="text-white text-sm font-semibold text-center leading-tight">
            {person.givenName} {person.familyName}
          </h1>
          {person.jobTitle && (
            <p className="text-white text-xs text-center mt-1 opacity-90">
              {person.jobTitle}
            </p>
          )}
        </div>

        {/* Right side - Details */}
        <div className="flex-1 p-4">
          {person.organization && (
            <div className="mb-4">
              <p className="text-gray-900 font-medium text-sm">{person.organization}</p>
            </div>
          )}

          {person.bio && (
            <div className="mb-4">
              <p className="text-gray-700 text-xs leading-relaxed">{person.bio}</p>
            </div>
          )}

          <div className="space-y-2">
            {person.email && (
              <div className="flex items-center space-x-2">
                <Mail className="w-3 h-3 text-gray-500" />
                <a href={`mailto:${person.email}`} className="text-xs text-gray-700 hover:underline">
                  {person.email}
                </a>
              </div>
            )}
            {person.phone && (
              <div className="flex items-center space-x-2">
                <Phone className="w-3 h-3 text-gray-500" />
                <a href={`tel:${person.phone}`} className="text-xs text-gray-700 hover:underline">
                  {person.phone}
                </a>
              </div>
            )}
            {person.website && (
              <div className="flex items-center space-x-2">
                <Globe className="w-3 h-3 text-gray-500" />
                <a href={person.website} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-700 hover:underline">
                  {person.website.replace(/https?:\/\//, '')}
                </a>
              </div>
            )}
            {person.location && (
              <div className="flex items-center space-x-2">
                <MapPin className="w-3 h-3 text-gray-500" />
                <span className="text-xs text-gray-700">{person.location}</span>
              </div>
            )}
          </div>

          {person.socials && person.socials.length > 0 && (
            <div className="flex space-x-2 mt-4">
              {person.socials.map((social: SocialLink, index: number) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-1 rounded hover:bg-gray-100 transition-colors"
                  style={{ color: theme.primary }}
                >
                  {getSocialIcon(social.type)}
                </a>
              ))}
            </div>
          )}

          {person.logoUrl && (
            <div className="mt-4">
              <Image
                src={person.logoUrl}
                alt="Company logo"
                width={60}
                height={30}
                className="opacity-60"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}