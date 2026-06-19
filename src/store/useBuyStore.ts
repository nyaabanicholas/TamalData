"use client";

import { create } from "zustand";
import type { Network, DataBundle } from "@/types";

export type BuyFlowStep = "network" | "bundle" | "success";

interface BuyStore {
  step: BuyFlowStep;
  network: Network | null;
  bundle: DataBundle | null;
  phone: string;
  orderRef: string | null;

  setNetwork: (network: Network) => void;
  setBundle: (bundle: DataBundle) => void;
  setPhone: (phone: string) => void;
  setOrderRef: (ref: string) => void;
  goToStep: (step: BuyFlowStep) => void;
  reset: () => void;
}

const initialState = {
  step: "network" as BuyFlowStep,
  network: null,
  bundle: null,
  phone: "",
  orderRef: null,
};

export const useBuyStore = create<BuyStore>((set) => ({
  ...initialState,

  setNetwork: (network) => set({ network, bundle: null, step: "bundle" }),
  setBundle: (bundle) => set({ bundle }),
  setPhone: (phone) => set({ phone }),
  setOrderRef: (orderRef) => set({ orderRef, step: "success" }),
  goToStep: (step) => set({ step }),
  reset: () => set(initialState),
}));
