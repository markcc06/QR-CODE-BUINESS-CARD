'use client';

import React from 'react';
import { Card, CardTemplate, Person, Theme, SocialLink } from '@/types/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Share2, RotateCcw } from 'lucide-react';
import AvatarUploader from '@/components/AvatarUploader';
import UploadCard, { OcrResult } from '@/components/UploadCard';
import { useCardStore } from '@/store/cardStore';

interface CardFormProps {
  card: Partial<Card>;
  onCardChange: (card: Partial<Card>) => void;
  onGenerate: () => void;
  qrCodeUrl?: string;
}

/** 颜色主题：不再给 Theme 强行加 name，避免 TS 报错 */
const themeChoices: { label: string; theme: Theme }[] = [
  { label: 'Ocean Blue', theme: { primary: '#0ea5e9', secondary: '#0284c7' } },
  { label: 'Emerald',    theme: { primary: '#10b981', secondary: '#059669' } },
  { label: 'Purple',     theme: { primary: '#8b5cf6', secondary: '#7c3aed' } },
  { label: 'Rose',       theme: { primary: '#f43f5e', secondary: '#e11d48' } },
  { label: 'Orange',     theme: { primary: '#f97316', secondary: '#ea580c' } },
  { label: 'Teal',       theme: { primary: '#14b8a6', secondary: '#0d9488' } },
];

const templates: { value: CardTemplate; label: string; description: string }[] = [
  { value: 'classic',  label: 'Classic',        description: 'Traditional layout with photo and contact info' },
  { value: 'minimal',  label: 'Minimal',        description: 'Clean and simple design' },
  { value: 'accent',   label: 'Accent Bar',     description: 'Modern design with colored accent bar' },
  { value: 'left',     label: 'Left Avatar',    description: 'Sidebar layout with prominent photo' },
  { value: 'centered', label: 'Centered Badge', description: 'Badge-style centered design' },
];

/** 缩略图：只做简化示意，保持轻量 */
function TemplateThumb({
  variant,
  color = '#0ea5e9',
  className = '',
}: {
  variant: CardTemplate;
  color?: string;
  className?: string;
}) {
  const base = 'rounded-md border bg-white p-2 w-full h-24 flex';
  const text = 'bg-gray-200 h-2 rounded';
  const circle = 'rounded-full bg-gray-300';
  if (variant === 'classic') {
    return (
      <div className={`${base} ${className}`}>
        <div className={`${circle}`} style={{ width: 28, height: 28 }} />
        <div className="ml-2 flex-1">
          <div className={`${text} w-24`} />
          <div className={`${text} w-32 mt-1`} />
          <div className={`${text} w-20 mt-1`} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-2 rounded-b-md" style={{ backgroundColor: color }} />
      </div>
    );
  }
  if (variant === 'minimal') {
    return (
      <div className={`${base} ${className}`}>
        <div className="flex-1">
          <div className={`${text} w-28`} />
          <div className={`${text} w-40 mt-1`} />
          <div className={`${text} w-24 mt-1`} />
        </div>
      </div>
    );
  }
  if (variant === 'accent') {
    return (
      <div className={`${base} relative ${className}`}>
        <div className="absolute top-0 left-0 right-0 h-2 rounded-t-md" style={{ backgroundColor: color }} />
        <div className="mt-3 flex-1">
          <div className={`${text} w-28`} />
          <div className={`${text} w-36 mt-1`} />
          <div className={`${text} w-24 mt-1`} />
        </div>
      </div>
    );
  }
  if (variant === 'left') {
    return (
      <div className={`${base} ${className}`}>
        <div className="w-8 h-full rounded-l-md mr-2" style={{ backgroundColor: color }} />
        <div className="flex-1">
          <div className={`${text} w-28`} />
          <div className={`${text} w-36 mt-1`} />
          <div className={`${text} w-24 mt-1`} />
        </div>
      </div>
    );
  }
  // centered
  return (
    <div className={`${base} items-center justify-center ${className}`}>
      <div className={`${circle}`} style={{ width: 28, height: 28, backgroundColor: color }} />
    </div>
  );
}

export default function CardForm({ card, onCardChange, onGenerate }: CardFormProps) {
  const { isRecognizing } = useCardStore();

  // 初始化避免类型告警
  React.useEffect(() => {
    const p = (card.person ?? {}) as Partial<Person>;
    if (p.givenName === undefined) {
      onCardChange({ ...card, person: { ...p, givenName: '' } as Person });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const disabled = isRecognizing;

  const updatePerson = <K extends keyof Person>(key: K, value: Person[K]) => {
    const current: Person = { ...(card.person as Person) };
    if (current.givenName == null) current.givenName = '';
    (current as any)[key] = value;
    onCardChange({ ...card, person: current });
  };

  const setTheme = (theme: Theme) => onCardChange({ ...card, theme });

  const addSocial = () => {
    const socials = (card.person?.socials || []) as SocialLink[];
    updatePerson('socials', [...socials, { platform: 'linkedin', url: '' } as SocialLink]);
  };

  const updateSocial = (index: number, field: keyof SocialLink, value: string) => {
    const socials: SocialLink[] = [...(card.person?.socials || [])];
    socials[index] = { ...socials[index], [field]: value };
    updatePerson('socials', socials);
  };

  const removeSocial = (index: number) => {
    const socials: SocialLink[] = [...(card.person?.socials || [])];
    socials.splice(index, 1);
    updatePerson('socials', socials);
  };

  // OCR 回填
  const handleOcrSuccess = React.useCallback((o: OcrResult) => {
    const current: Person = { ...(card.person as Person) };
    if (current.givenName == null) current.givenName = '';
    const person: Person = {
      ...current,
      givenName: (o.firstName ?? current.givenName ?? '').toString(),
      familyName: o.lastName ?? current.familyName,
      jobTitle: o.jobTitle ?? current.jobTitle,
      organization: o.company ?? current.organization,
      email: o.email ?? current.email,
      phone: o.phone ?? current.phone,
      website: o.website ?? current.website,
      location: o.location ?? current.location,
    };
    onCardChange({ ...card, person });
  }, [card, onCardChange]);

  React.useEffect(() => {
    const listener = (e: Event) => handleOcrSuccess((e as CustomEvent<OcrResult>).detail);
    window.addEventListener('ocr-success', listener);
    return () => window.removeEventListener('ocr-success', listener);
  }, [handleOcrSuccess]);

  const clearForm = () => {
    const blank: Person = { givenName: '' };
    onCardChange({ ...card, person: blank });
  };

  const currentColor = card.theme?.primary || '#0ea5e9';

  return (
    <div className="space-y-6">
      {/* Header：单行对齐 */}
      <div className="flex items-center justify-between gap-3 whitespace-nowrap">
        <h2 className="text-2xl font-bold text-gray-900">Create Your Card</h2>
        <div className="flex items-center gap-2 flex-shrink-0">
          <UploadCard />
          <Button variant="outline" size="sm" onClick={clearForm} className="text-gray-600" disabled={disabled}>
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button onClick={onGenerate} size="sm" className="bg-blue-600 hover:bg-blue-700" disabled={disabled}>
            <Share2 className="w-4 h-4 mr-1" />
            Generate
          </Button>
        </div>
      </div>

      <Tabs defaultValue="basics" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basics" disabled={disabled}>Basics</TabsTrigger>
          <TabsTrigger value="social" disabled={disabled}>Social</TabsTrigger>
          <TabsTrigger value="branding" disabled={disabled}>Branding</TabsTrigger>
        </TabsList>

        {/* Basics */}
        <TabsContent value="basics" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="givenName">First Name *</Label>
              <Input
                id="givenName"
                value={card.person?.givenName ?? ''}
                onChange={(e) => updatePerson('givenName', e.target.value)}
                placeholder="Alex"
                disabled={disabled}
              />
            </div>
            <div>
              <Label htmlFor="familyName">Last Name</Label>
              <Input
                id="familyName"
                value={card.person?.familyName ?? ''}
                onChange={(e) => updatePerson('familyName', e.target.value)}
                placeholder="Johnson"
                disabled={disabled}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              value={card.person?.jobTitle ?? ''}
              onChange={(e) => updatePerson('jobTitle', e.target.value)}
              placeholder="Product Manager"
              disabled={disabled}
            />
          </div>

          <div>
            <Label htmlFor="organization">Company</Label>
            <Input
              id="organization"
              value={card.person?.organization ?? ''}
              onChange={(e) => updatePerson('organization', e.target.value)}
              placeholder="Nova Labs Inc."
              disabled={disabled}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={card.person?.email ?? ''}
                onChange={(e) => updatePerson('email', e.target.value)}
                placeholder="alex@novalabs.io"
                disabled={disabled}
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                value={card.person?.phone ?? ''}
                onChange={(e) => updatePerson('phone', e.target.value)}
                placeholder="+1 (415) 555-0198"
                disabled={disabled}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                type="url"
                value={card.person?.website ?? ''}
                onChange={(e) => updatePerson('website', e.target.value)}
                placeholder="https://novalabs.io"
                disabled={disabled}
              />
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={card.person?.location ?? ''}
                onChange={(e) => updatePerson('location', e.target.value)}
                placeholder="San Francisco, CA"
                disabled={disabled}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={card.person?.bio ?? ''}
              onChange={(e) => updatePerson('bio', e.target.value)}
              placeholder="Passionate software engineer with 5+ years experience..."
              rows={3}
              disabled={disabled}
            />
          </div>
        </TabsContent>

        {/* Social */}
        <TabsContent value="social" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Social Links</h3>
            <Button type="button" variant="outline" size="sm" onClick={addSocial} disabled={disabled}>
              + Add Social
            </Button>
          </div>

          {card.person?.socials?.map((social, index) => (
            <div key={index} className="flex space-x-2">
              <Select
                value={social.platform}
                onValueChange={(value) => updateSocial(index, 'platform', value)}
                disabled={disabled}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Select platform" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="linkedin">LinkedIn</SelectItem>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="twitter">X/Twitter</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                </SelectContent>
              </Select>
              <Input
                value={social.url}
                onChange={(e) => updateSocial(index, 'url', e.target.value)}
                placeholder="https://..."
                className="flex-1"
                disabled={disabled}
              />
              <Button type="button" variant="outline" size="sm" onClick={() => removeSocial(index)} disabled={disabled}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}

          {(!card.person?.socials || card.person.socials.length === 0) && (
            <p className="text-gray-500 text-center py-8">
              No social links added yet. Click "Add Social" to get started.
            </p>
          )}
        </TabsContent>

        {/* Branding：模板两列网格 + 缩略图 + 颜色主题 + Avatar */}
        <TabsContent value="branding" className="space-y-6">
          {/* 模板选择（两列/大屏三列） */}
          <section>
            <Label>Template</Label>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mt-2">
              {templates.map((tpl) => {
                const selected = card.template === tpl.value;
                return (
                  <div
                    key={tpl.value}
                    className={`relative p-3 border rounded-lg cursor-pointer transition-colors ${
                      selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => !disabled && onCardChange({ ...card, template: tpl.value })}
                  >
                    <TemplateThumb variant={tpl.value} color={currentColor} />
                    <div className="mt-2 font-medium">{tpl.label}</div>
                    <div className="text-sm text-gray-500">{tpl.description}</div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 颜色主题（两列） */}
          <section>
            <Label>Color Theme</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
              {themeChoices.map((t) => {
                const selected = card.theme?.primary === t.theme.primary && card.theme?.secondary === t.theme.secondary;
                return (
                  <div
                    key={t.label}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => !disabled && setTheme(t.theme)}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: t.theme.primary }} />
                      <span className="inline-block w-4 h-4 rounded-full" style={{ backgroundColor: t.theme.secondary }} />
                      <span className="text-sm font-medium">{t.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Avatar 上传 */}
          <section className="bg-white border rounded-xl p-4">
            <h3 className="font-semibold mb-3">Avatar</h3>
            <AvatarUploader
              value={card.person?.avatarUrl}
              onChangeAction={(dataUrl) => !disabled && updatePerson('avatarUrl', dataUrl as any)}
            />
            <p className="text-xs text-gray-500 mt-2">
              Recommended 200×200, cropped to a circle and included in vCard.
            </p>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
