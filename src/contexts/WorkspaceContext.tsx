
import React, { createContext, useContext, useState, useEffect } from 'react';
import { LegalSubject } from '@/types/legalSubjects';

export interface Agent {
  id: string;
  name: string;
  type: LegalSubject;
  theme: string;
  isOfficial: boolean;
  workspaceId?: string;
  createdAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  icon: string;
  iconColor: string;
  createdAt: string;
}

interface WorkspaceContextType {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  agents: Agent[];
  officialAgents: Agent[];
  setSelectedWorkspace: (workspace: Workspace) => void;
  addWorkspace: (workspace: Workspace) => void;
  addAgent: (agent: Agent) => void;
  getAgentsForWorkspace: (workspaceId: string) => Agent[];
  getAgentsByLegalSubject: (workspaceId: string, subject: LegalSubject) => Agent[];
  getAvailableLegalSubjects: (workspaceId: string) => LegalSubject[];
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

// Agentes oficiais da plataforma
const OFFICIAL_AGENTS: Agent[] = [
  {
    id: 'official-contador',
    name: 'Contador',
    type: 'Direito Tributário',
    theme: 'Análises contábeis e financeiras',
    isOfficial: true,
    createdAt: 'Agente oficial'
  },
  {
    id: 'official-engenheiro',
    name: 'Engenheiro',
    type: 'Direito Ambiental',
    theme: 'Laudos técnicos e perícias',
    isOfficial: true,
    createdAt: 'Agente oficial'
  },
  {
    id: 'official-medico',
    name: 'Médico',
    type: 'Direito Civil',
    theme: 'Pareceres médicos e análises clínicas',
    isOfficial: true,
    createdAt: 'Agente oficial'
  }
];

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [agents, setAgents] = useState<Agent[]>([]);

  // Carregar dados salvos do localStorage
  useEffect(() => {
    const savedWorkspaces = localStorage.getItem('lexai-workspaces');
    const savedAgents = localStorage.getItem('lexai-agents');
    const savedSelectedWorkspace = localStorage.getItem('lexai-selected-workspace');

    if (savedWorkspaces) {
      const parsedWorkspaces = JSON.parse(savedWorkspaces);
      setWorkspaces(parsedWorkspaces);
      
      if (savedSelectedWorkspace) {
        const selected = parsedWorkspaces.find((w: Workspace) => w.id === savedSelectedWorkspace);
        if (selected) setSelectedWorkspace(selected);
      } else if (parsedWorkspaces.length > 0) {
        setSelectedWorkspace(parsedWorkspaces[0]);
      }
    }

    if (savedAgents) {
      setAgents(JSON.parse(savedAgents));
    }
  }, []);

  // Salvar mudanças no localStorage
  useEffect(() => {
    localStorage.setItem('lexai-workspaces', JSON.stringify(workspaces));
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem('lexai-agents', JSON.stringify(agents));
  }, [agents]);

  useEffect(() => {
    if (selectedWorkspace) {
      localStorage.setItem('lexai-selected-workspace', selectedWorkspace.id);
    }
  }, [selectedWorkspace]);

  const addWorkspace = (workspace: Workspace) => {
    setWorkspaces(prev => [...prev, workspace]);
    if (!selectedWorkspace) {
      setSelectedWorkspace(workspace);
    }
  };

  const addAgent = (agent: Agent) => {
    setAgents(prev => [...prev, agent]);
  };

  const getAgentsForWorkspace = (workspaceId: string) => {
    return agents.filter(agent => agent.workspaceId === workspaceId);
  };

  const getAgentsByLegalSubject = (workspaceId: string, subject: LegalSubject) => {
    return agents.filter(agent => 
      agent.workspaceId === workspaceId && agent.type === subject
    );
  };

  const getAvailableLegalSubjects = (workspaceId: string) => {
    const workspaceAgents = getAgentsForWorkspace(workspaceId);
    const subjects = new Set<LegalSubject>();
    
    workspaceAgents.forEach(agent => {
      subjects.add(agent.type);
    });
    
    return Array.from(subjects).sort();
  };

  return (
    <WorkspaceContext.Provider value={{
      workspaces,
      selectedWorkspace,
      agents,
      officialAgents: OFFICIAL_AGENTS,
      setSelectedWorkspace,
      addWorkspace,
      addAgent,
      getAgentsForWorkspace,
      getAgentsByLegalSubject,
      getAvailableLegalSubjects
    }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (context === undefined) {
    throw new Error('useWorkspace must be used within a WorkspaceProvider');
  }
  return context;
}
