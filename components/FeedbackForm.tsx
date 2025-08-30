'use client';

import React, { useState } from 'react';
import { FeedbackData } from '@/types/card';
import { Button } from '@/components/ui/button';

type Props = {
  onSubmitAction: (data: FeedbackData) => void;
};

export default function FeedbackForm({ onSubmitAction }: Props) {
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState<string>('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim()) return;
    onSubmitAction({
      message: message.trim(),
      email: email.trim() || undefined,
      rating: rating ? Number(rating) : undefined,
    });
    setMessage('');
    setEmail('');
    setRating('');
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Feedback</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
          placeholder="Tell us what you think..."
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-end">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700">Email (optional)</label>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
            placeholder="you@example.com"
            type="email"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Rating</label>
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-200 shadow-sm"
          >
            <option value="">--</option>
            <option value="5">5 — Excellent</option>
            <option value="4">4 — Good</option>
            <option value="3">3 — Okay</option>
            <option value="2">2 — Bad</option>
            <option value="1">1 — Terrible</option>
          </select>
        </div>
      </div>

      <div className="text-right">
        <Button type="submit">Send Feedback</Button>
      </div>
    </form>
  );
}