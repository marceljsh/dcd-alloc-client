"use client";

import { useState, useCallback } from "react";

type AlertType = "success" | "error" | "info";

interface Alert {
  id: string;
  message: string;
  type: AlertType;
  duration?: number;
}

export function useAlert() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  const showAlert = useCallback(
    (message: string, type: AlertType = "info", duration: number = 5000) => {
      const id = Date.now().toString();
      const newAlert = { id, message, type, duration };

      setAlerts((prev) => [...prev, newAlert]);

      // Auto remove after duration
      setTimeout(() => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id));
      }, duration);

      return id;
    },
    []
  );

  const removeAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setAlerts([]);
  }, []);

  // Convenience methods
  const success = useCallback(
    (message: string, duration?: number) =>
      showAlert(message, "success", duration),
    [showAlert]
  );

  const error = useCallback(
    (message: string, duration?: number) =>
      showAlert(message, "error", duration),
    [showAlert]
  );

  const info = useCallback(
    (message: string, duration?: number) =>
      showAlert(message, "info", duration),
    [showAlert]
  );

  return {
    alerts,
    showAlert,
    removeAlert,
    clearAll,
    success,
    error,
    info,
  };
}
