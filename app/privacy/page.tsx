import { Button } from '@/components/ui/button';
import { ArrowLeft, Sparkles, Shield, Eye, Database } from 'lucide-react';
import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50">
      {/* Header */}
      <header className="border-b border-white/20 backdrop-blur-sm bg-white/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2">
              <Sparkles className="w-6 h-6 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">CardSpark</span>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back to App
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="text-center mb-8">
            <Shield className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy & Data Protection</h1>
            <p className="text-gray-600">
              Learn how CardSpark stores, protects, and uses your data.
            </p>
          </div>

          <div className="prose prose-blue max-w-none">
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-6 bg-green-50 rounded-xl">
                <Eye className="w-12 h-12 text-green-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No OCR Scanning</h3>
                <p className="text-sm text-gray-600">
                  We do not use OCR (Optical Character Recognition). Any uploaded paper cards are displayed as images only and never processed or analyzed.
                </p>
              </div>
              
              <div className="text-center p-6 bg-blue-50 rounded-xl">
                <Database className="w-12 h-12 text-blue-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Local Data Storage</h3>
                <p className="text-sm text-gray-600">
                  All your business card data is stored locally in your browser using localStorage. CardSpark cannot access, view, or collect your personal information.
                </p>
              </div>
              
              <div className="text-center p-6 bg-purple-50 rounded-xl">
                <Shield className="w-12 h-12 text-purple-600 mx-auto mb-3" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tracking or Analytics</h3>
                <p className="text-sm text-gray-600">
                  We do not use tracking cookies, analytics tools, or third-party scripts. Your browsing activity stays private and secure.
                </p>
              </div>
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">How CardSpark Handles Your Data</h2>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Data Storage & Security</h3>
            <p className="text-gray-700 mb-4">
              All your business card data is stored locally in your browser using localStorage. This means:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
              <li>Your data never leaves your device unless you choose to share a card</li>
              <li>We cannot access, view, or collect your personal information</li>
              <li>Clearing your browser data will delete your saved cards</li>
              <li>Your cards are only accessible from the browser where you created them</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">Image Uploads & Privacy</h3>
            <p className="text-gray-700 mb-4">
              When you upload images (avatars, logos, or paper cards):
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
              <li>Images are converted to data URLs and stored locally in your browser</li>
              <li>We don't upload images to our servers or any cloud storage</li>
              <li>Paper card images are only displayed for your manual reference</li>
              <li>No OCR (Optical Character Recognition) is performed on uploaded images</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">Public Cards & Links</h3>
            <p className="text-gray-700 mb-4">
              When you generate a public card link:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
              <li>The card data is still stored locally in your browser</li>
              <li>Public links only work when accessed from browsers that have the card data</li>
              <li>No data is transmitted to external servers for public viewing</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">Feedback</h3>
            <p className="text-gray-700 mb-4">
              Our feedback form collects:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
              <li>Your use case and satisfaction rating</li>
              <li>Feature requests and general comments</li>
              <li>Email address (only if you choose to provide it)</li>
              <li>This data helps us improve CardSpark and is stored securely</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">External Services</h3>
            <p className="text-gray-700 mb-4">
              CardSpark uses these external services:
            </p>
            <ul className="list-disc list-inside text-gray-700 mb-6 space-y-1">
              <li><strong>QR Code API:</strong> We use api.qrserver.com to generate QR codes for your public card URLs</li>
              <li><strong>Fonts:</strong> We load fonts from Google Fonts for better typography</li>
            </ul>

            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700">
              If you have any questions about privacy, security, or data handling, please contact us through our feedback form. We are committed to transparency and protecting your personal information.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
