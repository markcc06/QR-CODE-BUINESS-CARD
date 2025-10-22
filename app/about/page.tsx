import type { Metadata } from 'next';
// app/about/page.tsx
export const metadata: Metadata = {
  title: 'About — CardSpark',
  description: 'About CardSpark — create, share and update your digital business card in seconds.',
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">About CardSpark</h1>
      <p className="text-gray-700 leading-relaxed mb-4">
        <strong>CardSpark</strong> is a lightweight <strong>digital business card app</strong> that helps you create, customize, and share professional contact cards in seconds. 
        With just a few clicks, you can design your <strong>QR code business card</strong>, export it as a <strong>vCard (VCF file)</strong>, and share it instantly — no downloads or apps required.
      </p>

      <p className="text-gray-700 leading-relaxed mb-4">
        Built for speed and privacy, CardSpark allows users to update their contact details anytime without reprinting or broken links. 
        Whether you’re a freelancer, marketer, or part of a global team, your <strong>digital business card</strong> stays live and always up to date.
      </p>

      <p className="text-gray-700 leading-relaxed mb-4">
        CardSpark supports <strong>vCard</strong> and <strong>VCF vCard</strong> standards for seamless integration across devices and contact apps. 
        Every card you generate is fully mobile-friendly, privacy-safe, and designed for effortless networking.
      </p>

      <p className="text-gray-600">
        Our mission is simple: make sharing professional identities faster, smarter, and greener — powered by clean technology and indie craftsmanship.
      </p>
    </main>
  );
}