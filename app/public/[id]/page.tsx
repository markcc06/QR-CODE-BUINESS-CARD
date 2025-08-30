import { notFound } from 'next/navigation';
import PublicCard from '@/app/c/[id]/PublicCard';
import { createClient } from '@supabase/supabase-js';

type PageProps = { params: { id: string } };

function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export default async function Page({ params }: PageProps) {
  const supabase = getServerSupabase();

  const { data: card, error } = await supabase
    .from('cards') // 按你的真实表名改
    .select('*')
    .eq('id', params.id)
    .single();

  if (error || !card) notFound();

  return (
    <PublicCard
      {...({
        card,
        data: card,
        initialCard: card,
        id: card.id,
      } as any)}
    />
  );
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;
