// app/api/recognize-card/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import sharp from "sharp";
import { createWorker } from "tesseract.js";
import { extractFields } from "@/lib/extractFields";

// 允许控制台查看真实错误（Vercel Functions 里也能看到）
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// 你的语言包基址（一定要有 / 结尾）
const LANG_BASE_RAW =
  process.env.NEXT_PUBLIC_TESS_LANG_BASE ||
  process.env.TESS_LANG_BASE ||
  "";
const LANG_BASE = LANG_BASE_RAW.endsWith("/")
  ? LANG_BASE_RAW
  : LANG_BASE_RAW + "/";

// 固定 worker / core 走 CDN（避免被打包器裁剪）
const TESS_CDN = "https://cdn.jsdelivr.net/npm/tesseract.js@5.1.1/dist/";

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
  return json(
    { error: 'Use POST with "multipart/form-data" and field name "file".' },
    405
  );
}

async function preprocess(buffer: Buffer) {
  return await sharp(buffer)
    .rotate()
    .resize({ width: 2000, withoutEnlargement: false })
    .grayscale()
    .normalize()
    .toFormat("png")
    .toBuffer();
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

    const worker = await createWorker("eng", 1, {
      workerPath: `${TESS_CDN}worker.min.js`,
      corePath: `${TESS_CDN}tesseract-core.wasm.js`,
      langPath: LANG_BASE, // <- 只从你的 Supabase 取语言包
    });

    const { data } = await worker.recognize(input);
    await worker.terminate();

    const rawText = (data?.text || "").trim();
    if (!rawText) return json({ error: "Empty OCR result" }, 422);

    const fields = extractFields(rawText);
    return json({ ...fields, rawText });
  } catch (err: any) {
    console.error("OCR ERROR:", err);
    return json({ error: err?.message || String(err) }, 500);
  }
}
