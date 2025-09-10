'use client';
/**
 * Front-end OCR (browser) helper for CardSpark
 * --------------------------------------------------------------
 * Why client-side?  Avoids Vercel 60s limits & server WASM quirks.
 * This module:
 *  - lazily loads tesseract.js only in the browser
 *  - uses either a same-origin Blob shim to import the CDN worker
 *    OR a locally-bundled worker path when provided via env
 *  - prewarms language data & supports progress callbacks
 *  - downscales big images client-side for speed/accuracy
 *
 * Tesseract.js v5 notes:
 *  - createWorker(signature) is: createWorker(langs?, oem?, opts?)
 *  - v5 会根据第一个参数加载语言；loadLanguage/initialize 可省略（兼容保留）
 *  - prefer gzip-compressed traineddata (.gz)
 *  - corePath 必须是“目录前缀”（非具体 .wasm 文件）
 */

import type { RecognizeResult } from 'tesseract.js';
import { extractFields } from './extractFields';

export type OCRProgress = { status?: string; progress?: number };
export type ClientOCRReturn = { text: string; confidence: number; raw: RecognizeResult['data'] };
export type ClientOCRWithFields = ClientOCRReturn & {
  ok: boolean;
  fields?: {
    firstName?: string; lastName?: string; jobTitle?: string; company?: string;
    email?: string; phone?: string; website?: string; location?: string;
  };
};

// ---- Configuration (URLs can be overridden via NEXT_PUBLIC_*) ----
const DEFAULTS = {
  // 默认走 CDN worker；如需本地构建，设置 NEXT_PUBLIC_TESS_WORKER_URL=tesseract.js/src/worker-script/browser/index.js
  CDN_WORKER: 'https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/worker.min.js',
  CORE_BASE: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.1.1', // 目录（非 .wasm）
  LANG_BASE:
    (process.env.NEXT_PUBLIC_TESS_LANG_BASE as string) ||
    'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/', // 结尾必须带 /
  LANGS: (process.env.NEXT_PUBLIC_TESS_LANGS as string) || 'eng',
  WORKER_SRC: (process.env.NEXT_PUBLIC_TESS_WORKER_URL as string) || '', // 可设为本地模块路径
};

function getLangList() {
  return DEFAULTS.LANGS.split(/[+\s,]+/).map(s => s.trim()).filter(Boolean);
}
function getLangsArray() {
  return getLangList();
}

// 单例 worker，避免重复初始化
let workerPromise: Promise<any> | null = null;
let currentBlobUrl: string | null = null;

// ----------------------------------------------------------------------------

function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

async function ensureTesseract() {
  // 动态 import，避免被 Next 打到服务端包
  return await import('tesseract.js');
}

function getPaths() {
  const workerSrc = DEFAULTS.WORKER_SRC || DEFAULTS.CDN_WORKER;
  const coreBaseRaw = (process.env.NEXT_PUBLIC_TESS_CORE_BASE as string) || DEFAULTS.CORE_BASE;
  const coreBase = coreBaseRaw.endsWith('/') ? coreBaseRaw : coreBaseRaw + '/';
  const langBase = (DEFAULTS.LANG_BASE.endsWith('/') ? DEFAULTS.LANG_BASE : DEFAULTS.LANG_BASE + '/');
  return { workerSrc, coreBase, langBase } as const;
}

/** 生成同源 Blob worker（内部 importScripts 远程 CDN worker） */
function makeWorkerBlobUrl(workerSrcUrl: string) {
  if (currentBlobUrl) {
    try { URL.revokeObjectURL(currentBlobUrl); } catch {}
    currentBlobUrl = null;
  }
  const js = `/* CardSpark OCR worker shim */\nself.importScripts('${workerSrcUrl}');`;
  const blob = new Blob([js], { type: 'application/javascript' });
  currentBlobUrl = URL.createObjectURL(blob);
  return currentBlobUrl;
}

/** 预取一个 URL（不中断失败，不抛错） */
function silentPrefetch(url: string) {
  try { fetch(url, { mode: 'cors', credentials: 'omit', cache: 'force-cache' }).catch(() => {}); } catch {}
}

// ----------------------------------------------------------------------------

async function ensureWorker(onProgress?: (p: OCRProgress) => void) {
  if (!isBrowser()) throw new Error('client OCR can only run in browser');

  const { createWorker, PSM } = await ensureTesseract();
  const { workerSrc, coreBase, langBase } = getPaths();

  // 两种模式：
  // 1) env 未指定 -> 使用 CDN worker，通过 blob shim 导入（规避同源限制）
  // 2) env 指定本地模块路径 -> 让打包器处理该模块（同源加载）
  const useCdn = /^https?:\/\//i.test(workerSrc);
  const workerPath = useCdn ? makeWorkerBlobUrl(workerSrc) : workerSrc;

  const langs = getLangsArray();

  const worker = await createWorker(
    langs, // v5: array of langs is supported and avoids langsArr.map errors
    1,     // OEM.LSTM_ONLY
    {
      workerPath,
      corePath: coreBase, // corePath 必须是目录前缀，非具体 wasm 文件
      langPath: langBase,
      gzip: true,
      logger: (m: any) => {
        if (m && typeof m.progress === 'number') {
          onProgress?.({ status: m.status, progress: m.progress });
        }
      },
    }
  );

  // v5：使用 setParameters 设置页面分割等参数（比老的 initialize 更合适）
  await worker.setParameters({
    tessedit_pageseg_mode: PSM.SINGLE_BLOCK,
    preserve_interword_spaces: '1',
    user_defined_dpi: '300',
  });

  return worker;
}

/** 预热（加载语言包 & 启动 worker）——页面挂载时调用 */
export async function prewarmClientOCR(onProgress?: (p: OCRProgress) => void) {
  if (!isBrowser()) return;

  const { langBase, workerSrc } = getPaths();

  // 预拉 core wasm（显式列出常见文件，避免首拍抖动）
  const coreBaseForUrl = langBase.replace(/@tesseract\.js-data\/eng@.*$/, '') // keep origin if user overrides langBase
    || (getPaths().coreBase);
  try {
    const { coreBase } = getPaths();
    silentPrefetch(coreBase + 'tesseract-core-simd.wasm');
    silentPrefetch(coreBase + 'tesseract-core-simd-lstm.wasm.js');
    silentPrefetch(coreBase + 'tesseract-core-simd-lstm.wasm');
  } catch {}

  // 预拉语言包（支持 "eng+chi_sim"）
  for (const l of getLangList()) {
    silentPrefetch(new URL(`${l}.traineddata.gz`, langBase).toString());
  }
  // 预拉 worker 脚本（仅当使用 CDN）
  if (/^https?:\/\//i.test(workerSrc)) silentPrefetch(workerSrc);

  if (!workerPromise) workerPromise = ensureWorker(onProgress);
  return workerPromise;
}

/** 在浏览器运行 OCR。返回识别文本和置信度。 */
export async function runClientOCR(
  input: File | Blob | HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData,
  opts?: { maxSide?: number; onProgress?: (p: OCRProgress) => void; signal?: AbortSignal }
): Promise<ClientOCRReturn> {
  if (!isBrowser()) throw new Error('runClientOCR must be called in the browser');

  const { onProgress, signal } = opts || {};
  const maxSide = opts?.maxSide ?? 2000;

  if (!workerPromise) workerPromise = ensureWorker(onProgress);
  const source: HTMLCanvasElement | ImageData = await toProcessable(input, maxSide);

  // 允许中断：终止当前 worker 并清空单例
  const onAbort = () => {
    try { workerPromise && workerPromise.then(w => w.terminate()); } catch {}
    workerPromise = null;
  };
  if (signal) {
    if (signal.aborted) onAbort();
    signal.addEventListener('abort', onAbort, { once: true });
  }

  try {
    const worker = await workerPromise;
    const { data } = await worker.recognize(source, { rotateAuto: true });
    const text = (data.text || '').trim();
    if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
      try {
        console.debug('[OCR] conf=%s len=%s head=%o', data.confidence ?? 0, text.length, text.slice(0, 120));
      } catch {}
    }
    return { text, confidence: data.confidence ?? 0, raw: data };
  } finally {
    if (signal) signal.removeEventListener('abort', onAbort);
  }
}

/** 识别 + 结构化字段，一步到位（给表单回填用） */
export async function recognizeAndExtract(
  input: File | Blob | HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData,
  opts?: { maxSide?: number; onProgress?: (p: OCRProgress) => void; signal?: AbortSignal }
): Promise<ClientOCRWithFields> {
  const r = await runClientOCR(input, opts);
  const text = r.text || '';
  const ok = text.trim().length > 5;
  const fields = ok ? extractFields(text) : undefined;
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    console.info('[OCR] fields', fields);
  }
  return { ok, fields, ...r };
}

// ---- helpers ---------------------------------------------------------------

async function toProcessable(
  input: File | Blob | HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData,
  maxSide: number
): Promise<HTMLCanvasElement | ImageData> {
  const bitmap = await ensureBitmap(input);
  const { width, height } = bitmap;

  // 画到 canvas（始终返回 Canvas 或 ImageData，符合 Tesseract ImageLike）
  const drawToCanvas = (w: number, h: number) => {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(bitmap, 0, 0, w, h);
      // 灰度化（轻量去噪，提高识别稳定性）
      const imgData = ctx.getImageData(0, 0, w, h);
      const d = imgData.data;
      for (let i = 0; i < d.length; i += 4) {
        const y = (d[i] * 299 + d[i + 1] * 587 + d[i + 2] * 114) / 1000;
        d[i] = d[i + 1] = d[i + 2] = y;
      }
      ctx.putImageData(imgData, 0, 0);
    }
    try { bitmap.close(); } catch {}
    return canvas;
  };

  if (Math.max(width, height) <= maxSide) {
    return drawToCanvas(width, height);
  }
  const scale = maxSide / Math.max(width, height);
  return drawToCanvas(Math.round(width * scale), Math.round(height * scale));
}

async function ensureBitmap(
  input: File | Blob | HTMLImageElement | HTMLCanvasElement | ImageBitmap | ImageData
): Promise<ImageBitmap> {
  if (input instanceof ImageBitmap) return input;
  if (input instanceof HTMLCanvasElement) return await createImageBitmap(input);
  if (input instanceof HTMLImageElement) return await createImageBitmap(input);
  if (input instanceof ImageData) {
    const c = document.createElement('canvas');
    c.width = input.width; c.height = input.height;
    const ctx = c.getContext('2d'); if (!ctx) throw new Error('2D canvas not available');
    ctx.putImageData(input, 0, 0);
    return await createImageBitmap(c);
  }
  // File / Blob
  return await createImageBitmap(input as Blob);
}

/** 主动释放单例 worker（切换语言或页面卸载时可用） */
export async function resetClientOCR() {
  if (!workerPromise) return;
  try { const w = await workerPromise; await w.terminate(); } catch {}
  workerPromise = null;
  if (currentBlobUrl) { try { URL.revokeObjectURL(currentBlobUrl); } catch {} currentBlobUrl = null; }
}
