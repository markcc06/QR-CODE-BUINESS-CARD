'use client';

export default function ScanPage() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      {/* Client-only route shell for /scan. */}
      {/* Keep OCR/UI components imported here (client components only). */}
      <h1 className="text-2xl font-semibold tracking-tight">Scan your card</h1>
      <p className="mt-2 text-sm text-neutral-500">
        OCR your business card and auto-fill fields. This page is client-only on purpose.
      </p>
    </main>
  );
}
