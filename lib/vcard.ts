import { Person, SocialLink } from '@/types/card';

export function generateVCard(person: Person): string {
  const lines = ['BEGIN:VCARD', 'VERSION:4.0'];
  
  // Name
  const familyName = person.familyName || '';
  const givenName = person.givenName || '';
  if (givenName || familyName) {
    lines.push(`N:${familyName};${givenName};;;`);
    lines.push(`FN:${[givenName, familyName].filter(Boolean).join(' ')}`);
  }
  
  // Organization and title
  if (person.organization) {
    lines.push(`ORG:${person.organization}`);
  }
  if (person.jobTitle) {
    lines.push(`TITLE:${person.jobTitle}`);
  }
  
  // Contact info
  if (person.email) {
    lines.push(`EMAIL;TYPE=work:${person.email}`);
  }
  if (person.phone) {
    lines.push(`TEL;TYPE=cell,voice:${person.phone}`);
  }
  if (person.website) {
    lines.push(`URL:${person.website}`);
  }
  if (person.location) {
    lines.push(`ADR;TYPE=work:;;${person.location};;;;`);
  }
  
  // Bio as note
  if (person.bio) {
    lines.push(`NOTE:${person.bio}`);
  }
  
  // Avatar
  if (person.avatarUrl) {
    lines.push(`PHOTO;MEDIATYPE=image/png:${person.avatarUrl}`);
  }
  
  // Social links as URLs
  person.socials?.forEach((social: SocialLink) => {
    // 简单写入 URL；后续可按平台映射到不同字段
    lines.push(`URL:${social.url}`);
  });
  
  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export function downloadVCard(person: Person, filename?: string) {
  const vcardContent = generateVCard(person);
  const blob = new Blob([vcardContent], { type: 'text/vcard' });
  const url = URL.createObjectURL(blob);
  
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || `${person.givenName}-${person.familyName || 'card'}.vcf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}