'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardTemplate, Theme } from '@/types/card';
import { generateCardId, saveCard, saveCurrentCard, getCurrentCard } from '@/lib/storage';
import { generateQRCode } from '@/lib/qrcode';
import CardForm from '@/components/CardForm';
import CardPreview from '@/components/CardPreview';
import { MessageCircle, Sparkles } from 'lucide-react';
import RecognizeOverlay from '@/components/common/RecognizeOverlay';
import SiteHeader from '@/components/SiteHeader';

const defaultTheme: Theme = {
  primary: '#0ea5e9',
  secondary: '#0284c7',
};

export default function HomePage() {
  const [card, setCard] = useState<Partial<Card>>({
    template: 'classic' as CardTemplate,
    theme: defaultTheme,
    person: { givenName: '' }, // 至少给 required 字段一个默认空串
  });
  const [qrCodeUrl, setQrCodeUrl] = useState<string>();
  const [publicUrl, setPublicUrl] = useState<string>();
  const [isGenerating, setIsGenerating] = useState(false);

  // Load saved card on component mount
  useEffect(() => {
    const savedCard = getCurrentCard();
    if (savedCard) {
      setCard(savedCard);
    }
  }, []);

  // Auto-save card changes
  useEffect(() => {
    saveCurrentCard(card);
  }, [card]);

  const handleGenerate = async () => {
    if (!card.person?.givenName) {
      alert('Please enter at least a first name to generate your card.');
      return;
    }

    setIsGenerating(true);
    
    try {
      // Create a complete card
      const completeCard: Card = {
        id: card.id || generateCardId(),
        createdAt: card.createdAt || new Date().toISOString(),
        template: card.template || 'classic',
        theme: card.theme || defaultTheme,
        person: card.person,
        slug: card.slug,
      };

      // Generate public URL
      const newPublicUrl = `${window.location.origin}/c/${completeCard.id}`;
      
      // Generate QR code
      const qrUrl = await generateQRCode(newPublicUrl, 200, 'M');
      
      // Save the card
      saveCard(completeCard);
      
      // Update state
      setCard(completeCard);
      setPublicUrl(newPublicUrl);
      setQrCodeUrl(qrUrl);
      
    } catch (error) {
      console.error('Failed to generate card:', error);
      alert('Failed to generate card. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <SiteHeader />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Free Digital Business Card & QR Code Business Card Generator
          </h1>
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Create, Share & Update Instantly — No Paper, No App.
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Design your free digital business card online in minutes.<br />
            Generate QR code business cards, vCard files,<br />
            and mobile‑friendly landing pages for networking and teams.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <CardForm
              card={card}
              onCardChange={setCard}
              onGenerate={handleGenerate}
              qrCodeUrl={qrCodeUrl}
            />
          </div>

          {/* Preview */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="relative">
              {card.person?.givenName ? (
                <CardPreview
                  card={card as Card}
                  qrCodeUrl={qrCodeUrl}
                  publicUrl={publicUrl}
                />
              ) : (
                <div className="text-center py-12">
                  <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Sparkles className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Ready to create your card?
                  </h3>
                  <p className="text-gray-500">
                    Fill out the form to see your digital business card come to life.
                  </p>
                </div>
              )}

              {/* 识别 overlay 组件 */}
              <RecognizeOverlay />
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Customizable Templates for Every Profession</h3>
            <p className="text-gray-600">Choose from modern digital business card templates that work seamlessly on any device.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant QR Code Sharing</h3>
            <p className="text-gray-600">Generate a QR code business card or shareable link that saves directly to contacts.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-purple-600 rounded"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Download Standard vCard (.vcf) Files</h3>
            <p className="text-gray-600">Create and export vCards compatible with iPhone, Android, Outlook, and Google Contacts — GDPR‑friendly and ready for Europe.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
