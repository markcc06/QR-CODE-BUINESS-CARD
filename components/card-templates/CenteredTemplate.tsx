'use client';

import { Person, Theme, SocialLink } from '@/types/card';
import { Mail, Phone, Globe, Linkedin, Github, Twitter, MessageCircle, Instagram, Facebook } from 'lucide-react';
import Image from 'next/image';

interface CenteredTemplateProps {
  person: Person;
  theme: Theme;
}

export default function CenteredTemplate({ person, theme }: CenteredTemplateProps) {
  const getSocialIcon = (type?: string) => {
    switch (type) {
      case 'linkedin': return <Linkedin className="w-5 h-5" />;
      case 'github': return <Github className="w-5 h-5" />;
      case 'x':
      case 'twitter': return <Twitter className="w-5 h-5" />;
      case 'instagram': return <Instagram className="w-5 h-5" />;
      case 'facebook': return <Facebook className="w-5 h-5" />;
      case 'whatsapp': return <MessageCircle className="w-5 h-5" />;
      case 'wechat': return <MessageCircle className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 max-w-sm mx-auto text-center">
      {/* Badge-style header */}
      <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full mb-6 border-2" style={{ borderColor: theme.primary }}>
        {person.avatarUrl && (
          <div className="flex justify-center mb-4">
            <img src={person.avatarUrl} alt="Avatar" className="rounded-full object-cover border border-gray-200" style={{ width: 200, height: 200 }} />
          </div>
        )}
        <div>
          <h1 className="text-lg font-semibold text-gray-900">
            {person.givenName} {person.familyName}
          </h1>
        </div>
      </div>

      {person.jobTitle && (
        <p className="text-gray-600 mb-2 font-medium">{person.jobTitle}</p>
      )}
      
      {person.organization && (
        <p className="text-sm mb-6" style={{ color: theme.primary }}>
          {person.organization}
        </p>
      )}

      {person.bio && (
        <div className="mb-6">
          <p className="text-gray-700 text-sm leading-relaxed">{person.bio}</p>
        </div>
      )}

      {/* Contact buttons */}
      <div className="space-y-3 mb-6">
        {person.email && (
          <a 
            href={`mailto:${person.email}`}
            className="flex items-center justify-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full"
          >
            <Mail className="w-4 h-4" style={{ color: theme.primary }} />
            <span className="text-sm text-gray-700">{person.email}</span>
          </a>
        )}
        
        {person.phone && (
          <a 
            href={`tel:${person.phone}`}
            className="flex items-center justify-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full"
          >
            <Phone className="w-4 h-4" style={{ color: theme.primary }} />
            <span className="text-sm text-gray-700">{person.phone}</span>
          </a>
        )}
        
        {person.website && (
          <a 
            href={person.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors w-full"
          >
            <Globe className="w-4 h-4" style={{ color: theme.primary }} />
            <span className="text-sm text-gray-700">{person.website.replace(/https?:\/\//, '')}</span>
          </a>
        )}
      </div>

      {person.socials && person.socials.length > 0 && (
        <div className="flex justify-center space-x-4 mb-6">
          {person.socials.map((social: SocialLink, index: number) => (
            <a
              key={index}
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-12 h-12 rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors"
              style={{ color: theme.primary }}
            >
              {getSocialIcon(social.type)}
            </a>
          ))}
        </div>
      )}

      {person.logoUrl && (
        <div>
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