import {
  ProjectActivity,
  ProjectSubActivity,
  EntityType,
  ModeType,
} from "@/types/projects";
import { useState } from "react";

export const useProjectForm = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [sheetType, setSheetType] = useState<EntityType>("activity");
  const [mode, setMode] = useState<ModeType>("Edit");
  const [parentActivity, setParentActivity] = useState<ProjectActivity | null>(
    null
  );
  const [formDetails, setFormDetails] = useState<
    ProjectActivity | ProjectSubActivity | null
  >(null);

  const openSheet = (
    type: EntityType,
    parent: ProjectActivity | null,
    mode: ModeType
  ) => {
    if (mode === "Add") {
      setFormDetails(null);
    }
    setSheetType(type);
    setParentActivity(parent);
    setMode(mode);
    setIsOpen(true);
  };

  const closeSheet = () => {
    setIsOpen(false);
    setFormDetails(null);
    setParentActivity(null);
  };

  return {
    isOpen,
    setIsOpen,
    sheetType,
    mode,
    parentActivity,
    formDetails,
    openSheet,
    closeSheet,
    setFormDetails,
  };
};
