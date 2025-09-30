import { Employee } from "@/types/employee";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { X } from "lucide-react";
import { backgroundByRole } from "@/lib/utils";
import { initials } from "@/lib/strings";

interface EmployeeCardProps {
  employee: Employee;
  onRemove: (id: number) => void;
}

export function EmployeeCard({ employee, onRemove }: EmployeeCardProps) {
  return (
    <Card className="w-48 flex-shrink-0 p-2">
      <div className="flex items-center gap-2">
        <Avatar className="h-8 w-8">
          <div
            className={`${backgroundByRole(employee.role)} font-mono text-primary-foreground flex h-full w-full items-center justify-center`}
          >
            {initials(employee.name)}
          </div>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm">{employee.name}</p>
          <p className="text-muted-foreground truncate text-xs">
            {employee.role}
          </p>
        </div>
        {onRemove && (
          <button
            onClick={() => onRemove(employee.id)}
            className="text-muted-foreground hover:text-destructive transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
    </Card>
  );
}
