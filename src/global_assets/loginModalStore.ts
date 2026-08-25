// global_assets/loginModalStore.ts
import { create } from "zustand";

type LoginModalState = {
  isOpen: boolean;
  mode: "login" | "signup";
  openLogin: () => void;
  openSignup: () => void;
  close: () => void;
};

export const useLoginModalStore = create<LoginModalState>((set) => ({
  isOpen: false,
  mode: "login",
  openLogin: () => set({ isOpen: true, mode: "login" }),
  openSignup: () => set({ isOpen: true, mode: "signup" }),
  close: () => set({ isOpen: false }),
}));
