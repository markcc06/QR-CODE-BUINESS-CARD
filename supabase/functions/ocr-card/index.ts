// supabase/functions/ocr-card/index.ts
// deno-lint-ignore-file no-explicit-any
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const log = (...a: unknown[]) => console.log("[ocr]", ...a);

let _init: Promise<any> | null = null;
let _worker: any | null = null;

async function getWorker() {
  if (_worker) return _worker;
  if (!_init) {
    _init = (async () => {
      // 直接用 HTTP 导入，避免 npm 解析问题
      const mod = await import("https://esm.sh/tesseract.js@5");
      const createWorker =
        (mod as any).createWorker ?? (mod as any).default?.createWorker;
      if (typeof createWorker !== "function") {
        throw new Error("createWorker not found on tesseract.js");
      }

      // 语言数据目录：优先 TESS_LANG_BASE，兼容旧的 TESS_ENG_URL
      const base =
        Deno.env.get("TESS_LANG_BASE") ??
        Deno.env.get("TESS_ENG_URL")?.replace(/\/eng\.traineddata\.gz$/i, "");
      if (!base) throw new Error("TESS_LANG_BASE (or TESS_ENG_URL) not set");

      const worker = await createWorker({ langPath: base });
      await worker.loadLanguage("eng");
      await worker.initialize("eng");

      _worker = worker;
      return worker;
    })();
  }
  return (_worker = await _init);
}

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    const { img } = await req.json();
    if (!img) return new Response("Field 'img' required", { status: 400 });

    const worker = await getWorker();
    log("recognize start");
    const { data } = await worker.recognize(img);
    log("recognize done");

    return Response.json({
      text: data.text,
      confidence: data.confidence,
      lines: (data.lines ?? []).map((l: any) => l.text),
    });
  } catch (e: any) {
    log("error", e);
    return new Response(`OCR error: ${e?.message ?? String(e)}`, { status: 500 });
  }
});
