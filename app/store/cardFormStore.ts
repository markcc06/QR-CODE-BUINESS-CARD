"use client";
import { create } from "zustand";

export interface CardFormState {
  firstName: string;
  lastName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  location: string;
  template: "minimal" | "classic" | "centered";
  rawText?: string;

  setField: (field: keyof CardFormState, value: any) => void;
  setBulk: (data: Partial<CardFormState>) => void;
  reset: () => void;
}

export const useCardFormStore = create<CardFormState>((set) => ({
  firstName: "",
  lastName: "",
  jobTitle: "",
  company: "",
  email: "",
  phone: "",
  website: "",
  location: "",
  template: "minimal",
  rawText: "",

  setField: (field, value) => set((s) => ({ ...s, [field]: value })),
  setBulk: (data) => set((s) => ({ ...s, ...data })),
  reset: () =>
    set({
      firstName: "",
      lastName: "",
      jobTitle: "",
      company: "",
      email: "",
      phone: "",
      website: "",
      location: "",
      template: "minimal",
      rawText: "",
    }),
}));
