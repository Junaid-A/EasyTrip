import { create } from "zustand";

export type AuthModalMode = "login" | "signup";

type AuthModalPrefill = {
  email?: string;
  phone?: string;
};

type AuthModalStore = {
  isOpen: boolean;
  mode: AuthModalMode;
  prefillEmail: string;
  prefillPhone: string;
  openAuthModal: (mode?: AuthModalMode, prefill?: AuthModalPrefill) => void;
  closeAuthModal: () => void;
  setMode: (mode: AuthModalMode) => void;
  setPrefill: (prefill?: AuthModalPrefill) => void;
  clearPrefill: () => void;
};

export const useAuthModalStore = create<AuthModalStore>((set) => ({
  isOpen: false,
  mode: "login",
  prefillEmail: "",
  prefillPhone: "",

  openAuthModal: (mode = "login", prefill) =>
    set({
      isOpen: true,
      mode,
      prefillEmail: prefill?.email ?? "",
      prefillPhone: prefill?.phone ?? "",
    }),

  closeAuthModal: () =>
    set({
      isOpen: false,
    }),

  setMode: (mode) =>
    set({
      mode,
    }),

  setPrefill: (prefill) =>
    set({
      prefillEmail: prefill?.email ?? "",
      prefillPhone: prefill?.phone ?? "",
    }),

  clearPrefill: () =>
    set({
      prefillEmail: "",
      prefillPhone: "",
    }),
}));