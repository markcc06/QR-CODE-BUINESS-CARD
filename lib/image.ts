export function dataURLByteSize(dataURL: string): number {
  const base64 = dataURL.split(',')[1] || dataURL;
  try {
    // atob is a browser-only function
    return Math.ceil((atob(base64).length * 3) / 4);
  } catch {
    return base64.length;
  }
}

export function fileToDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img as HTMLImageElement);
    img.onerror = reject;
    img.src = src;
  });
}

type CompressOptions = {
  maxWidth?: number;
  maxHeight?: number;
  maxBytes?: number;
  mimeType?: string;
  quality?: number;
  minQuality?: number;
  downscaleStep?: number;
};

const defaultOpts: Required<CompressOptions> = {
  maxWidth: 1800,
  maxHeight: 1800,
  maxBytes: 4 * 1024 * 1024,
  mimeType: 'image/jpeg',
  quality: 0.9,
  minQuality: 0.5,
  downscaleStep: 0.85,
};

export async function compressFileToDataURL(file: File, opts: CompressOptions = {}): Promise<string> {
  const dataURL = await fileToDataURL(file);
  return compressDataURL(dataURL, opts);
}

export async function compressDataURL(dataURL: string, opts: CompressOptions = {}): Promise<string> {
  const options = { ...defaultOpts, ...opts };
  const img = await loadImage(dataURL);

  const ratio = Math.min(options.maxWidth / img.width, options.maxHeight / img.height, 1);
  let targetW = Math.round(img.width * ratio);
  let targetH = Math.round(img.height * ratio);
  let quality = options.quality;

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  let out = dataURL;

  for (let i = 0; i < 8; i++) {
    canvas.width = targetW;
    canvas.height = targetH;
    ctx.clearRect(0, 0, targetW, targetH);
    ctx.drawImage(img, 0, 0, targetW, targetH);
    out = canvas.toDataURL(options.mimeType, quality);
    if (dataURLByteSize(out) <= options.maxBytes) break;
    if (quality > options.minQuality) {
      quality = Math.max(options.minQuality, quality - 0.1);
      continue;
    }
    targetW = Math.max(512, Math.round(targetW * options.downscaleStep));
    targetH = Math.max(512, Math.round(targetH * options.downscaleStep));
  }
  return out;
}

export async function cropDataURL(
  dataURL: string,
  crop: { x: number; y: number; width: number; height: number },
  mime: string = 'image/jpeg',
  quality = 0.92
): Promise<string> {
  const img = await loadImage(dataURL);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(crop.width));
  canvas.height = Math.max(1, Math.round(crop.height));
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    img,
    crop.x, crop.y, crop.width, crop.height,
    0, 0, canvas.width, canvas.height
  );
  return canvas.toDataURL(mime, quality);
}

// 其他图像处理函数...