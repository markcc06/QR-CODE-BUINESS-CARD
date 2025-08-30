"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCardStore } from "@/store/cardStore";

export type OcrResult = {
  firstName?: string;
  lastName?: string;
  jobTitle?: string;
  company?: string;
  email?: string;
  phone?: string;
  website?: string;
  location?: string;
  rawText?: string;
};

export default function UploadCard({ className }: { className?: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const { setRecognizing } = useCardStore();

  const handleClick = () => {
    if (loading) return;
    inputRef.current?.click();
  };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];
    setLoading(true);
    setRecognizing(true);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/recognize-card", { method: "POST", body: fd });
      const data = (await res.json()) as OcrResult & { error?: string };

      if (!res.ok || data?.error) {
        throw new Error(data?.error || "OCR failed");
      }

      // 广播识别成功事件（避免 cross RSC 传函数）
      window.dispatchEvent(new CustomEvent<OcrResult>("ocr-success", { detail: data }));
      toast.success("OCR recognition successful. Fields have been filled.");
    } catch (err: any) {
      toast.error(`OCR failed: ${err?.message || err}`);
    } finally {
      setLoading(false);
      setRecognizing(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />
      <Button type="button" onClick={handleClick} disabled={loading} className={className}>
        <Upload className="w-4 h-4 mr-1" />
        {loading ? "Recognizing..." : "Upload Card"}
      </Button>
    </>
  );
}
