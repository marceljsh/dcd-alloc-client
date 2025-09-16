import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Crown, Medal, Sparkles, Users } from "lucide-react";
import React, { useState } from "react";

type SettingRoleProps = {
  onNext: () => void;
  onPrevious: () => void;
};

interface LevelInfo {
  availableHeadcount: number;
  workloadUnit?: number;
}

interface LevelConfig {
  enabled: boolean;
  maxHeadcount?: number; // Optional: jika tidak diset, menggunakan availableHeadcount
  info: LevelInfo;
}

interface RoleConfig {
  junior: LevelConfig;
  middle: LevelConfig;
  senior: LevelConfig;
}

// Ini nantinya akan didapat dari backend
const backendConstraints = {
  softwareEngineer: {
    junior: { availableHeadcount: 5 },
    middle: { availableHeadcount: 3 },
    senior: { availableHeadcount: 2 },
  },
  dataEngineer: {
    junior: { availableHeadcount: 4, workloadUnit: 0.8 },
    middle: { availableHeadcount: 3, workloadUnit: 1 },
    senior: { availableHeadcount: 2, workloadUnit: 1 },
  },
  systemAnalyst: {
    junior: { availableHeadcount: 5 },
    middle: { availableHeadcount: 3 },
    senior: { availableHeadcount: 2 },
  },
};

const initialRoleConfig: RoleConfig = {
  junior: { enabled: true, info: backendConstraints.softwareEngineer.junior },
  middle: { enabled: true, info: backendConstraints.softwareEngineer.middle },
  senior: { enabled: true, info: backendConstraints.softwareEngineer.senior },
};

const initialDataEngineerConfig: RoleConfig = {
  junior: { enabled: true, info: backendConstraints.dataEngineer.junior },
  middle: { enabled: true, info: backendConstraints.dataEngineer.middle },
  senior: { enabled: true, info: backendConstraints.dataEngineer.senior },
};

export default function SettingRole({ onNext, onPrevious }: SettingRoleProps) {
  const [maxTeamSize, setMaxTeamSize] = useState(10);
  const [roles, setRoles] = useState({
    softwareEngineer: initialRoleConfig,
    dataEngineer: initialDataEngineerConfig,
    systemAnalyst: initialRoleConfig,
  });
  const updateRoleLevel = (
    role: keyof typeof roles,
    level: keyof RoleConfig,
    field: keyof LevelConfig,
    value: any
  ) => {
    setRoles((prev) => ({
      ...prev,
      [role]: {
        ...prev[role],
        [level]: {
          ...prev[role][level],
          [field]: value,
        },
      },
    }));
  };

  return (
    <>
      {/* Header */}
      <div className="space-y-1 mb-2">
        <div className="flex items-center gap-2">
          <Users className="w-5 " />
          <h1 className="text-lg font-semibold">Role & Level Selection</h1>
        </div>
        <p className="text-gray-600 text-sm">
          Configure team members constraints
        </p>
      </div>

      {/* Team Size Constraints */}
      <Card className="shadow-sm w-[700px] mb-4">
        <CardHeader className="mt-3">
          <div className="flex flex-col space-y-1">
            <CardTitle className="text-base">Team Size Constraints</CardTitle>
            <span className="text-xs text-gray-500">
              Define the maximum number of team members allowed for this
              project.
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex items-center gap-3 pb-3">
          <Label htmlFor="maxTeamSize" className="text-sm font-medium">
            Max Size
          </Label>
          <Input
            id="maxTeamSize"
            type="number"
            min="1"
            value={maxTeamSize}
            onChange={(e) => setMaxTeamSize(Number.parseInt(e.target.value))}
            className="w-20 h-8 text-sm bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
          />
        </CardContent>
      </Card>

      {/* Role Sections */}
      <RoleCard
        title="Data Engineer"
        roleKey="dataEngineer"
        roles={roles}
        updateRoleLevel={updateRoleLevel}
      />
      <RoleCard
        title="Software Engineer"
        roleKey="softwareEngineer"
        roles={roles}
        updateRoleLevel={updateRoleLevel}
      />
      <RoleCard
        title="System Analyst"
        roleKey="systemAnalyst"
        roles={roles}
        updateRoleLevel={updateRoleLevel}
      />

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between mt-8 pt-4 border-t">
        <Button variant="outline" onClick={onPrevious} className="px-8">
          Previous
        </Button>
        <Button onClick={onNext} className="px-8 bg-black hover:bg-gray-800">
          Continue
        </Button>
      </div>
    </>
  );
}

interface RoleCardProps {
  title: string;
  roleKey: "softwareEngineer" | "dataEngineer" | "systemAnalyst";
  roles: {
    softwareEngineer: RoleConfig;
    dataEngineer: RoleConfig;
    systemAnalyst: RoleConfig;
  };
  updateRoleLevel: (
    role: "softwareEngineer" | "dataEngineer" | "systemAnalyst",
    level: keyof RoleConfig,
    field: keyof LevelConfig,
    value: any
  ) => void;
}

const RoleCard = ({
  title,
  roleKey,
  roles,
  updateRoleLevel,
}: RoleCardProps) => {
  const levelConfig: Record<keyof RoleConfig, { icon: React.ReactNode }> = {
    junior: {
      icon: <Medal className="w-4 h-4 text-blue-300" />,
    },
    middle: {
      icon: <Medal className="w-4 h-4 text-blue-600" />,
    },
    senior: {
      icon: <Medal className="w-4 h-4 text-blue-900" />,
    },
  };

  return (
    <Card className="shadow-sm mb-4">
      <CardHeader className="mt-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span>{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {(["junior", "middle", "senior"] as const).map((level) => (
            <div key={level} className="rounded-lg p-3 border">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    id={`${roleKey}-${level}`}
                    checked={roles[roleKey][level].enabled}
                    onCheckedChange={(checked) =>
                      updateRoleLevel(roleKey, level, "enabled", checked)
                    }
                  />
                  <Label
                    htmlFor={`${roleKey}-${level}`}
                    className="text-sm font-medium capitalize"
                  >
                    {level}
                  </Label>
                </div>
                {levelConfig[level].icon}
              </div>

              <div className="space-y-2">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-xs text-gray-500">
                      <Users className="w-3 h-3 inline mr-1" />
                      Max Headcount
                    </Label>
                    <span className="text-xs text-gray-400">
                      Available: {roles[roleKey][level].info.availableHeadcount}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min="0"
                      max={roles[roleKey][level].info.availableHeadcount}
                      value={
                        roles[roleKey][level].maxHeadcount ??
                        roles[roleKey][level].info.availableHeadcount
                      }
                      placeholder={roles[roleKey][
                        level
                      ].info.availableHeadcount.toString()}
                      onChange={(e) => {
                        const value = Number.parseInt(e.target.value);
                        const max =
                          roles[roleKey][level].info.availableHeadcount;
                        if (value === max) {
                          // Jika nilai sama dengan available, hapus custom limit
                          updateRoleLevel(
                            roleKey,
                            level,
                            "maxHeadcount",
                            undefined
                          );
                        } else {
                          updateRoleLevel(
                            roleKey,
                            level,
                            "maxHeadcount",
                            value > max ? max : value
                          );
                        }
                      }}
                      className="w-20 h-8 text-sm bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      disabled={!roles[roleKey][level].enabled}
                    />
                    {roles[roleKey][level].maxHeadcount !== undefined && (
                      <span
                        className="text-xs text-blue-500 cursor-pointer hover:text-blue-700"
                        onClick={() =>
                          updateRoleLevel(
                            roleKey,
                            level,
                            "maxHeadcount",
                            undefined
                          )
                        }
                      >
                        Reset to available
                      </span>
                    )}
                  </div>
                </div>
                {roles[roleKey][level].maxHeadcount !== undefined && (
                  <p className="text-xs text-gray-400">
                    Custom limit set: {roles[roleKey][level].maxHeadcount} out
                    of {roles[roleKey][level].info.availableHeadcount} available
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
