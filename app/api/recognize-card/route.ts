export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import sharp from "sharp";
import { createWorker } from "tesseract.js";
import { extractFields } from "@/lib/extractFields";

const LANG_BASE_RAW =
  process.env.NEXT_PUBLIC_TESS_LANG_BASE || process.env.TESS_LANG_BASE || "";
const LANG_BASE = LANG_BASE_RAW
  ? LANG_BASE_RAW.endsWith("/") ? LANG_BASE_RAW : `${LANG_BASE_RAW}/`
  : "";

const TESS_CDN = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist";

/** 允许预检请求，防止 405 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
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
    if (!LANG_BASE) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_TESS_LANG_BASE (or TESS_LANG_BASE)" },
        { status: 500 }
      );
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const input = await preprocess(buf);

    // 用 CDN 的 worker/core，同时用你 Supabase 的语言包目录
    const worker = await createWorker("eng", 1, {
      workerPath: `${TESS_CDN}/worker.min.js`,
      corePath: `${TESS_CDN}/tesseract-core.wasm.js`,
      langPath: LANG_BASE, // 必须以 / 结尾
      // logger: m => console.log(m), // 需要时打开
    });

    const { data } = await worker.recognize(input);
    await worker.terminate();

    const rawText = (data?.text || "").trim();
    if (!rawText) {
      return NextResponse.json({ error: "Empty OCR result" }, { status: 422 });
    }

    const fields = extractFields(rawText);
    return NextResponse.json({ ...fields, rawText });
  } catch (e: any) {
    return NextResponse.json(
      { error: e?.message || "OCR failed" },
      { status: 500 }
    );
  }
}
