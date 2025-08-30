"use client";

import { useCardFormStore } from "@/store/cardFormStore";

export default function BasicsForm() {
  const s = useCardFormStore();

  return (
    <div className="grid grid-cols-1 gap-3">
      <input
        className="border p-2 rounded"
        placeholder="First Name"
        value={s.firstName}
        onChange={(e) => s.setField("firstName", e.target.value)}
      />
      <input
        className="border p-2 rounded"
        placeholder="Last Name"
        value={s.lastName}
        onChange={(e) => s.setField("lastName", e.target.value)}
      />
      <input
        className="border p-2 rounded"
        placeholder="Job Title"
        value={s.jobTitle}
        onChange={(e) => s.setField("jobTitle", e.target.value)}
      />
      <input
        className="border p-2 rounded"
        placeholder="Company"
        value={s.company}
        onChange={(e) => s.setField("company", e.target.value)}
      />
      <input
        className="border p-2 rounded"
        placeholder="Email"
        value={s.email}
        onChange={(e) => s.setField("email", e.target.value)}
      />
      <input
        className="border p-2 rounded"
        placeholder="Phone"
        value={s.phone}
        onChange={(e) => s.setField("phone", e.target.value)}
      />
      <input
        className="border p-2 rounded"
        placeholder="Website"
        value={s.website}
        onChange={(e) => s.setField("website", e.target.value)}
      />
      <input
        className="border p-2 rounded"
        placeholder="Location"
        value={s.location}
        onChange={(e) => s.setField("location", e.target.value)}
      />

      {s.rawText && (
        <textarea
          className="border p-2 rounded text-sm text-gray-600"
          value={s.rawText}
          readOnly
          rows={5}
          placeholder="OCR 原始文本"
        />
      )}
    </div>
  );
}
