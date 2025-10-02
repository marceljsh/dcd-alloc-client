import { useErrorStore } from "@/store/error-store";

export const useError = () => {
  const { errorMessage, setErrorMessage, clearErrorMessage } = useErrorStore();

  return {
    errorMessage,
    setErrorMessage,
    clearErrorMessage,
  };
};
