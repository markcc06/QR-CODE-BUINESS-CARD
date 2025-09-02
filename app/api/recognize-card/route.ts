import * as Tesseract from 'tesseract.js';
import { createRequire } from 'module';
import { pathToFileURL } from 'url';
import path from 'path';
import fs from 'fs';
import { extractFields } from '@/lib/extractFields';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

// ESM 下用 createRequire 拿到绝对路径（避免相对/打包问题）
const require = createRequire(import.meta.url);
const requireFromCwd = createRequire(pathToFileURL(path.join(process.cwd(), 'index.js')));
function resolveWorkerPath(): string {
  const env = process.env.TESS_WORKER_PATH;
  if (env && path.isAbsolute(env) && fs.existsSync(env)) return env;

  // 1) 运行时解析：Node 版 worker 脚本（避免浏览器 worker 的 addEventListener 错误）
  try {
    const abs = requireFromCwd.resolve('tesseract.js/src/worker-script/node/index.js');
    if (path.isAbsolute(abs) && fs.existsSync(abs)) return abs;
  } catch {}

  // 2) 通过 package.json 反推
  try {
    const pkg = requireFromCwd.resolve('tesseract.js/package.json');
    const abs2 = path.join(path.dirname(pkg), 'src', 'worker-script', 'node', 'index.js');
    if (fs.existsSync(abs2)) return abs2;
  } catch {}

  // 3) 直接拼本地 node_modules（本地 dev 常见布局）
  const cand = path.join(
    process.cwd(),
    'node_modules',
    'tesseract.js',
    'src',
    'worker-script',
    'node',
    'index.js'
  );
  if (fs.existsSync(cand)) return cand;

  // 4) 解析失败：返回空字符串，调用处会抛出明确错误
  return '';
}
const WORKER_JS = resolveWorkerPath();

// 核心 wasm 走 CDN，避免被打包进函数或 ENOENT
const CORE_WASM_URL =
  process.env.TESS_CORE_URL ||
  'https://cdn.jsdelivr.net/npm/tesseract.js-core@5.0.0/tesseract-core-simd.wasm';

// 语言包路径：优先项目根 ./tessdata/，否则用 node_modules/@tesseract.js-data/eng，再否则用环境变量，最后 CDN 兜底
function ensureSlash(x?: string | null) {
  if (!x) return undefined;
  if (x.endsWith('/') || x.endsWith(path.sep)) return x;
  return x + '/';
}
const LOCAL_LANG_DIR = fs.existsSync(path.join(process.cwd(), 'tessdata'))
  ? ensureSlash(path.join(process.cwd(), 'tessdata'))
  : undefined;

// 超级兜底：官方稳定 CDN（避免首次冷启动拉取失败）
const CDN_LANG_BASE = ensureSlash(
  process.env.TESS_LANG_BASE_FALLBACK ||
    'https://cdn.jsdelivr.net/npm/@tesseract.js-data/eng@1.0.0/'
);

// Only accept HTTP(S) env for lang base to avoid Next.js replacing local paths with (rsc)/ pseudo-paths
const ENV_LANG_BASE_RAW = process.env.TESS_LANG_BASE || process.env.NEXT_PUBLIC_TESS_LANG_BASE || '';
const ENV_LANG_BASE = /^https?:\/\//i.test(ENV_LANG_BASE_RAW) ? ensureSlash(ENV_LANG_BASE_RAW) : undefined;

let EFFECTIVE_LANG_BASE: string | undefined = CDN_LANG_BASE; // default to CDN
let LANG_BASE_SOURCE: 'local' | 'env' | 'cdn' = 'cdn';

if (fs.existsSync(path.join(process.cwd(), 'tessdata'))){
  EFFECTIVE_LANG_BASE = ensureSlash(path.join(process.cwd(), 'tessdata'));
  LANG_BASE_SOURCE = 'local';
} else if (ENV_LANG_BASE) {
  EFFECTIVE_LANG_BASE = ENV_LANG_BASE;
  LANG_BASE_SOURCE = 'env';
}

// CORS 头
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST,GET,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// 复用 worker（冷启动后可被复用）
type WorkerType = {
  recognize: (input: any) => Promise<any>;
  terminate: () => Promise<void>;
  setParameters?: (p: any) => Promise<void>;
};

declare global {
  // eslint-disable-next-line no-var
  var __qr_ocr_worker: WorkerType | undefined;
}

async function getWorker(): Promise<WorkerType> {
  if (globalThis.__qr_ocr_worker) return globalThis.__qr_ocr_worker;

  console.log(
    '[OCR] worker js:', WORKER_JS || '(unresolved)',
    'abs:', WORKER_JS ? path.isAbsolute(WORKER_JS) : false,
    'exists:', WORKER_JS ? fs.existsSync(WORKER_JS) : false
  );
  if (!WORKER_JS || !path.isAbsolute(WORKER_JS) || !fs.existsSync(WORKER_JS)) {
    throw new Error('WORKER_PATH_RESOLVE_FAILED');
  }

  const resolvedCore = process.env.TESS_CORE_URL?.trim() || CORE_WASM_URL;
  const worker: any = await (Tesseract as any).createWorker(
    'eng',
    undefined,
    {
      workerPath: WORKER_JS,
      corePath: resolvedCore,
      langPath: EFFECTIVE_LANG_BASE,
      cachePath: '/tmp/tess-cache',
      gzip: true,
    }
  );

  try {
    await worker.setParameters?.({
      tessedit_pageseg_mode: 6,
      preserve_interword_spaces: 1,
    });
  } catch {
    // 忽略设置失败
  }

  globalThis.__qr_ocr_worker = worker;
  return worker;
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS as any });
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const warmup = url.searchParams.get('warmup') || url.searchParams.get('init');
  let warmed = false;
  if (warmup && ['1', 'true', 'yes'].includes(warmup.toLowerCase())) {
    try {
      await getWorker();
      warmed = true;
    } catch {
      // 忽略预热失败，仍返回探活信息
    }
  }
  return Response.json(
    {
      ok: true,
      runtime: 'nodejs',
      node: process.version,
      worker: WORKER_JS,
      workerIsAbsolute: !!WORKER_JS && path.isAbsolute(WORKER_JS),
      workerExists: !!WORKER_JS && fs.existsSync(WORKER_JS),
      core: CORE_WASM_URL,
      langBase: EFFECTIVE_LANG_BASE || null,
      langBaseSource: LANG_BASE_SOURCE,
      hasLocalTessdata: !!LOCAL_LANG_DIR,
      warmed,
    },
    { headers: CORS_HEADERS as any }
  );
}

export async function POST(req: Request) {
  try {
    const contentType = req.headers.get('content-type') || '';
    if (!contentType.includes('multipart/form-data')) {
      return Response.json(
        { ok: false, error: 'Expected multipart/form-data with field "file"' },
        { status: 400, headers: CORS_HEADERS as any }
      );
    }

    const form = await req.formData();

    // 优先常用字段，其次自动扫描第一个 File，最后支持 dataURL/base64 兜底
    let file = (form.get('file') as File | null) ||
               (form.get('image') as File | null) ||
               (form.get('photo') as File | null) ||
               (form.get('upload') as File | null);

    if (!file) {
      for (const [k, v] of form.entries()) {
        if (v instanceof File) {
          file = v as File;
          break;
        }
      }
    }

    let input: Buffer | undefined;

    if (!file) {
      // 兜底：支持 dataURL / base64 文本字段
      const dataUrl = (form.get('dataUrl') || form.get('dataURL') || form.get('imageBase64') || form.get('data')) as string | null;
      if (dataUrl && /^data:image\/[a-zA-Z0-9.+-]+;base64,/.test(dataUrl)) {
        const b64 = dataUrl.split(',')[1];
        try {
          input = Buffer.from(b64, 'base64');
        } catch {
          return Response.json(
            { ok: false, error: 'Invalid base64 in data URL' },
            { status: 400, headers: CORS_HEADERS as any }
          );
        }
      }
    }

    if (!file && !input) {
      // 把可见字段名回显出来，便于前端对齐
      const keys = Array.from(form.keys());
      return Response.json(
        { ok: false, error: 'No file provided', hint: 'Expect field name "file" (or image/photo/upload). Got: ' + keys.join(',') },
        { status: 400, headers: CORS_HEADERS as any }
      );
    }

    if (!input && file) {
      const ab = await file.arrayBuffer();
      input = Buffer.from(ab);
    }

    // 可选：sharp 预处理（生产建议关闭：ENABLE_SERVER_SHARP=0）
    if (process.env.ENABLE_SERVER_SHARP === '1') {
      try {
        const sharp = (await import('sharp')).default;
        input = await sharp(input!)
          .rotate()
          .resize({ width: 1800, withoutEnlargement: true })
          .toFormat('png')
          .toBuffer();
      } catch {
        console.warn('[OCR] sharp not available, skip preprocess');
      }
    }

    const worker = await getWorker();
    const { data } = await worker.recognize(input!);
    const text: string = data?.text ?? '';
    const parsed = extractFields(text || '');

    return Response.json(
      {
        ok: true,
        // 供调试/显示
        text,
        confidence: data?.confidence ?? undefined,
        // 表单回填字段
        firstName: parsed.firstName,
        lastName: parsed.lastName,
        jobTitle: parsed.jobTitle,
        company: parsed.company,
        email: parsed.email,
        phone: parsed.phone,
        website: parsed.website,
        location: parsed.location,
      },
      { headers: CORS_HEADERS as any }
    );
  } catch (err: any) {
    console.error('[OCR] error', err);
    return Response.json(
      { ok: false, error: err?.message || String(err) },
      { status: 500, headers: CORS_HEADERS as any }
    );
  }
}
