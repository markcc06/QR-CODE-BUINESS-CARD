"use client";

import { Card } from "@/types/card";
import { Button } from "@/components/ui/button";
import { Download, Share2, Eye } from "lucide-react";
import { downloadVCard } from "@/lib/vcard";
import CardTemplateRenderer from "./CardTemplateRenderer";
import { useCardStore } from "@/store/cardStore";

let useCardFormStore: any;
try {
  useCardFormStore = require("@/store/cardFormStore").useCardFormStore;
} catch {
  useCardFormStore = null;
}

interface CardPreviewProps {
  card: Card;
  qrCodeUrl?: string;
  publicUrl?: string;
}

export default function CardPreview({ card, qrCodeUrl, publicUrl }: CardPreviewProps) {
  const { isRecognizing, recognizeProgress } = useCardStore();

  let mergedCard: any = card;
  let rawText: string | undefined = "";
  if (useCardFormStore) {
    const s = useCardFormStore.getState?.();
    if (s) {
      mergedCard = {
        ...card,
        template: (card as any)?.template ?? s.template ?? "minimal",
        person: {
          ...(card as any)?.person,
          givenName: (card as any)?.person?.givenName ?? s.firstName ?? "",
          familyName: (card as any)?.person?.familyName ?? s.lastName ?? "",
          title: (card as any)?.person?.title ?? s.jobTitle ?? "",
          org: (card as any)?.person?.org ?? s.company ?? "",
          email: (card as any)?.person?.email ?? s.email ?? "",
          phone: (card as any)?.person?.phone ?? s.phone ?? "",
          url: (card as any)?.person?.url ?? s.website ?? "",
          location: (card as any)?.person?.location ?? s.location ?? "",
        },
      };
      rawText = s.rawText;
    }
  }

  const handleDownloadVCard = () => {
    if ((mergedCard as any)?.person) downloadVCard((mergedCard as any).person);
  };

  const handleShare = async () => {
    if (publicUrl && navigator.share) {
      try {
        await navigator.share({
          title: `${(mergedCard as any)?.person?.givenName ?? ""} ${(mergedCard as any)?.person?.familyName ?? ""} - Digital Business Card`,
          text: `Check out my digital business card`,
          url: publicUrl,
        });
      } catch {
        if (publicUrl) {
          await navigator.clipboard.writeText(publicUrl);
          alert("Link copied to clipboard!");
        }
      }
    } else if (publicUrl) {
      await navigator.clipboard.writeText(publicUrl);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Preview</h3>
        {publicUrl && (
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleDownloadVCard}>
              <Download className="w-4 h-4 mr-1" />
              vCard
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-1" />
              Share
            </Button>
            <Button
              size="sm"
              onClick={() => window.open(publicUrl, "_blank")}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Eye className="w-4 h-4 mr-1" />
              View Public
            </Button>
          </div>
        )}
      </div>

      <div className="relative bg-gray-50 p-6 rounded-xl">
        <CardTemplateRenderer card={mergedCard} />
        {isRecognizing && (
          <div className="absolute inset-0 rounded-xl bg-black/40 flex flex-col items-center justify-center">
            <p className="text-white mb-2">Recognizing...</p>
            <div className="w-2/3 h-2 bg-gray-300 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ width: `${recognizeProgress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {qrCodeUrl && (
        <div className="text-center">
          <h4 className="text-lg font-medium text-gray-900 mb-3">QR Code</h4>
          <div className="inline-block p-4 bg-white rounded-lg border">
            <img src={qrCodeUrl} alt="QR Code for digital business card" className="w-32 h-32" />
          </div>
          <p className="text-sm text-gray-500 mt-2">Scan to view your digital business card</p>
        </div>
      )}

      {rawText && (
        <div className="rounded-lg border p-4 bg-white">
          <h4 className="text-sm font-medium mb-2">OCR Raw Text</h4>
          <pre className="whitespace-pre-wrap text-sm text-gray-600">{rawText}</pre>
        </div>
      )}
    </div>
  );
}
