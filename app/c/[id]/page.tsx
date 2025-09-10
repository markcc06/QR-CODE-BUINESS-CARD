import type { Metadata } from 'next';
import { absoluteUrl } from '@/lib/seo';
import PublicCard from './PublicCard';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const canonical = absoluteUrl(`/c/${params.id}`);
  return {
    title: 'Digital Business Card | CardSpark',
    description: 'View this digital business card created with CardSpark.',
    alternates: { canonical },
    robots: { index: false, follow: true },
    openGraph: {
      type: 'website',
      title: 'Digital Business Card | CardSpark',
      description: 'View this digital business card created with CardSpark.',
      url: canonical,
      images: [{ url: absoluteUrl('/og-default.png'), width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
  };
}


export default function PublicCardPage({ params }: PageProps) {
  return <PublicCard cardId={params.id} />;
}
