// Server component: inject JSON‑LD script safely (no client runtime)
export default function JsonLd({ schema }: { schema: Record<string, any> }) {
  if (!schema) return null;
  return (
    <script
      type="application/ld+json"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
