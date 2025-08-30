'use client';

export default function Avatar({ src, size = 200 }: { src?: string; size?: number }) {
  if (!src) return null;
  return (
    <div
      className="rounded-full overflow-hidden border border-gray-200 bg-white"
      style={{ width: size, height: size }}
    >
      <img src={src} alt="avatar" className="w-full h-full object-cover" />
    </div>
  );
}