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
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Create Your Digital Business Card
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Build a beautiful, shareable digital business card in under a minute. 
            Generate QR codes, vCard files, and mobile-optimized landing pages.
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
            <h3 className="text-lg font-semibold text-gray-900 mb-2">5 Beautiful Templates</h3>
            <p className="text-gray-600">Choose from carefully designed templates that work perfectly on any device.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-teal-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-teal-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Instant Sharing</h3>
            <p className="text-gray-600">Generate QR codes and shareable links that work immediately.</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-8 h-8 bg-purple-600 rounded"></div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">vCard Export</h3>
            <p className="text-gray-600">Download standard vCard files that work with all contact apps.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
