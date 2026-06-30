import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { WorkflowStep, Module, ModuleName, OptionalModule } from '../types';
import { MODULE_DESCRIPTIONS, MODULE_VERSIONS } from '../constants/config';

interface AppState {
  currentStep: WorkflowStep;
  modules: Module[];
  soundEnabled: boolean;
  projectPath: string;
  isDeployed: boolean;
  sidebarCollapsed: boolean;
}

interface AppContextType extends AppState {
  setStep: (step: WorkflowStep) => void;
  toggleModule: (name: string) => void;
  updateModuleStatus: (name: string, status: Module['status'], progress?: number) => void;
  addModuleLog: (name: string, log: Module['logs'][0]) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setProjectPath: (path: string) => void;
  setIsDeployed: (deployed: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

const initialModules: Module[] = [
  { name: 'Falco' as ModuleName, enabled: true, status: 'idle', progress: 0, logs: [], description: MODULE_DESCRIPTIONS['Falco'], icon: '🦅', version: MODULE_VERSIONS['Falco'] },
  { name: 'Suricata' as ModuleName, enabled: true, status: 'idle', progress: 0, logs: [], description: MODULE_DESCRIPTIONS['Suricata'], icon: '🦈', version: MODULE_VERSIONS['Suricata'] },
  { name: 'Wazuh' as ModuleName, enabled: true, status: 'idle', progress: 0, logs: [], description: MODULE_DESCRIPTIONS['Wazuh'], icon: '🛡️', version: MODULE_VERSIONS['Wazuh'] },
  { name: 'Zeek' as ModuleName, enabled: true, status: 'idle', progress: 0, logs: [], description: MODULE_DESCRIPTIONS['Zeek'], icon: '🔍', version: MODULE_VERSIONS['Zeek'] },
  { name: 'Project Analysis' as OptionalModule, enabled: false, status: 'idle', progress: 0, logs: [], description: MODULE_DESCRIPTIONS['Project Analysis'], icon: '📊', version: MODULE_VERSIONS['Project Analysis'] },
  { name: 'Rule Generation' as OptionalModule, enabled: false, status: 'idle', progress: 0, logs: [], description: MODULE_DESCRIPTIONS['Rule Generation'], icon: '⚡', version: MODULE_VERSIONS['Rule Generation'] },
];

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>({
    currentStep: 'landing',
    modules: initialModules,
    soundEnabled: false,
    projectPath: '',
    isDeployed: false,
    sidebarCollapsed: false,
  });

  const setStep = useCallback((step: WorkflowStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const toggleModule = useCallback((name: string) => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.name === name ? { ...m, enabled: !m.enabled } : m
      ),
    }));
  }, []);

  const updateModuleStatus = useCallback((name: string, status: Module['status'], progress?: number) => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.name === name ? { ...m, status, ...(progress !== undefined ? { progress } : {}) } : m
      ),
    }));
  }, []);

  const addModuleLog = useCallback((name: string, log: Module['logs'][0]) => {
    setState(prev => ({
      ...prev,
      modules: prev.modules.map(m =>
        m.name === name ? { ...m, logs: [...m.logs, log] } : m
      ),
    }));
  }, []);

  const setSoundEnabled = useCallback((enabled: boolean) => {
    setState(prev => ({ ...prev, soundEnabled: enabled }));
  }, []);

  const setProjectPath = useCallback((path: string) => {
    setState(prev => ({ ...prev, projectPath: path }));
  }, []);

  const setIsDeployed = useCallback((deployed: boolean) => {
    setState(prev => ({ ...prev, isDeployed: deployed }));
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setState(prev => ({ ...prev, sidebarCollapsed: collapsed }));
  }, []);

  return (
    <AppContext.Provider
      value={{
        ...state,
        setStep,
        toggleModule,
        updateModuleStatus,
        addModuleLog,
        setSoundEnabled,
        setProjectPath,
        setIsDeployed,
        setSidebarCollapsed,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
