import { Employee } from '@/types/employee';
import { Card } from '@/components/ui/card';
import { Avatar } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { initials } from '@/lib/strings';
import { backgroundByRole } from '@/lib/utils';

interface EmployeeListProps {
  employees: Employee[];
  selectedTaskId: string | null;
  roleFilter: string;
  onRoleFilterChange: (role: string) => void;
  uniqueRoles: string[];
  onAssignEmployee: (taskId: string, employee: Employee) => void;
}

interface EmployeeItemProps {
  employee: Employee;
  selectedTaskId: string | null;
  onAssignEmployee: (taskId: string, employee: Employee) => void;
}

function EmployeeItem({ employee, selectedTaskId, onAssignEmployee }: EmployeeItemProps) {
  const handleClick = () => {
    if (selectedTaskId) {
      onAssignEmployee(selectedTaskId, employee);
    }
  };

    return (
      <Card
        className={`cursor-pointer p-3 transition-all ${
          selectedTaskId ? 'hover:bg-accent border-primary/20 shadow-sm hover:scale-105' : 'hover:bg-accent/50 cursor-default'
        }`}
        onClick={handleClick}
      >
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <div className={`${backgroundByRole(employee.role)} text-primary-foreground flex h-full w-full items-center justify-center font-mono`}>
              {initials(employee.name)}
            </div>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate">{employee.name}</p>
            <p className="text-muted-foreground text-sm">{employee.role}</p>
          </div>
        </div>
      </Card>
    );
  }

  export function EmployeeList({ employees, selectedTaskId, roleFilter, onRoleFilterChange, uniqueRoles, onAssignEmployee }: EmployeeListProps) {
    
  return (
    <div className="space-y-3 h-[500px] flex flex-col">
      <div className="flex items-center justify-between">
        <h3>Available Resources</h3>
        {selectedTaskId && (
          <span className="text-muted-foreground bg-secondary rounded px-2 py-1 text-xs">
            Filtered for selected task
          </span>
        )}
      </div>

      {/* Role Filter */}
      <div className="space-y-2">
        <label className="text-sm">Filter by Role:</label>
        <Select value={roleFilter} onValueChange={onRoleFilterChange}>
          <SelectTrigger className="bg-secondary w-full border-0">
            <SelectValue placeholder="Select Role" />
          </SelectTrigger>
          <SelectContent>
            {uniqueRoles.map(role => (
              <SelectItem key={role} value={role}>
                <span className="font-mono">
                  {role === 'all' ? 'All Roles' : role}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-muted text-muted-foreground rounded p-3 text-sm">
        <p>
          💡 <strong>Tip:</strong> Click on employees to assign them to the selected task.
        </p>
      </div>

      {/* Employee List → satu scroll */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2">
        {employees.length > 0 ? (
          employees.map(employee => (
            <EmployeeItem
              key={employee.id}
              employee={employee}
              selectedTaskId={selectedTaskId}
              onAssignEmployee={onAssignEmployee}
            />
          ))
        ) : (
          <div className="text-muted-foregrou py-8 text-center">
            {selectedTaskId ? (
              <div>
                <p>No available resources for the selected task timeframe.</p>
                <p className="mt-1 text-xs">
                  All employees are already assigned to conflicting tasks.
                </p>
              </div>
            ) : (
              <p>No employees found matching the selected role.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
