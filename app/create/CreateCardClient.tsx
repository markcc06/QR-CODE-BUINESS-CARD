"use client";

import CardPreview from "@/components/CardPreview";
import BasicsForm from "@/components/BasicsForm";
import UploadCard from "@/components/UploadCard";
import { useCardFormStore } from "@/store/cardFormStore";

export default function CreateCardClient() {
  const state = useCardFormStore();

  // 把表单 store → 映射为 CardPreview 期望的 card 结构
  const card: any = {
    template: state.template,
    person: {
      givenName: state.firstName,
      familyName: state.lastName,
      title: state.jobTitle,
      org: state.company,
      email: state.email,
      phone: state.phone,
      url: state.website,
      location: state.location,
    },
  };

  return (
    <div className="grid grid-cols-2 gap-8 p-8">
      <div className="space-y-4">
        <UploadCard />

        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium mb-3">Basics</h3>
          <BasicsForm />
        </div>

        <div className="rounded-lg border p-4">
          <h3 className="text-sm font-medium mb-3">Template</h3>
          <div className="flex gap-2">
            <button
              className={`px-3 py-1 rounded border ${state.template === "minimal" ? "bg-blue-600 text-white" : ""}`}
              onClick={() => state.setField("template", "minimal")}
            >
              Minimal
            </button>
            <button
              className={`px-3 py-1 rounded border ${state.template === "classic" ? "bg-blue-600 text-white" : ""}`}
              onClick={() => state.setField("template", "classic")}
            >
              Classic
            </button>
            <button
              className={`px-3 py-1 rounded border ${state.template === "centered" ? "bg-blue-600 text-white" : ""}`}
              onClick={() => state.setField("template", "centered")}
            >
              Centered
            </button>
          </div>
        </div>
      </div>

      <div>
        <CardPreview card={card} />
      </div>
    </div>
  );
}
