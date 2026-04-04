"use client";

import { create } from "zustand";

type AuthView = "login" | "signup";

type AuthModalState = {
  isOpen: boolean;
  view: AuthView;
  openAuthModal: (view?: AuthView) => void;
  closeAuthModal: () => void;
  setAuthView: (view: AuthView) => void;
};

export const useAuthModalStore = create<AuthModalState>((set) => ({
  isOpen: false,
  view: "login",

  openAuthModal: (view = "login") =>
    set({
      isOpen: true,
      view,
    }),

  closeAuthModal: () =>
    set({
      isOpen: false,
    }),

  setAuthView: (view) =>
    set({
      view,
    }),
}));