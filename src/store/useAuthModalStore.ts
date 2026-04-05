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
  nextPath?: string;
  openAuthModal: (
    mode?: AuthModalMode,
    prefill?: AuthModalPrefill,
    nextPath?: string
  ) => void;
  closeAuthModal: () => void;
  setMode: (mode: AuthModalMode) => void;
  setPrefill: (prefill?: AuthModalPrefill) => void;
  setNextPath: (nextPath?: string) => void;
  clearPrefill: () => void;
  clearNextPath: () => void;
};

export const useAuthModalStore = create<AuthModalStore>((set) => ({
  isOpen: false,
  mode: "login",
  prefillEmail: "",
  prefillPhone: "",
  nextPath: undefined,

  openAuthModal: (mode = "login", prefill, nextPath) =>
    set({
      isOpen: true,
      mode,
      prefillEmail: prefill?.email ?? "",
      prefillPhone: prefill?.phone ?? "",
      nextPath,
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

  setNextPath: (nextPath) =>
    set({
      nextPath,
    }),

  clearPrefill: () =>
    set({
      prefillEmail: "",
      prefillPhone: "",
    }),

  clearNextPath: () =>
    set({
      nextPath: undefined,
    }),
}));