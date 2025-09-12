import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getPostBySlug, getPosts } from '@/content/posts';
import { absoluteUrl } from '@/lib/seo';
import JsonLd from '@/app/components/seo/JsonLd';

import nextDynamic from 'next/dynamic';

const MarkdownRenderer = nextDynamic(
  () => import('@/components/MarkdownRenderer'),
  {
    ssr: false,
    loading: () => (
      <div className="prose prose-neutral mx-auto py-6 text-neutral-500">Loading…</div>
    ),
  }
);

type Props = { params: { slug: string } };

export const dynamic = 'force-static';

export async function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  const url = absoluteUrl(`/blog/${post.slug}`);
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.excerpt,
      url,
      images: [{ url: absoluteUrl('/opengraph-image'), width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      images: [absoluteUrl('/opengraph-image')],
    },
  };
}

export default function BlogPostPage({ params }: Props) {
  const post = getPostBySlug(params.slug);
  if (!post) return notFound();

  const morePosts = getPosts().filter(p => p.slug !== post.slug).slice(0, 3);

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <article>
        <h1 className="text-3xl font-semibold tracking-tight">{post.title}</h1>
        <p className="mt-1 text-sm text-neutral-500">
          {new Date(post.date).toLocaleDateString()}
        </p>
        <MarkdownRenderer content={post.content} />
      </article>

      <JsonLd
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BlogPosting',
          headline: post.title,
          description: post.excerpt,
          datePublished: post.date,
          dateModified: post.date,
          mainEntityOfPage: absoluteUrl(`/blog/${post.slug}`),
          author: { '@type': 'Organization', name: 'CardSpark' },
        }}
      />
      <JsonLd
        schema={{
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: absoluteUrl('/') },
            { '@type': 'ListItem', position: 2, name: 'Blog', item: absoluteUrl('/blog') },
            { '@type': 'ListItem', position: 3, name: post.title, item: absoluteUrl(`/blog/${post.slug}`) },
          ],
        }}
      />
      <section className="mt-12 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">More posts</h3>
        <ul className="list-disc pl-5 space-y-1">
          {morePosts.map(p => (
            <li key={p.slug}>
              <a href={`/blog/${p.slug}`} className="hover:underline">
                {p.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
      {/* Structured data: extra breadcrumb (script) */}
      <script
        type="application/ld+json"
        // Using JSON.stringify to ensure valid JSON output
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Blog',
                item: absoluteUrl('/blog'),
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: post.title,
                item: absoluteUrl(`/blog/${post.slug}`),
              },
            ],
          }),
        }}
      />
    </main>
  );
}
