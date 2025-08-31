export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import sharp from "sharp";
import { createWorker } from "tesseract.js";
import { extractFields } from "@/lib/extractFields";

// CDN：固定用 v5 的文件名
const TESS_CDN = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist";

// 语言包基址：优先用私有变量 TESS_LANG_BASE；本地调试也兼容 NEXT_PUBLIC_TESS_LANG_BASE
const LANG_BASE_RAW =
  process.env.TESS_LANG_BASE || process.env.NEXT_PUBLIC_TESS_LANG_BASE || "";
const LANG_BASE = LANG_BASE_RAW
  ? LANG_BASE_RAW.endsWith("/") ? LANG_BASE_RAW : `${LANG_BASE_RAW}/`
  : "";

async function preprocess(buffer: Buffer): Promise<Buffer> {
  // 稳妥的通用图像预处理
  return sharp(buffer)
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
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    if (!LANG_BASE) {
      return NextResponse.json(
        { error: "Missing TESS_LANG_BASE (or NEXT_PUBLIC_TESS_LANG_BASE)" },
        { status: 500 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const input = await preprocess(buf);

    const worker = await createWorker("eng", {
      workerPath: `${TESS_CDN}/worker.min.js`,
      corePath: `${TESS_CDN}/tesseract-core.wasm.js`,
      langPath: LANG_BASE,
    } as any);  // 👈 强制断言为 any，忽略旧类型定义

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