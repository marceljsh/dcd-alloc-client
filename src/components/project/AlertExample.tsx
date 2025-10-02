// Example usage in any component:

import { useAlert } from "@/hooks/use-alert";
import AlertContainer from "@/components/project/AlertContainer";

export function MyComponent() {
  const { alerts, success, error, info, removeAlert } = useAlert();

  const handleSuccess = () => {
    success("Project created successfully!");
  };

  const handleError = () => {
    error("No activities found, cannot proceed to step 2");
  };

  const handleInfo = () => {
    info("Please fill all required fields");
  };

  return (
    <div>
      {/* Your component content */}
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handleInfo}>Show Info</button>

      {/* Alert container - place this at the end of your component */}
      <AlertContainer
        alerts={alerts}
        onRemove={removeAlert}
        position="top-right"
      />
    </div>
  );
}
