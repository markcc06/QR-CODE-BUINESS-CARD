// app/api/recognize-card/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { NextResponse } from "next/server";
import sharp from "sharp";
import { createWorker } from "tesseract.js";
import { extractFields } from "@/lib/extractFields";

/** 统一的 CORS 头，便于本地/线上都能调 */
const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/** 简单稳态预处理：旋转矫正→放大→灰度→归一化→PNG */
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
    // 1) 校验环境变量：必须存在且以 / 结尾
    const LANG_BASE_RAW =
      process.env.NEXT_PUBLIC_TESS_LANG_BASE ||
      process.env.TESS_LANG_BASE || // 兼容你之前的变量名
      "";

    if (!LANG_BASE_RAW) {
      return NextResponse.json(
        { error: "Missing NEXT_PUBLIC_TESS_LANG_BASE" },
        { status: 500, headers: CORS_HEADERS }
      );
    }

    const LANG_BASE = LANG_BASE_RAW.endsWith("/")
      ? LANG_BASE_RAW
      : LANG_BASE_RAW + "/";

    // 2) 解析上传文件
    const form = await req.formData();
    const file = form.get("file") as File | null;
    if (!file) {
      return NextResponse.json(
        { error: "No file" },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const input = await preprocess(buf);

    // 3) 根据运行环境准备 tesseract 选项
    // tesseract v5：createWorker(langs?, oem?, options?)
    // 在“浏览器风格”环境中需要显式给 workerPath/corePath
    const looksLikeBrowser =
      typeof window !== "undefined" ||
      // 一些 SSR/Edge 场景会把 globalThis 伪装成浏览器
      (typeof globalThis !== "undefined" &&
        // @ts-ignore
        (!!globalThis.window || !!globalThis.document));

    const TESS_CDN = "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist";

    const options: any = {
      langPath: LANG_BASE, // 只要把 eng.traineddata 放到你的 Supabase 公共桶就行
    };

    if (looksLikeBrowser) {
      // 在“浏览器风格”环境里，必须指定 worker + core 两个脚本 URL
      options.workerPath = `${TESS_CDN}/worker.min.js`;
      options.corePath = `${TESS_CDN}/tesseract-core.wasm.js`;
    }

    // 4) 识别
    const worker = await createWorker("eng", 1, options);
    const { data } = await worker.recognize(input);
    await worker.terminate();

    const rawText = (data?.text || "").trim();
    if (!rawText) {
      return NextResponse.json(
        { error: "Empty OCR result" },
        { status: 422, headers: CORS_HEADERS }
      );
    }

    // 5) 抽取字段
    const fields = extractFields(rawText);

    return NextResponse.json(
      { ...fields, rawText },
      { status: 200, headers: CORS_HEADERS }
    );
  } catch (e: any) {
    // 把关键信息暴露出来便于定位
    return NextResponse.json(
      { error: e?.message || "OCR failed" },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
