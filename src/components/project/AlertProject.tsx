import { AlertCircle, CheckCircle, Info, X } from "lucide-react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

type AlertProjectProps = {
  message: string | null;
  type: "success" | "error" | "info";
  onClose?: () => void;
  autoClose?: boolean;
  duration?: number;
  position?: "top-right" | "top-center" | "bottom-right" | "bottom-center";
};

export default function AlertProject({
  message,
  type,
  onClose,
  autoClose = true,
  duration = 5000,
  position = "top-right",
}: AlertProjectProps) {
  useEffect(() => {
    if (autoClose && onClose && message) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoClose, duration, onClose, message]);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />;
      case "error":
        return <AlertCircle className="h-4 w-4" />;
      case "info":
        return <Info className="h-4 w-4" />;
    }
  };

  const getPositionClasses = () => {
    switch (position) {
      case "top-right":
        return "top-4 right-4";
      case "top-center":
        return "top-4 left-1/2 -translate-x-1/2";
      case "bottom-right":
        return "bottom-4 right-4";
      case "bottom-center":
        return "bottom-4 left-1/2 -translate-x-1/2";
      default:
        return "top-4 right-4";
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case "success":
        return "border-l-green-500 bg-green-50 border-green-200 text-green-800";
      case "error":
        return "border-l-red-500 bg-red-50 border-red-200 text-red-800";
      case "info":
        return "border-l-blue-500 bg-blue-50 border-blue-200 text-blue-800";
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "info":
        return "text-blue-600";
    }
  };

  return (
    <div
      className={cn(
        "fixed z-50 w-80 max-w-[calc(100vw-2rem)] animate-in slide-in-from-top-2 fade-in duration-300",
        getPositionClasses()
      )}
    >
      <div
        className={cn(
          "rounded-lg border-l-4 border shadow-lg p-4 backdrop-blur-sm",
          getTypeStyles()
        )}
      >
        <div className="flex items-start gap-3">
          <div className={cn("mt-0.5", getIconColor())}>{getIcon()}</div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium">
              {type === "success"
                ? "Success"
                : type === "error"
                ? "Error"
                : "Info"}
            </div>
            <div className="text-sm mt-1 opacity-90">{message}</div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Auto-close progress bar */}
        {autoClose && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 rounded-b-lg overflow-hidden">
            <div
              className={cn(
                "h-full transition-all ease-linear",
                type === "success"
                  ? "bg-green-500"
                  : type === "error"
                  ? "bg-red-500"
                  : "bg-blue-500"
              )}
              style={{
                animation: `shrink-width ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes shrink-width {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
