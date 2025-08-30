'use client';

import { SocialPlatform, SocialLink } from '@/types/card';
import { validatePlatformUrl } from '@/utils/validation';

type Props = {
  link: SocialLink;
  onChangeAction: (next: SocialLink) => void;
  onRemoveAction?: () => void;
};

export default function SocialLinkRow({ link, onChangeAction, onRemoveAction }: Props) {
  const platformValue = (link.platform ?? link.type ?? 'linkedin') as SocialPlatform;
  const valid = validatePlatformUrl(platformValue, link.url);

  return (
    <div className="grid grid-cols-[160px_1fr_40px] gap-2 items-center">
      <select
        value={platformValue}
        onChange={(e) => {
          const val = e.target.value as SocialPlatform;
          onChangeAction({ ...link, platform: val, type: val });
        }}
        className="h-10 rounded-md border border-gray-200 bg-white px-2"
      >
        <option value="linkedin">LinkedIn</option>
        <option value="github">GitHub</option>
        <option value="twitter">X/Twitter</option>
        <option value="whatsapp">WhatsApp</option>
        <option value="instagram">Instagram</option>
        <option value="facebook">Facebook</option>
        <option value="tiktok">TikTok</option>
      </select>

      <div>
        <input
          value={link.url}
          onChange={(e) => onChangeAction({ ...link, url: e.target.value })}
          placeholder="https://..."
          className={`h-10 w-full rounded-md px-3 border ${valid ? 'border-gray-200' : 'border-red-500'}`}
          type="url"
          inputMode="url"
        />
        {!valid && <p className="mt-1 text-xs text-red-500">Please enter a valid URL.</p>}
      </div>

      <button
        type="button"
        onClick={onRemoveAction}
        className="h-10 w-10 inline-flex items-center justify-center rounded-md border border-gray-200 text-gray-500 hover:bg-gray-50"
        aria-label="Remove"
      >
        ✕
      </button>
    </div>
  );
}