import { Metadata } from 'next';
import PublicCard from './PublicCard';

interface PageProps {
  params: { id: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  // In a real app, you'd fetch card data here
  return {
    title: 'Digital Business Card | CardSpark',
    description: 'View this digital business card created with CardSpark',
    openGraph: {
      title: 'Digital Business Card',
      description: 'View this digital business card created with CardSpark',
      type: 'profile',
      images: ['/og-card.png'],
    },
    twitter: {
      card: 'summary_large_image',
      title: 'Digital Business Card',
      description: 'View this digital business card created with CardSpark',
    },
  };
}

// 添加这个函数来列出所有可能的卡片ID
export async function generateStaticParams() {
  // 返回你所有可能的卡片ID
  return [
    { id: 'tcli97almi' }, 
    // 添加更多ID...
    { id: 'sample1' },
    { id: 'sample2' }
  ];
}

export default function PublicCardPage({ params }: PageProps) {
  return <PublicCard cardId={params.id} />;
}