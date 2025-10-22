import type { Metadata } from 'next';
import Link from 'next/link';
// app/terms/page.tsx
export const metadata: Metadata = {
  title: 'Terms of Service — CardSpark',
  description: 'Terms of service for CardSpark.',
};

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
      <p className="text-gray-700 leading-relaxed mb-4">
        Welcome to <strong>CardSpark</strong>, a lightweight <strong>digital business card</strong> platform that allows users to create, customize, and share contact information via <strong>QR codes</strong> and <strong>vCard (VCF)</strong> files. 
        By using our website or services, you agree to comply with these Terms of Service.
      </p>

      <p className="text-gray-700 leading-relaxed mb-4">
        <strong>1. Use of Service</strong><br />
        CardSpark provides tools to generate and export <strong>vCard</strong> or <strong>VCF vCard</strong> files for sharing contact information. 
        Users are responsible for ensuring that all information entered into the system is accurate and lawful. 
        You may use CardSpark only for legitimate personal or business purposes and must not engage in any misuse, data scraping, or reverse engineering.
      </p>

      <p className="text-gray-700 leading-relaxed mb-4">
        <strong>2. Data Processing and Privacy</strong><br />
        When you create a <strong>vCard (VCF file)</strong> through CardSpark, your contact data is processed securely and temporarily to generate a QR code. 
        CardSpark does <strong>not</strong> permanently store your personal contact data or share it with third parties. 
        All generated cards and QR codes are designed for privacy-first usage and can be deleted or regenerated at any time by the user.
      </p>

      <p className="text-gray-700 leading-relaxed mb-4">
        <strong>3. Intellectual Property</strong><br />
        All trademarks, design elements, and written content on CardSpark are the property of the CardSpark team. 
        Users retain full ownership of their <strong>vCard</strong> data and contact information they create using the platform.
      </p>

      <p className="text-gray-700 leading-relaxed mb-4">
        <strong>4. Limitation of Liability</strong><br />
        CardSpark provides its services on an “as-is” and “as-available” basis. 
        We are not liable for any loss, damage, or data corruption that may result from improper use or third-party actions. 
        Your <strong>VCF vCard</strong> and QR code data remain under your control at all times.
      </p>

      <p className="text-gray-700 leading-relaxed mb-4">
        <strong>5. Contact</strong><br />
        If you have any questions about these Terms or our data policy, please reach out via our 
        <Link href="/feedback" className="text-blue-600 underline ml-1">Contact page</Link>.
      </p>
    </main>
  );
}