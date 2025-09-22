import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Digital Business Card Generator — Free & Online | CardSpark',
  description:
    'Create a digital business card online, share via QR code, export vCard, and update anytime.',
};

export default function Page() {
  return (
    <main className="px-6 py-12 text-center">
      <h1 className="text-3xl font-bold mb-4">Digital Business Card Generator</h1>
      <p className="text-gray-600">
        Full guide coming soon. Design your card, share via QR, and never reprint.
      </p>
    </main>
  );
}