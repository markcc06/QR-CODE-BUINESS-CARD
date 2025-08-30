export async function getCroppedImageDataURL(
  imageSrc: string,
  _crop: { x: number; y: number },
  _zoom: number,
  croppedAreaPixels: { width: number; height: number; x: number; y: number },
  outputSize = 200
): Promise<string> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = imageSrc;
  });

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;
  canvas.width = outputSize;
  canvas.height = outputSize;

  ctx.drawImage(
    image,
    croppedAreaPixels.x,
    croppedAreaPixels.y,
    croppedAreaPixels.width,
    croppedAreaPixels.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return canvas.toDataURL('image/png');
}