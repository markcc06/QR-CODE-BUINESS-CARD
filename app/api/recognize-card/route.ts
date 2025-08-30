export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import sharp from "sharp";
import { createWorker } from "tesseract.js";
import { extractFields } from "@/lib/extractFields";

async function preprocess(buffer: Buffer): Promise<Buffer> {
  // 基础稳态预处理（英文卡片足够）：方向→放大→灰度→归一化→导出 PNG
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
      return NextResponse.json({ error: "No file" }, { status: 400 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const input = await preprocess(buf);

    // 仅英文识别；语言包走 TESS_LANG_BASE（注意以 / 结尾）
    const worker = await createWorker("eng", 1, {
      langPath: process.env.TESS_LANG_BASE,
    });

    const { data } = await worker.recognize(input);
    await worker.terminate();

    const rawText = (data?.text || "").trim();
    if (!rawText) {
      return NextResponse.json({ error: "Empty OCR result" }, { status: 422 });
    }

    // 更智能抽取
    const fields = extractFields(rawText);

    return NextResponse.json({ ...fields, rawText });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "OCR failed" }, { status: 500 });
  }
}
