"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Save,
  FolderOpen,
  Download,
  Trash2,
  Copy,
  FileText,
  Database,
  BookTemplate as Template,
} from "lucide-react";
import {
  getSavedProjects,
  getTemplates,
  saveProject,
  saveAsTemplate,
  deleteProject,
  deleteTemplate,
  exportToCSV,
  downloadCSV,
  type SavedProject,
  type ProjectTemplate,
  ResultCSV,
} from "@/lib/storage";

export type ProjectData = {
  projectName: string;
  startDate: string;
  endDate: string;
  totalEffort: number;
  effortDistribution: {
    backend: number;
    frontend: number;
    qa: number;
  };
  complexity: "Low" | "Medium" | "High";
  buffer: number;
};

export type RoleLevel = {
  role: string;
  level: string;
  available: boolean;
  leverageFactor: number;
};

interface ProjectManagementProps {
  projectData?: ProjectData;
  roleLevels?: RoleLevel[];
  results?: ResultCSV[];
  onLoadProject?: (projectData: ProjectData, roleLevels: RoleLevel[]) => void;
  onLoadTemplate?: (template: ProjectTemplate) => void;
}

export function ProjectManagement({
  projectData,
  roleLevels,
  results,
  onLoadProject,
  onLoadTemplate,
}: ProjectManagementProps) {
  const [savedProjects, setSavedProjects] =
    useState<SavedProject[]>(getSavedProjects());
  const [templates, setTemplates] = useState<ProjectTemplate[]>(getTemplates());
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");

  const handleSaveProject = () => {
    if (!projectData || !roleLevels) return;

    const saved = saveProject(projectData, roleLevels);
    setSavedProjects(getSavedProjects());
    alert(`Project "${saved.name}" saved successfully!`);
  };

  const handleSaveAsTemplate = () => {
    if (!projectData || !roleLevels || !templateName.trim()) return;

    const template = saveAsTemplate(
      templateName,
      templateDescription,
      projectData,
      roleLevels,
    );
    setTemplates(getTemplates());
    setTemplateName("");
    setTemplateDescription("");
    alert(`Template "${template.name}" created successfully!`);
  };

  const handleDeleteProject = (id: string) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProject(id);
      setSavedProjects(getSavedProjects());
    }
  };

  const handleDeleteTemplate = (id: string) => {
    if (confirm("Are you sure you want to delete this template?")) {
      deleteTemplate(id);
      setTemplates(getTemplates());
    }
  };

  const handleExportCSV = () => {
    if (!projectData || !results) return;

    const csvContent = exportToCSV(results, projectData);
    const filename = `${projectData.projectName.replace(/\s+/g, "_")}_estimation.csv`;
    downloadCSV(csvContent, filename);
  };

  return (
    <div className="space-y-4">
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-2">
        {projectData && roleLevels && (
          <Button
            onClick={handleSaveProject}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            Save Project
          </Button>
        )}

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <FolderOpen className="h-4 w-4" />
              Load Project
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Load Saved Project</DialogTitle>
              <DialogDescription>
                Select a previously saved project to continue working on
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Project Name</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {savedProjects.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        {project.name}
                      </TableCell>
                      <TableCell>
                        {new Date(project.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {new Date(project.updatedAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() =>
                              onLoadProject?.(project.data, project.roleLevels)
                            }
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteProject(project.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 bg-transparent"
            >
              <Template className="h-4 w-4" />
              Templates
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-7xl">
            <DialogHeader>
              <DialogTitle>Project Templates</DialogTitle>
              <DialogDescription>
                Use predefined templates to quickly start new projects
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Complexity</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">
                        {template.name}
                      </TableCell>
                      <TableCell>{template.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{template.complexity}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => onLoadTemplate?.(template)}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                          {!["web-app", "mobile-app"].includes(template.id) && (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </DialogContent>
        </Dialog>

        {projectData && roleLevels && (
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="flex items-center gap-2 bg-transparent"
              >
                <Database className="h-4 w-4" />
                Save as Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save as Template</DialogTitle>
                <DialogDescription>
                  Create a reusable template from current project configuration
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g., E-commerce Project"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="templateDescription">Description</Label>
                  <Textarea
                    id="templateDescription"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Brief description of when to use this template"
                  />
                </div>
                <Button
                  onClick={handleSaveAsTemplate}
                  disabled={!templateName.trim()}
                >
                  Create Template
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {results && projectData && (
          <Button
            onClick={handleExportCSV}
            variant="outline"
            className="flex items-center gap-2 bg-transparent"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        )}
      </div>
    </div>
  );
}
