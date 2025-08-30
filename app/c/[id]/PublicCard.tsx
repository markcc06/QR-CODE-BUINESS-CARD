'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/types/card';
import { getCardById } from '@/lib/storage';
import { downloadVCard } from '@/lib/vcard';
import CardTemplateRenderer from '@/components/CardTemplateRenderer';
import { Button } from '@/components/ui/button';
import { 
  Download, 
  Mail, 
  Phone, 
  Globe, 
  Linkedin, 
  Github, 
  Twitter, 
  MessageCircle,
  Sparkles,
  ArrowLeft,
  Instagram,
  Facebook
} from 'lucide-react';
import Link from 'next/link';
import { SocialLink } from '@/types/card';

interface PublicCardProps {
  cardId: string;
}

export default function PublicCard({ cardId }: PublicCardProps) {
  const [card, setCard] = useState<Card | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const foundCard = getCardById(cardId);
    setCard(foundCard);
    setIsLoading(false);
  }, [cardId]);

  const handleDownloadVCard = () => {
    if (card?.person) {
      downloadVCard(card.person);
    }
  };

  const getSocialIcon = (type: string) => {
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading card...</p>
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <Sparkles className="w-12 h-12 text-gray-400" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Card Not Found</h1>
          <p className="text-gray-600 mb-6">
            The digital business card you're looking for doesn't exist or has been moved.
          </p>
          <Link href="/">
            <Button className="bg-blue-600 hover:bg-blue-700">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Create Your Own Card
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-sm bg-white/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">CardSpark</span>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                Create Your Own
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <CardTemplateRenderer card={card} />
        </div>

        {/* Action Buttons */}
        <div className="max-w-sm mx-auto space-y-3 mb-8">
          <Button
            onClick={handleDownloadVCard}
            className="w-full bg-blue-600 hover:bg-blue-700"
            size="lg"
          >
            <Download className="w-5 h-5 mr-2" />
            Save Contact
          </Button>

          <div className="grid grid-cols-2 gap-3">
            {card.person.email && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.open(`mailto:${card.person.email}`, '_blank')}
              >
                <Mail className="w-5 h-5 mr-2" />
                Email
              </Button>
            )}
            
            {card.person.phone && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => window.open(`tel:${card.person.phone}`, '_blank')}
              >
                <Phone className="w-5 h-5 mr-2" />
                Call
              </Button>
            )}
          </div>

          {card.person.website && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => window.open(card.person.website, '_blank')}
              className="w-full"
            >
              <Globe className="w-5 h-5 mr-2" />
              Visit Website
            </Button>
          )}
        </div>

        {/* Social Links */}
        {card.person.socials && card.person.socials.length > 0 && (
          <div className="text-center mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Connect</h3>
            <div className="flex justify-center space-x-4">
              {card.person.socials.map((social: SocialLink, index: number) => (
                <Button
                  key={index}
                  variant="outline"
                  size="lg"
                  onClick={() => window.open(social.url, '_blank')}
                  className="w-14 h-14 rounded-full p-0"
                >
                  {getSocialIcon((social.platform ?? social.type ?? 'link') as string)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Avatar */}
        {card.person.avatarUrl && (
          <div className="flex justify-center mb-4">
            <img
              src={card.person.avatarUrl}
              alt="Avatar"
              className="rounded-full object-cover border border-gray-200"
              style={{ width: 200, height: 200 }}
            />
          </div>
        )}

        {/* Footer */}
        <div className="text-center pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-4">
            Created with CardSpark - The fastest way to create digital business cards
          </p>
          <Link href="/">
            <Button variant="ghost" size="sm">
              Create your own card →
            </Button>
          </Link>
        </div>
      </main>
    </div>
  );
}