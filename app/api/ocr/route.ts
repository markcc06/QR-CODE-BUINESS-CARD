import type { NextRequest } from "next/server";
export const runtime = "nodejs"; // 用 Node 运行时

import { createWorker } from "tesseract.js";

let _worker: any = null;
let _init: Promise<any> | null = null;

async function getWorker() {
  if (_worker) return _worker;
  if (!_init) {
    _init = (async () => {
      const base0 = process.env.TESS_LANG_BASE || "";
      const langPath = base0.endsWith("/") ? base0 : base0 + "/";

      // ✅ 用“仅 options”的重载，规避 OEM 的类型重载冲突
      const w = await (createWorker as any)({ langPath });

      // ✅ 显式加载与初始化，兼容所有小版本
      await (w as any).loadLanguage("eng");
      await (w as any).initialize("eng");

      _worker = w;
      return w;
    })();
  }
  return (_worker = await _init);
}

export async function POST(req: NextRequest) {
  try {
    const { img } = await req.json();
    if (!img) {
      return new Response(JSON.stringify({ error: "img required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const worker = await getWorker();
    const res = await worker.recognize(img);
    const data = (res && res.data) || res || {};
    const lines = (data.lines ?? []).map((l: any) => l.text);

    return new Response(
      JSON.stringify({
        text: data.text ?? "",
        confidence: data.confidence ?? null,
        lines,
      }),
      {
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || String(e) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
