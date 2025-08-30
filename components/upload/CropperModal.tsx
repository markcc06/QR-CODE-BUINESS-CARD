'use client';

import React, { useCallback, useEffect, useState } from 'react';
import Cropper, { Area } from 'react-easy-crop';
import { cropDataURL } from '@/lib/image';

type CropperModalProps = {
  open: boolean;
  src: string; // dataURL
  onConfirmAction: (croppedDataURL: string) => void | Promise<void>;
  onCloseAction?: () => void | Promise<void>;
};

export default function CropperModal({
  open,
  src,
  onConfirmAction,
  onCloseAction,
}: CropperModalProps) {
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [croppedArea, setCroppedArea] = useState<Area | null>(null);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedArea(croppedPixels);
  }, []);

  const handleClose = () => {
    onCloseAction?.();
  };

  const handleConfirm = async () => {
    if (!croppedArea) return;
    const data = await cropDataURL(src, {
      x: croppedArea.x,
      y: croppedArea.y,
      width: croppedArea.width,
      height: croppedArea.height,
    });
    await onConfirmAction(data);
  };

  // Esc 关闭
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseAction?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onCloseAction]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className="bg-white rounded-lg shadow-lg w-[90vw] max-w-3xl h-[80vh] p-4 flex flex-col">
        <div className="relative flex-1 rounded-md overflow-hidden bg-black/10">
          <Cropper
            image={src}
            crop={crop}
            zoom={zoom}
            aspect={16 / 9} // 名片多为横版；需要自由比例可改成 undefined
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            restrictPosition={false}
          />
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm text-gray-600">Zoom</label>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
            />
          </div>
          <div className="flex gap-2">
            <button
              className="px-3 py-2 rounded bg-gray-200 hover:bg-gray-300"
              onClick={handleClose}
            >
              Cancel
            </button>
            <button
              className="px-3 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
              onClick={handleConfirm}
            >
              Apply Crop
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
