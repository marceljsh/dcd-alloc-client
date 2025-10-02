// error store

import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

interface ErrorState {
  errorMessage: string | null;
  setErrorMessage: (message: string | null) => void;
  clearErrorMessage: () => void;
}

export const useErrorStore = create<ErrorState>()(
  immer((set) => ({
    errorMessage: null,
    setErrorMessage: (message) =>
      set((state) => {
        state.errorMessage = message;
      }),
    clearErrorMessage: () =>
      set((state) => {
        state.errorMessage = null;
      }),
  }))
);
