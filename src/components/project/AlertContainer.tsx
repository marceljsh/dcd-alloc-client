"use client";

import AlertProject from "./AlertProject";

interface Alert {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  duration?: number;
}

interface AlertContainerProps {
  alerts: Alert[];
  onRemove: (id: string) => void;
  position?: "top-right" | "top-center" | "bottom-right" | "bottom-center";
}

export default function AlertContainer({
  alerts,
  onRemove,
  position = "top-right",
}: AlertContainerProps) {
  if (alerts.length === 0) return null;

  const getContainerPosition = () => {
    switch (position) {
      case "top-right":
        return "fixed top-4 right-4 z-50 space-y-2";
      case "top-center":
        return "fixed top-4 left-1/2 -translate-x-1/2 z-50 space-y-2";
      case "bottom-right":
        return "fixed bottom-4 right-4 z-50 space-y-2";
      case "bottom-center":
        return "fixed bottom-4 left-1/2 -translate-x-1/2 z-50 space-y-2";
      default:
        return "fixed top-4 right-4 z-50 space-y-2";
    }
  };

  return (
    <div className={getContainerPosition()}>
      {alerts.map((alert, index) => (
        <div
          key={alert.id}
          style={{
            animationDelay: `${index * 100}ms`,
          }}
        >
          <AlertProject
            message={alert.message}
            type={alert.type}
            onClose={() => onRemove(alert.id)}
            autoClose={true}
            duration={alert.duration || 5000}
            position={position}
          />
        </div>
      ))}
    </div>
  );
}
