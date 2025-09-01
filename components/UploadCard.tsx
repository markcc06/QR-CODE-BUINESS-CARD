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
    const file = e.target.files?.[0];
    if (!file) return;

    // 基础校验：仅图片、限制体积（10MB）
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file.");
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image is too large (max 10MB).");
      e.target.value = "";
      return;
    }

    setLoading(true);
    setRecognizing(true);

    // 60s 超时，避免悬挂
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 60_000);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/recognize-card", {
        method: "POST",
        body: fd,
        signal: controller.signal,
        // 不要手动设置 Content-Type，让浏览器带表单边界
        // credentials 默认 same-origin 即可
      });

      const raw = await res.text();
      let data: (OcrResult & { error?: string }) | undefined;
      try {
        data = raw ? (JSON.parse(raw) as OcrResult & { error?: string }) : undefined;
      } catch {
        // 非 JSON 响应（比如 404 的 HTML），直接当作错误抛出
        throw new Error(raw || `${res.status} ${res.statusText}`);
      }

      if (!res.ok || data?.error) {
        const msg = data?.error || `${res.status} ${res.statusText}`;
        // 针对常见误用给出提示
        if (res.status === 405) {
          throw new Error("405 Method Not Allowed: API expects POST with form-data field `file`.");
        }
        if (res.status === 404) {
          throw new Error("404 Not Found: /api/recognize-card route missing or build not updated.");
        }
        throw new Error(msg);
      }

      // 广播识别成功事件（避免跨 RSC 传函数）
      window.dispatchEvent(new CustomEvent<OcrResult>("ocr-success", { detail: data }));
      toast.success("OCR recognition successful. Fields filled.");
    } catch (err: any) {
      if (err?.name === "AbortError") {
        toast.error("OCR timed out. Please try a clearer image.");
      } else {
        toast.error(`OCR failed: ${err?.message || String(err)}`);
      }
    } finally {
      clearTimeout(timeout);
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
