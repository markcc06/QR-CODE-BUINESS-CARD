"use client";

import { useMemo, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useCardStore } from "@/store/cardStore";
import { useClientOCR } from "@/hooks/useClientOCR";
import { extractFields } from "@/lib/extractFields";

// 将过大的图片等比压缩到不超过 maxDim（默认 2000px）
async function downscaleImage(file: File, maxDim = 2000): Promise<Blob | File> {
  try {
    const bmp = await createImageBitmap(file);
    const { width, height } = bmp;
    const largest = Math.max(width, height);
    if (largest <= maxDim) {
      bmp.close();
      return file; // 不需要压缩
    }
    const scale = maxDim / largest;
    const w = Math.max(1, Math.round(width * scale));
    const h = Math.max(1, Math.round(height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      bmp.close();
      return file;
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bmp, 0, 0, w, h);
    bmp.close();

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", 0.92)
    );
    return blob ?? file;
  } catch {
    return file; // 任意异常下退回原图，保证流程不中断
  }
}

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

export default function UploadCard({ className, children }: { className?: string; children?: React.ReactNode }) {
  const inputRef = useRef<HTMLInputElement>(null);

  // 客户端 OCR hook（包含预热、进度与取消）
  const { recognize, busy: running, progress } = useClientOCR();

  // 仅当显式要求时才走“服务端兜底”分支
  const USE_SERVER = useMemo(
    () => process.env.NEXT_PUBLIC_OCR_MODE === "server",
    []
  );

  const [loading, setLoading] = useState(false); // 仅用于服务端兜底分支
  const { setRecognizing } = useCardStore();

  const handleClick = () => {
    if (running || loading) return;
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

    // ------- 分支 A：客户端 OCR（默认）-------
    if (!USE_SERVER) {
      setRecognizing(true);
      try {
        // 先等比压缩到 2000px，显著降低 CPU 时间
        const src = await downscaleImage(file, 2000);

        const { text, confidence } = await recognize(src as any);
        // 将纯文本进一步抽取为结构化字段
        const f = extractFields(text || "");
        const payload: OcrResult = {
          rawText: text,
          firstName: f.firstName,
          lastName: f.lastName,
          jobTitle: f.jobTitle,
          company: f.company,
          email: f.email,
          phone: f.phone,
          website: f.website,
          location: f.location,
        };

        // 控制台给一点可见的调试信息
        console.debug(
          "[OCR] client result",
          { len: text?.length ?? 0, confidence, fields: f }
        );

        // 仍沿用全局事件，保持与原有表单填充逻辑的兼容
        window.dispatchEvent(
          new CustomEvent<OcrResult>("ocr-success", { detail: payload })
        );
        // 兼容旧监听名（如果外层曾用过不同事件名）
        window.dispatchEvent(
          new CustomEvent<OcrResult>("ocrResult", { detail: payload })
        );

        const conf =
          typeof confidence === "number" ? ` (${Math.round(confidence)}%)` : "";
        toast.success(`OCR recognition successful${conf}.`);
      } catch (err: any) {
        if (err?.name === "AbortError") {
          toast.error("OCR canceled.");
        } else {
          toast.error(`OCR failed: ${err?.message || String(err)}`);
        }
      } finally {
        setRecognizing(false);
        if (inputRef.current) inputRef.current.value = "";
      }
      return;
    }

    // ------- 分支 B：服务端兜底（仅当 NEXT_PUBLIC_OCR_MODE=server 时启用）-------
    setLoading(true);
    setRecognizing(true);

    // 120s 超时，避免悬挂（首次加载可能较慢）
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort("timeout" as any), 120_000);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const res = await fetch("/api/recognize-card", {
        method: "POST",
        body: fd,
        signal: controller.signal,
        cache: "no-store",
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
        const hint = (data as any)?.hint ? `\nHint: ${(data as any).hint}` : "";
        const msg = (data as any)?.error || `${res.status} ${res.statusText}`;
        if (res.status === 405) {
          throw new Error(
            "405 Method Not Allowed: API expects POST with form-data field `file`." +
              hint
          );
        }
        if (res.status === 404) {
          throw new Error(
            "404 Not Found: /api/recognize-card route missing or build not updated." +
              hint
          );
        }
        throw new Error(msg + hint);
      }

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
      const hasAnyField = !!(
        payload.firstName ||
        payload.lastName ||
        payload.jobTitle ||
        payload.company ||
        payload.email ||
        payload.phone ||
        payload.website ||
        payload.location
      );
      if (!hasText && !hasAnyField) {
        throw new Error("Empty OCR result. Please try a clearer image.");
      }

      window.dispatchEvent(new CustomEvent<OcrResult>("ocr-success", { detail: payload }));
      toast.success("OCR recognition successful.");
    } catch (err: any) {
      if (err?.name === "AbortError" || err === "timeout" || err?.message === "timeout") {
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

  const disabled = running || loading;
  const pct = Math.round((progress ?? 0) * 100);

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onChange}
      />
      <Button type="button" onClick={handleClick} disabled={disabled} className={className}>
        <Upload className="w-4 h-4 mr-1" />
        {disabled ? `Recognizing${running ? ` ${pct}%` : "..."}` : (children ?? "Upload Card")}
      </Button>
    </>
  );
}
