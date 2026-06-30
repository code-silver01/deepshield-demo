import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { MODULE_DEPLOY_LOGS, type LogEntry } from '../data/moduleLogs';
import { staggerContainer, staggerItem } from '../animations/variants';
import { generateId } from '../utils/formatters';
import type { ModuleName } from '../types';

interface ModuleDeployState {
  name: string;
  phase: 'waiting' | 'installing' | 'configuring' | 'starting' | 'running';
  progress: number;
  logs: { id: string; message: string; level: string }[];
  showLogs: boolean;
}

export default function DeployPage() {
  const { modules, setStep, setIsDeployed } = useApp();
  const [deployStates, setDeployStates] = useState<ModuleDeployState[]>([]);
  const [allComplete, setAllComplete] = useState(false);
  const logEndRef = useRef<Record<string, HTMLDivElement | null>>({});

  const enabledModules = modules.filter(m => m.enabled && ['Falco', 'Suricata', 'Wazuh', 'Zeek'].includes(m.name));

  // Initialize deploy states
  useEffect(() => {
    setDeployStates(
      enabledModules.map(m => ({
        name: m.name,
        phase: 'waiting',
        progress: 0,
        logs: [],
        showLogs: true,
      }))
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deploy each module with staggered start
  useEffect(() => {
    if (deployStates.length === 0) return;

    const deployModule = async (index: number) => {
      const moduleName = enabledModules[index]?.name;
      if (!moduleName) return;

      const logs = MODULE_DEPLOY_LOGS[moduleName] || [];
      const phases: ModuleDeployState['phase'][] = ['installing', 'configuring', 'starting', 'running'];
      const phaseBreakpoints = [0.3, 0.6, 0.85, 1.0];

      // Start deploying
      let currentLogIdx = 0;
      let currentProgress = 0;

      const updateState = (updates: Partial<ModuleDeployState>) => {
        setDeployStates(prev =>
          prev.map(s => s.name === moduleName ? { ...s, ...updates } : s)
        );
      };

      // Process each log entry
      for (const log of logs) {
        await new Promise(resolve => setTimeout(resolve, log.delay));

        currentLogIdx++;
        currentProgress = Math.min((currentLogIdx / logs.length) * 100, 100);

        // Determine phase
        const progressRatio = currentLogIdx / logs.length;
        let phase: ModuleDeployState['phase'] = 'installing';
        for (let p = 0; p < phaseBreakpoints.length; p++) {
          if (progressRatio <= phaseBreakpoints[p]) {
            phase = phases[p];
            break;
          }
        }

        updateState({
          phase,
          progress: Math.round(currentProgress),
          logs: [...Array(currentLogIdx)].map((_, i) => ({
            id: generateId(),
            message: logs[i].message,
            level: logs[i].level,
          })),
        });
      }

      updateState({ phase: 'running', progress: 100 });
    };

    // Stagger deployments
    enabledModules.forEach((_, i) => {
      setTimeout(() => deployModule(i), i * 1200);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [deployStates.length > 0]);

  // Check if all complete
  useEffect(() => {
    if (deployStates.length > 0 && deployStates.every(s => s.phase === 'running')) {
      setTimeout(() => setAllComplete(true), 800);
    }
  }, [deployStates]);

  const handleContinue = () => {
    setIsDeployed(true);
    setStep('project-path');
  };

  const getPhaseLabel = (phase: ModuleDeployState['phase']) => {
    switch (phase) {
      case 'waiting': return 'Waiting...';
      case 'installing': return 'Installing...';
      case 'configuring': return 'Configuring...';
      case 'starting': return 'Starting...';
      case 'running': return 'Running';
    }
  };

  const getPhaseColor = (phase: ModuleDeployState['phase']) => {
    switch (phase) {
      case 'waiting': return 'text-gray-500';
      case 'installing': return 'text-cyber-blue';
      case 'configuring': return 'text-alert-yellow';
      case 'starting': return 'text-alert-orange';
      case 'running': return 'text-neon-green';
    }
  };

  const toggleLogs = (name: string) => {
    setDeployStates(prev =>
      prev.map(s => s.name === name ? { ...s, showLogs: !s.showLogs } : s)
    );
  };

  return (
    <div className="min-h-screen bg-bg-primary p-4 md:p-8 flex flex-col">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-7xl mx-auto flex-1 flex flex-col"
      >
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-xl font-semibold text-gray-100 mb-1">Deploying Modules</h1>
          <p className="text-sm text-gray-500 font-terminal">
            {allComplete
              ? `All ${deployStates.length} modules deployed successfully`
              : `Deploying ${deployStates.filter(s => s.phase !== 'waiting').length}/${deployStates.length} modules...`
            }
          </p>
        </div>

        {/* Module cards */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-4 grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-max"
        >
          {deployStates.map((state) => (
            <motion.div
              key={state.name}
              variants={staggerItem}
              className="rounded-xl border border-white/[0.06] bg-bg-secondary overflow-hidden flex flex-col h-full"
            >
              {/* Module header */}
              <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-bg-tertiary/50 transition-colors"
                onClick={() => toggleLogs(state.name)}
              >
                <div className="flex items-center gap-3">
                  {/* Status icon */}
                  {state.phase === 'running' ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', damping: 10 }}
                    >
                      <CheckCircle2 className="w-5 h-5 text-neon-green" />
                    </motion.div>
                  ) : state.phase === 'waiting' ? (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-600" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-cyber-blue animate-spin" />
                  )}

                  <div>
                    <span className="font-medium text-sm text-gray-100">{state.name}</span>
                    <span className={`ml-3 text-xs font-terminal ${getPhaseColor(state.phase)}`}>
                      {getPhaseLabel(state.phase)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-gray-500 font-terminal">{state.progress}%</span>
                  <span className="text-xs text-gray-600">{state.showLogs ? '▼' : '▶'}</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="px-5">
                <div className="h-1 bg-bg-primary rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${
                      state.phase === 'running'
                        ? 'bg-neon-green shadow-[0_0_10px_rgba(0,255,65,0.4)]'
                        : 'bg-cyber-blue shadow-[0_0_10px_rgba(0,212,255,0.3)]'
                    }`}
                    initial={{ width: '0%' }}
                    animate={{ width: `${state.progress}%` }}
                    transition={{ duration: 0.3, ease: 'easeOut' }}
                  />
                </div>
              </div>

              {/* Logs */}
              {state.showLogs && state.logs.length > 0 && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="px-5 py-3 mt-auto border-t border-white/[0.04] flex-1"
                >
                    {state.logs.map((log) => (
                      <div
                        key={log.id}
                        className={`leading-5 ${
                          log.level === 'success' ? 'text-success-green' :
                          log.level === 'warning' ? 'text-alert-yellow' :
                          log.level === 'error' ? 'text-alert-red' :
                          log.level === 'debug' ? 'text-gray-600' :
                          'text-gray-400'
                        }`}
                      >
                        {log.message}
                      </div>
                    ))}
                    <div ref={el => { logEndRef.current[state.name] = el; }} />
                </motion.div>
              )}
            </motion.div>
          ))}
        </motion.div>

        {/* Continue button */}
        {allComplete && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="mt-8 flex justify-end"
          >
            <motion.button
              onClick={handleContinue}
              className="px-6 py-2.5 rounded-lg font-terminal text-sm font-medium bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20 hover:shadow-[0_0_20px_rgba(0,255,65,0.15)] transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Continue →
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
