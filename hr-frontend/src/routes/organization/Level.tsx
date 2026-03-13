import React, { useState, useMemo } from "react";
import { orgStructure, OrgNode, positions } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  ChevronRight, ChevronDown, Building2, Building, 
  GitBranch, FolderOpen, Plus, Briefcase, LayoutTree 
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Helpers ---
const typeConfig: Record<string, { icon: any; color: string; bgColor: string }> = {
  group: { icon: Building2, color: "text-blue-600", bgColor: "bg-blue-50" },
  company: { icon: Building, color: "text-indigo-600", bgColor: "bg-indigo-50" },
  branch: { icon: GitBranch, color: "text-amber-600", bgColor: "bg-amber-50" },
  department: { icon: FolderOpen, color: "text-emerald-600", bgColor: "bg-emerald-50" },
};

// ฟังก์ชันนับจำนวนหน่วยงานทั้งหมด (Recursive)
const countAllNodes = (node: OrgNode): number => {
  let count = 1;
  if (node.children) {
    node.children.forEach((child) => (count += countAllNodes(child)));
  }
  return count;
};

// --- Sub-Components ---
const TreeNode = ({ node, level = 0 }: { node: OrgNode; level?: number }) => {
  const [expanded, setExpanded] = useState(level < 2);
  const config = typeConfig[node.type] || typeConfig.department;
  const Icon = config.icon;
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="select-none">
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-2.5 my-1 rounded-xl cursor-pointer transition-all border border-transparent",
          "hover:bg-white hover:shadow-sm hover:border-slate-200 group"
        )}
        style={{ marginLeft: `${level * 28}px` }}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-center w-6 h-6">
          {hasChildren && (
            expanded ? <ChevronDown className="h-4 w-4 text-slate-400" /> : <ChevronRight className="h-4 w-4 text-slate-400" />
          )}
        </div>
        
        <div className={cn("p-2 rounded-lg", config.bgColor)}>
          <Icon className={cn("h-4 w-4", config.color)} />
        </div>

        <div className="flex flex-col">
          <span className="text-sm font-semibold text-slate-700">{node.name}</span>
          {node.costCenter && (
            <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
              {node.costCenter}
            </span>
          )}
        </div>
      </div>

      {expanded && hasChildren && (
        <div className="relative ml-3 border-l border-slate-200">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

// --- Main Component ---
const OrganizationStructure = () => {
  const totalDepartments = useMemo(() => countAllNodes(orgStructure), []);
  const totalPositions = positions.length;

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Building2 className="h-6 w-6 text-blue-600" />
            Organization Structure
          </h1>
          <p className="text-slate-500 mt-1">Manage departments and company hierarchy</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200 gap-2">
          <Plus className="h-4 w-4" /> Add New
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm bg-blue-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500 rounded-2xl shadow-blue-200 shadow-lg text-white">
                <LayoutTree className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-blue-600/80 uppercase">Departments</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">{totalDepartments}</span>
                  <span className="text-xs text-slate-500 font-normal">Total Units</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-indigo-50/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500 rounded-2xl shadow-indigo-200 shadow-lg text-white">
                <Briefcase className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm font-medium text-indigo-600/80 uppercase">Positions</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-slate-900">{totalPositions}</span>
                  <span className="text-xs text-slate-500 font-normal">Total Roles</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs Structure */}
      <Tabs defaultValue="departments" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-xl mb-6">
          <TabsTrigger value="departments" className="rounded-lg px-8 gap-2">
            <LayoutTree className="h-4 w-4" />
            Departments 
            <span className="ml-1 bg-white/50 px-1.5 py-0.5 rounded text-[10px]">{totalDepartments}</span>
          </TabsTrigger>
          <TabsTrigger value="positions" className="rounded-lg px-8 gap-2">
            <Briefcase className="h-4 w-4" />
            Positions
            <span className="ml-1 bg-white/50 px-1.5 py-0.5 rounded text-[10px]">{totalPositions}</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="departments" className="outline-none">
          <Card className="border-slate-200 shadow-xl shadow-slate-100/50 overflow-hidden">
            <CardHeader className="border-b bg-slate-50/30">
              <CardTitle className="text-base font-semibold text-slate-800">Organizational Tree</CardTitle>
            </CardHeader>
            <CardContent className="p-6 bg-slate-50/10">
              <TreeNode node={orgStructure} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="positions">
           <Card className="p-10 text-center text-slate-400">
              <Briefcase className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>Position management view coming soon...</p>
           </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationStructure;