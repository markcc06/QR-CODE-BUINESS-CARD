'use client';

import { useCallback, useRef, useState } from 'react';
import { prewarmClientOCR, runClientOCR, type OCRProgress } from '@/lib/client-ocr';

type Source =
  | File
  | Blob
  | HTMLImageElement
  | HTMLCanvasElement
  | ImageBitmap
  | ImageData;

export function useClientOCR() {
  const [status, setStatus] = useState<string>('');      // 只接受 string
  const [progress, setProgress] = useState<number>(0);   // 只接受 number
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const onProgress = useCallback((p: OCRProgress) => {
    // ⬇️ 兜底，避免把 string | undefined 传给 SetStateAction<string>
    setStatus(p?.status ?? '');
    setProgress(typeof p?.progress === 'number' ? p.progress : 0);
  }, []);

  const prewarm = useCallback(async () => {
    await prewarmClientOCR(onProgress);
  }, [onProgress]);

  const recognize = useCallback(
    async (src: Source) => {
      setBusy(true);
      setStatus('loading');
      setProgress(0);

      // 取消上一次
      abortRef.current?.abort();
      const ac = new AbortController();
      abortRef.current = ac;

      try {
        const { text, confidence, raw } = await runClientOCR(src, {
          onProgress,
          signal: ac.signal,
        });

        // ⬇️ 兜底，避免把 string | undefined 传给 SetStateAction<string>
        setStatus('done');
        setProgress(1);

        // 返回时也给调用方兜底，避免后续再把 undefined 往表单里塞
        return { text: (text ?? '').trim(), confidence: confidence ?? 0, raw };
      } catch (err) {
        setStatus('error');
        throw err;
      } finally {
        setBusy(false);
      }
    },
    [onProgress]
  );

  const cancel = useCallback(() => {
    abortRef.current?.abort();
    setStatus('aborted');
    setProgress(0);
  }, []);

  return { status, progress, busy, prewarm, recognize, cancel };
}