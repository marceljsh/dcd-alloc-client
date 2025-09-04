import { useEffect } from "react";

interface KeyboardShortcutsProps {
  onAddActivity: () => void;
  onPreviousWeek: () => void;
  onNextWeek: () => void;
  onToggleView: () => void;
}

export const useKeyboardShortcuts = ({
  onAddActivity,
  onPreviousWeek,
  onNextWeek,
  onToggleView,
}: KeyboardShortcutsProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if no input is focused
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA" ||
        document.activeElement?.tagName === "SELECT"
      ) {
        return;
      }

      if (e.metaKey || e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case "n":
            e.preventDefault();
            onAddActivity();
            break;
          case "arrowleft":
            e.preventDefault();
            onPreviousWeek();
            break;
          case "arrowright":
            e.preventDefault();
            onNextWeek();
            break;
          case "t":
            e.preventDefault();
            onToggleView();
            break;
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onAddActivity, onPreviousWeek, onNextWeek, onToggleView]);
};
