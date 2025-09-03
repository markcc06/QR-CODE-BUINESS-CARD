'use client';

import React, { useState, useEffect } from 'react';
import { Upload, Loader2, Crop } from 'lucide-react';
import { useCardStore } from '@/store/cardStore';
import CropperModal from './CropperModal';
import {
  compressFileToDataURL,
  compressDataURL,
  dataURLByteSize,
} from '@/lib/image';
import { extractFields } from '@/lib/extractFields';
import { prewarmClientOCR, recognizeAndExtract } from '@/lib/client-ocr';

function dataURLToBlob(dataURL: string): Blob {
  const [meta, b64] = dataURL.split(',');
  const match = /data:(.*?);base64/.exec(meta || '');
  const mime = (match && match[1]) || 'image/png';
  const binary = atob(b64 || '');
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

export default function CardUploader() {
  const [cardImage, setCardImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const USE_SERVER = process.env.NEXT_PUBLIC_OCR_MODE === 'server';

  const {
    setActiveTab,
    setPerson,
    setTemplate,
    isRecognizing,
    recognizeProgress,
    setRecognizing,
    setRecognizeProgress,
  } = useCardStore();

  // 组件挂载后即预热 OCR（静默失败即可）
  useEffect(() => {
    prewarmClientOCR().catch(() => {});
  }, []);

  /** 选择本地名片图片后，做一次压缩，存为 dataURL 以便预览/裁剪 */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const compressed = await compressFileToDataURL(file, {
      maxWidth: 1800,
      maxHeight: 1800,
      maxBytes: 4 * 1024 * 1024,
    });
    setCardImage(compressed);
  };

  /** 裁剪完成后回填 */
  const onCropConfirmAction = async (croppedDataURL: string) => {
    const finalDataURL = await compressDataURL(croppedDataURL, {
      maxWidth: 1800,
      maxHeight: 1800,
      maxBytes: 4 * 1024 * 1024,
    });
    setCardImage(finalDataURL);
    setShowCropper(false);
  };
  const onCloseAction = () => setShowCropper(false);

  /** 触发 OCR 识别（dataURL -> Blob -> FormData -> /api/recognize-card） */
  const recognizeCard = async () => {
    if (!cardImage || isRecognizing) return;

    // ------- 分支 A：客户端 OCR（默认）-------
    if (!USE_SERVER) {
      setRecognizing(true);
      setRecognizeProgress(0);

      try {
        // 先尝试预热（允许静默失败）
        try {
          await prewarmClientOCR((m) => {
            const p = Math.round((m.progress ?? 0) * 80);
            setRecognizeProgress(p);
          });
        } catch {}

        // dataURL -> Blob
        const blob = dataURLToBlob(cardImage);

        const { ok, text, confidence, fields } = await recognizeAndExtract(blob, {
          maxSide: 1800,
          onProgress: (m) => {
            const p = Math.round((m.progress ?? 0) * 98);
            setRecognizeProgress(p);
          },
        });

        const plain = (text || '').trim();
        if (!plain) throw new Error('Empty OCR text');

        const f: any = fields ?? extractFields(plain) ?? {};

        // 调试日志：在本地可见，线上不会打爆控制台
        if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
          console.debug('[OCR] client result', { len: plain.length, confidence, ok, fields: f });
        }

        // 同步派发事件，兼容其它组件/旧逻辑的监听（把结构化字段也带上）
        const detail = {
          rawText: plain,
          firstName: f.firstName,
          lastName: f.lastName,
          jobTitle: f.jobTitle,
          company: f.company,
          email: f.email,
          phone: f.phone,
          website: f.website,
          location: f.address || f.location,
        };
        window.dispatchEvent(new CustomEvent('ocr-success', { detail }));
        window.dispatchEvent(new CustomEvent('ocrResult', { detail }));

        // 解析并回填表单
        setPerson({
          firstName: f.firstName || '',
          lastName: f.lastName || '',
          jobTitle: f.jobTitle || '',
          company: f.company || '',
          email: f.email || '',
          phone: f.phone || '',
          website: f.website || '',
          location: f.address || f.location || '',
          socials: f.socials || [],
        } as any);

        setTemplate('classic');
        setActiveTab('basics');
        setRecognizeProgress(100);
      } catch (e: any) {
        console.error('client ocr error', e);
        alert(e?.message || 'Recognition failed. Please try again with a clearer photo.');
        setRecognizeProgress(0);
      } finally {
        setTimeout(() => {
          setRecognizing(false);
          setRecognizeProgress(0);
        }, 500);
      }
      return;
    }

    // ------- 分支 B：服务端兜底（仅当 NEXT_PUBLIC_OCR_MODE=server 时启用）-------
    setRecognizing(true);
    setRecognizeProgress(0);

    // 后台预热（若还未预热成功）
    try {
      const ctrl = new AbortController();
      setTimeout(() => ctrl.abort('warmup_timeout'), 45000);
      fetch('/api/recognize-card?warmup=1', { signal: ctrl.signal, cache: 'no-store' }).catch(() => {});
    } catch {}

    // 伪进度条（提升感知）
    let p = 0;
    const fake = setInterval(() => {
      p = Math.min(p + 4, 95);
      setRecognizeProgress(p);
      if (p >= 95) clearInterval(fake);
    }, 120);

    // 真·超时控制（首启 Tesseract 可能较慢，可先放宽）
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort('timeout'), 150_000); // 150s

    try {
      // dataURL -> Blob -> FormData
      const blob = dataURLToBlob(cardImage);
      const fd = new FormData();
      fd.append('dataUrl', cardImage);
      fd.append('file', blob, 'card.jpg');

      const res = await fetch('/api/recognize-card', {
        method: 'POST',
        body: fd,
        signal: controller.signal,
        cache: 'no-store',
      });

      if (!res.ok) {
        // 422 = 空结果；其他 = 服务器错误
        const err = await res.json().catch(() => ({} as any));
        const msg = err?.error || `HTTP ${res.status}`;
        const hint = err?.hint ? `\nHint: ${err.hint}` : '';
        throw new Error(msg + hint);
      }

      const data = await res.json();

      // 统一从 { ok, text } 中拿原始文本，再用 extractFields 解析结构化字段
      const rawText: string =
        (data && (data.text || data.rawText || data?.data?.text)) || '';
      if (!rawText) {
        throw new Error('Empty OCR text');
      }
      const parsed: any = extractFields(rawText) || {};

      setPerson({
        firstName: parsed.firstName || '',
        lastName: parsed.lastName || '',
        jobTitle: parsed.jobTitle || '',
        company: parsed.company || '',
        email: parsed.email || '',
        phone: parsed.phone || '',
        website: parsed.website || '',
        location: parsed.address || parsed.location || '',
        socials: parsed.socials || [],
      } as any);

      setTemplate('classic');
      setActiveTab('basics');
      setRecognizeProgress(100);
    } catch (e: any) {
      if (e?.name === 'AbortError' || e === 'timeout' || e?.message === 'timeout') {
        alert('Timeout: OCR took too long. Try a clearer photo or retry.');
      } else {
        console.error('recognize error', e);
        alert('Recognition failed. Please try again with a clearer photo.');
      }
      setRecognizeProgress(0);
    } finally {
      clearTimeout(timeout);
      clearInterval(fake);
      setTimeout(() => {
        setRecognizing(false);
        setRecognizeProgress(0);
      }, 500);
    }
  };

  return (
    <div className="mt-4 space-y-6">
      {/* 上传说明与按钮 */}
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Upload Paper Card (Optional)</h3>
        <p className="text-gray-500">
          Upload a photo of your existing business card for reference. This will
          be displayed alongside the form to help you copy the information.
        </p>

        <div className="w-full p-4 border border-gray-200 rounded-lg">
          <button
            onClick={() => document.getElementById('card-upload')?.click()}
            className="w-full py-3 flex items-center justify-center gap-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Upload className="w-5 h-5" />
            <span>Upload Paper Card Photo</span>
          </button>

          <p className="text-gray-400 text-xs mt-2">
            Tip: Upload a clear, well-lit image. Blurry, tilted, reflective, or
            low-resolution photos may reduce recognition accuracy.
          </p>

          <input
            id="card-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      {/* 预览 + 操作 */}
      {cardImage && (
        <div className="relative space-y-3">
          <div className="relative border border-gray-200 rounded-lg overflow-hidden">
            <img
              src={cardImage}
              alt="Business Card"
              className="w-full object-contain"
            />

            {isRecognizing && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <p className="text-white mb-2">Recognizing…</p>
                <div className="w-3/4 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300 ease-out"
                    style={{ width: `${recognizeProgress}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setShowCropper(true)}
              className="flex-1 py-2 rounded-lg flex items-center justify-center gap-2 border border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={isRecognizing}
              title={
                cardImage
                  ? `Size: ${(dataURLByteSize(cardImage) / 1024 / 1024).toFixed(
                      2
                    )} MB`
                  : undefined
              }
            >
              <Crop className="w-4 h-4" />
              Crop
            </button>

            <button
              onClick={recognizeCard}
              disabled={isRecognizing}
              className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                isRecognizing
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {isRecognizing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : null}
              <span>{isRecognizing ? 'Processing…' : 'Recognize Card'}</span>
            </button>
          </div>
        </div>
      )}

      {/* 裁剪弹窗（注意：使用 onConfirmAction / onCloseAction 命名） */}
      <CropperModal
        open={showCropper}
        src={cardImage || ''}
        onConfirmAction={onCropConfirmAction}
        onCloseAction={onCloseAction}
      />
    </div>
  );
}
