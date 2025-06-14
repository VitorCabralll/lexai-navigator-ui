
import { useState } from "react";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { WorkspacePanel } from "@/components/dashboard/WorkspacePanel";

export default function Dashboard() {
  const [selectedWorkspace, setSelectedWorkspace] = useState("Promotoria");

  // Dados mockados dos ambientes
  const workspaces = [
    { id: "1", name: "Promotoria", agentCount: 5 },
    { id: "2", name: "Escritório", agentCount: 3 },
    { id: "3", name: "Consultoria", agentCount: 7 }
  ];

  return (
    <div className="min-h-screen flex bg-background">
      <DashboardSidebar 
        workspaces={workspaces}
        selectedWorkspace={selectedWorkspace}
        onWorkspaceSelect={setSelectedWorkspace}
      />
      <WorkspacePanel 
        workspaceName={selectedWorkspace}
      />
    </div>
  );
}
