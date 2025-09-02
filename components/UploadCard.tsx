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
    // 先后台预热 OCR（不影响用户交互）
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort('warmup_timeout'), 45000);
      fetch('/api/recognize-card?warmup=1', { signal: ctrl.signal, cache: 'no-store' }).catch(() => {});
    } catch {}
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

    // 120s 超时，避免悬挂（首次加载可能较慢）
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort('timeout'), 120_000);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/recognize-card", {
        method: "POST",
        body: fd,
        signal: controller.signal,
        cache: 'no-store',
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
        const hint = (data as any)?.hint ? `\nHint: ${(data as any).hint}` : '';
        const msg = (data as any)?.error || `${res.status} ${res.statusText}`;
        if (res.status === 405) {
          throw new Error("405 Method Not Allowed: API expects POST with form-data field `file`." + hint);
        }
        if (res.status === 404) {
          throw new Error("404 Not Found: /api/recognize-card route missing or build not updated." + hint);
        }
        throw new Error(msg + hint);
      }

      // 规范化服务端返回：既支持 raw text，也支持结构化字段
      const payload: OcrResult = {
        rawText: (data as any)?.text ?? "",
        firstName: (data as any)?.firstName,
        lastName: (data as any)?.lastName,
        jobTitle: (data as any)?.jobTitle,
        company: (data as any)?.company,
        email: (data as any)?.email,
        phone: (data as any)?.phone,
        website: (data as any)?.website,
        location: (data as any)?.location,
      };

      const hasText = !!payload.rawText?.trim();
      const hasAnyField = !!(payload.firstName || payload.lastName || payload.jobTitle || payload.company || payload.email || payload.phone || payload.website || payload.location);
      if (!hasText && !hasAnyField) {
        throw new Error("Empty OCR result. Please try a clearer image.");
      }

      // 广播识别成功事件（避免跨 RSC 传函数）
      window.dispatchEvent(new CustomEvent<OcrResult>("ocr-success", { detail: payload }));
      toast.success("OCR recognition successful.");
    } catch (err: any) {
      if (err?.name === "AbortError" || err === 'timeout' || err?.message === 'timeout') {
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
