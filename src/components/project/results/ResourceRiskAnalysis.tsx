import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { AlertTriangle, Clock, Users, Calendar } from "lucide-react";
import { Activity, TeamMember } from "@/types/projects";
import { analyzeResourceRisks, RiskItem } from "./riskAnalysis";

interface ResourceRiskAnalysisProps {
  teamMembers: TeamMember[];
  activities: Activity[];
}

export default function ResourceRiskAnalysis({
  teamMembers,
  activities,
}: ResourceRiskAnalysisProps) {
  const resourceRisks = analyzeResourceRisks(teamMembers, activities);

  if (resourceRisks.length === 0) {
    return null;
  }

  const getRiskIcon = (risk: RiskItem) => {
    const iconClassName = `h-4 w-4 mt-0.5 flex-shrink-0 ${
      risk.severity === "high"
        ? "text-red-600"
        : risk.severity === "medium"
          ? "text-amber-600"
          : "text-blue-600"
    }`;

    switch (risk.riskType) {
      case "availability":
        return <Calendar className={iconClassName} />;
      case "capacity":
        return <Users className={iconClassName} />;
      case "planning":
      default:
        return <Clock className={iconClassName} />;
    }
  };

  return (
    <Card className="mb-6 py-6 border-amber-200 bg-amber-50/50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-amber-800">
          <AlertTriangle className="h-5 w-5" />
          <span>Resource Planning Risks</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {resourceRisks.map((risk, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                risk.severity === "high"
                  ? "border-l-red-500 bg-red-50 border border-red-200"
                  : risk.severity === "medium"
                    ? "border-l-amber-500 bg-amber-50 border border-amber-200"
                    : "border-l-blue-500 bg-blue-50 border border-blue-200"
              }`}
            >
              <div className="flex items-start space-x-3">
                {getRiskIcon(risk)}
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {risk.activity}
                    </span>
                    <span className="text-xs text-gray-500">
                      {risk.dateRange}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{risk.issue}</p>
                  <p className="text-xs text-gray-600 italic">
                    💡 {risk.recommendation}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
