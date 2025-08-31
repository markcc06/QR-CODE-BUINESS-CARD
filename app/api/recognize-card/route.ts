export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import sharp from "sharp";
import { createWorker } from "tesseract.js";
import { extractFields } from "@/lib/extractFields";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  // 处理预检，避免线上偶发 405
  return new NextResponse(null, { status: 200, headers: CORS_HEADERS });
}

export async function GET() {
  // 探活用：线上直接 GET /api/recognize-card 看是否 200
  return NextResponse.json({ ok: true }, { headers: CORS_HEADERS });
}

async function preprocess(buffer: Buffer): Promise<Buffer> {
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
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400, headers: CORS_HEADERS });
    }

    // 语言数据 CDN 和 supabase 存储基路径（末尾必须带 /）
    const TESS_CDN = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/";
    const LANG_BASE_RAW =
      process.env.NEXT_PUBLIC_TESS_LANG_BASE || process.env.TESS_LANG_BASE || "";
    const LANG_BASE = LANG_BASE_RAW
      ? (LANG_BASE_RAW.endsWith("/") ? LANG_BASE_RAW : LANG_BASE_RAW + "/")
      : "";

    if (!LANG_BASE) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_TESS_LANG_BASE (or TESS_LANG_BASE)" },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const input = await preprocess(buf);

    // 显式指定 worker / core / langPath，确保线上可用
    const worker = await createWorker("eng", 1, {
      workerPath: `${TESS_CDN}worker.min.js`,
      corePath: `${TESS_CDN}tesseract-core.wasm.js`,
      langPath: LANG_BASE,
    });

    const { data } = await worker.recognize(input);
    await worker.terminate();

    const rawText = (data?.text || "").trim();
    if (!rawText) {
      return NextResponse.json({ error: "Empty OCR result" }, { status: 422, headers: CORS_HEADERS });
    }

    const fields = extractFields(rawText);
    return NextResponse.json({ ...fields, rawText }, { headers: CORS_HEADERS });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "OCR failed" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
