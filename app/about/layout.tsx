import SiteHeader from "@/components/SiteHeader";

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      <div className="sticky top-0 z-40 w-full border-b border-gray-200 bg-white shadow-sm">
        <SiteHeader />
      </div>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
