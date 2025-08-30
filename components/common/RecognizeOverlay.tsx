'use client';
import React from 'react';
import { useCardStore } from '@/store/cardStore';

export default function RecognizeOverlay() {
  const { isRecognizing, recognizeProgress } = useCardStore();
  if (!isRecognizing) return null;
  return (
    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center z-10">
      <p className="text-white mb-2">Recognizing...</p>
      <div className="w-2/3 h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-blue-500 transition-all duration-300 ease-out"
          style={{ width: `${recognizeProgress}%` }}
        />
      </div>
    </div>
  );
}