import { CardData } from '@/types/card';

export function dataUrlToBase64(dataUrl: string) {
  const [, base64] = dataUrl.split(',');
  return base64 || '';
}

export function generateVCard(card: CardData) {
  const lines: string[] = [];
  lines.push('BEGIN:VCARD');
  lines.push('VERSION:3.0');
  // ...existing fields（FN、ORG、TITLE、TEL、EMAIL、URL 等）...

  if (card.avatarDataUrl) {
    const base64 = dataUrlToBase64(card.avatarDataUrl);
    // 大多数解析器识别 JPEG/PNG，使用 TYPE=PNG
    lines.push(`PHOTO;ENCODING=b;TYPE=PNG:${base64}`);
  }

  lines.push('END:VCARD');
  return lines.join('\n');
}