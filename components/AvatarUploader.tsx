'use client';

// 该文件逻辑本身无类型错误，如遇到 “Cannot find module 'react-easy-crop'” 请先安装：
// pnpm add react-easy-crop

import React, { useCallback, useRef, useState } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImageDataURL } from '@/utils/cropImage';
import { Button } from '@/components/ui/button';

type Props = {
  value?: string; // dataURL
  onChangeAction: (dataUrl?: string) => void;
};

export default function AvatarUploader({ value, onChangeAction }: Props) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [src, setSrc] = useState<string | undefined>();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [showCropper, setShowCropper] = useState(false);

  const triggerPicker = () => inputRef.current?.click();

  const onFile = async (file: File) => {
    const reader = new FileReader(); // 修复：缺少 FileReader 实例
    reader.onload = () => {
      setSrc(reader.result as string);
      setShowCropper(true);
    };
    reader.readAsDataURL(file);
  };

  const onCropComplete = useCallback((_a: any, areaPixels: any) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const confirmCrop = async () => {
    if (!src || !croppedAreaPixels) return;
    const out = await getCroppedImageDataURL(src, crop, zoom, croppedAreaPixels, 200);
    onChangeAction(out);
    setShowCropper(false);
  };

  const clear = () => onChangeAction(undefined);

  return (
    <div className="space-y-3">
      {/* 隐藏的文件选择器 */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          // 允许重复选择同一文件
          e.currentTarget.value = '';
        }}
      />

      <div className="flex items-center gap-4">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-100 border border-gray-200 flex items-center justify-center">
          {value ? (
            <img src={value} alt="Avatar" className="h-full w-full object-cover" />
          ) : (
            <span className="text-gray-400 text-xs">No avatar</span>
          )}
        </div>

        <div className="flex gap-2">
          <Button type="button" onClick={triggerPicker}>
            Upload Avatar
          </Button>
          {value && (
            <Button variant="outline" type="button" onClick={clear}>
              Remove
            </Button>
          )}
        </div>
      </div>

      {/* 裁剪弹层 */}
      {showCropper && src && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-lg overflow-hidden">
            <div className="relative h-80 bg-black">
              <Cropper
                image={src}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                cropShape="round"
                showGrid={false}
              />
            </div>
            <div className="p-4 flex items-center justify-between">
              <input
                type="range"
                min={1}
                max={3}
                step={0.1}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-48"
              />
              <div className="flex gap-2">
                <Button variant="outline" type="button" onClick={() => setShowCropper(false)}>
                  Cancel
                </Button>
                <Button type="button" onClick={confirmCrop}>
                  Confirm Crop
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}