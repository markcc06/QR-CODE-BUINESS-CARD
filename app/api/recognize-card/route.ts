// app/api/recognize-card/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import Tesseract from "tesseract.js";
import { extractFields } from "@/lib/extractFields";
import fs from "node:fs";
import path from "node:path";

// 允许控制台查看真实错误（Vercel Functions 里也能看到）
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// 你的语言包基址（一定要有 / 结尾）
const LANG_BASE_RAW =
  process.env.NEXT_PUBLIC_TESS_LANG_BASE || process.env.TESS_LANG_BASE || "";
const LANG_BASE = LANG_BASE_RAW.endsWith("/") ? LANG_BASE_RAW : LANG_BASE_RAW + "/";

// 本地优先：如果项目里自带 tessdata，则优先使用本地路径，避免线上首次请求去下载语言包造成超时
const LOCAL_LANG_DIR = path.join(process.cwd(), "tessdata");
const HAS_LOCAL_ENG =
  fs.existsSync(path.join(LOCAL_LANG_DIR, "eng.traineddata")) ||
  fs.existsSync(path.join(LOCAL_LANG_DIR, "eng.traineddata.gz"));
const EFFECTIVE_LANG_BASE = HAS_LOCAL_ENG
  ? LOCAL_LANG_DIR + path.sep
  : LANG_BASE;

// 浏览器端 tesseract.js 的 CDN（仅在浏览器环境使用；本文件实际在 Node 端运行）
const TESS_CDN = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/";


// 为了避免 Vercel 上因缺少 linux-x64 的 sharp 二进制导致函数直接崩溃，
// 默认在生产环境（含 Vercel）关闭服务端 sharp 预处理。
// 如需开启，请在 Vercel 环境变量中设置：ENABLE_SERVER_SHARP=1
const ENABLE_SERVER_SHARP = process.env.ENABLE_SERVER_SHARP === "1";

function json(data: any, init?: number | ResponseInit) {
  return new NextResponse(JSON.stringify(data), {
    status: typeof init === "number" ? init : init?.status ?? 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      ...CORS_HEADERS,
      ...(typeof init === "object" ? init.headers : {}),
    },
  });
}

// 预检
export async function OPTIONS() {
  return json({ ok: true });
}

// 直接 GET 时给出友好提示（避免你看到 500 误判）
export async function GET() {
  // 便于快速排查：确认后台是否拿到了语言包基址
  return json({
    ok: true,
    hint: 'Use POST with "multipart/form-data" and field name "file".',
    langBase: EFFECTIVE_LANG_BASE || null,
    nodeEnv: process.env.NODE_ENV || null,
  });
}

// 在服务器上优先用 sharp 做预处理；如果运行环境加载不了 sharp（比如某些无
// 原生依赖镜像），就优雅降级为直接返回原图，避免 500。
async function preprocess(buffer: Buffer): Promise<Buffer> {
  // 未显式开启时直接跳过，避免在某些平台导入 sharp 失败引起 500
  if (!ENABLE_SERVER_SHARP) {
    return buffer;
  }
  try {
    // 按需动态加载，避免打包期间把 sharp 固定死到错误的平台上
    const sharp: any = (await import("sharp")).default;
    const out = await sharp(buffer)
      .rotate()
      .resize({ width: 1400, withoutEnlargement: false })
      .grayscale()
      .normalize()
      .toFormat("png")
      .toBuffer();
    console.log("[OCR] sharp preprocess ok, bytes:", out.length);
    return out;
  } catch (e: any) {
    console.warn("[OCR] sharp unavailable, skip preprocess:", e?.message || e);
    return buffer; // 降级：直接用原图给 Tesseract
  }
}

export async function POST(req: Request) {
  try {
    if (!LANG_BASE) {
      return json({ error: "Missing TESS_LANG_BASE" }, 500);
    }

    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return json({ error: "No file" }, 400);
    }

    const input = await preprocess(Buffer.from(await file.arrayBuffer()));
    console.log("[OCR] start recognize, langBase:", EFFECTIVE_LANG_BASE, "input bytes:", input.length);

    // Node / Browser 分开配置：
    // 这里是服务端（Node），不要覆盖 worker/core，只指定语言数据与缓存目录；
    // 这样既能避免 linux-x64 二进制问题，也能把 eng.traineddata 缓存到 /tmp，加速后续调用。
    const isNode = !!(typeof process !== "undefined" && (process as any).versions?.node);
    const ocrOptions: Record<string, any> = isNode
      ? {
          // Node 环境：不要指定 workerPath/corePath，交给 tesseract.js 自己用 worker_threads
          langPath: EFFECTIVE_LANG_BASE,      // 本地优先，其次 ENV
          cachePath: "/tmp/tess-cache",      // Vercel 可写目录
          cacheMethod: "writeToCache",
          // 轻度加速的常用配置（可按需微调）
          tessedit_pageseg_mode: 6,            // 偏单块文本
          preserve_interword_spaces: 1,
        }
      : {
          // 浏览器兜底（此 API 实际在服务端，不会走到这里）
          workerPath: `${TESS_CDN}worker.min.js`,
          corePath: `${TESS_CDN}tesseract-core.wasm`,
          langPath: EFFECTIVE_LANG_BASE,
        };

    const { data } = await Tesseract.recognize(input, "eng", ocrOptions);

    const rawText = (data?.text || "").trim();
    if (!rawText) return json({ error: "Empty OCR result" }, 422);

    const fields = extractFields(rawText);
    return json({ ...fields, rawText });
  } catch (err: any) {
    console.error("OCR ERROR:", err);
    return json(
      {
        error: err?.message || String(err),
        ...(process.env.NODE_ENV !== "production" ? { stack: err?.stack || null } : {}),
      },
      500
    );
  }
}
