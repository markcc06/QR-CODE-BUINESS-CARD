import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts } from '@/content/posts';
import { absoluteUrl } from '@/lib/seo';

export const dynamic = 'force-static';

export const metadata: Metadata = {
  title: 'Digital Business Card & QR Code Business Card',
  description:
    'Discover guides, templates, and vCard tools to create, share, and manage contact info online. Learn how digital and QR code business cards improve networking.',
  alternates: { canonical: absoluteUrl('/blog') },
};

function formatDate(iso?: string) {
  if (!iso) return '';
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return `${y}/${m}/${day}`; // e.g. 2025/9/7
}

type Post = { slug: string; title: string; date?: string; excerpt?: string };

export default async function BlogPage() {
  const posts = (await getPosts()) as Post[];
  return (
    <section>
      <h1 className="text-3xl font-bold tracking-tight">Digital Business Card & QR Code Business Card</h1>
      <h2 className="mt-2 text-sm text-gray-500">Guides, templates, and vCard tools to create, share, and manage contact info online.</h2>
      <h2 className="mt-8 text-lg font-semibold">Latest posts</h2>

      <ul className="mt-8 space-y-10">
        {posts.map((p) => (
          <li key={p.slug}>
            <article>
              <h3 className="text-xl font-semibold">
                <Link
                  href={`/blog/${p.slug}`}
                  prefetch={false}
                  className="hover:underline"
                  aria-label={`Read ${p.title}`}
                >
                  {p.title}
                </Link>
              </h3>
              <p className="mt-1 text-xs text-gray-500">
                <time dateTime={p.date}>{formatDate(p.date)}</time>
              </p>
              {p.excerpt ? (
                <p className="mt-3 text-gray-700">{p.excerpt}</p>
              ) : null}
              <Link
                href={`/blog/${p.slug}`}
                prefetch={false}
                className="mt-2 inline-block text-sm underline"
                aria-label={`Read more about ${p.title}`}
              >
                Continue reading →
              </Link>
            </article>
          </li>
        ))}
      </ul>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
            ],
          }),
        }}
      />
    </section>
  );
}