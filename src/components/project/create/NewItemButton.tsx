import React, { useState } from "react";
import { Button } from "../../ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../ui/dropdown-menu";
import { PlusIcon } from "lucide-react";

interface NewItemButtonProps {
  onSelect: (type: "activity" | "subactivity") => void;
}

export const NewItemButton: React.FC<NewItemButtonProps> = ({ onSelect }) => {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="default" onClick={() => setOpen(true)}>
          <PlusIcon className="mr-2 h-4 w-4" />
          New Item
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            onSelect("activity");
            setOpen(false);
          }}
        >
          Activity
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onSelect("subactivity");
            setOpen(false);
          }}
        >
          SubActivity
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
