import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useApp } from './contexts/AppContext';
import LandingPage from './pages/LandingPage';
import ModuleSelectPage from './pages/ModuleSelectPage';
import DeployPage from './pages/DeployPage';
import ProjectPathPage from './pages/ProjectPathPage';
import RuleGenerationPage from './pages/RuleGenerationPage';
import MonitoringPage from './pages/MonitoringPage';

export default function App() {
  const { currentStep } = useApp();

  const renderStep = () => {
    switch (currentStep) {
      case 'landing':
      case 'init':
        return <LandingPage key="landing" />;
      case 'module-select':
        return <ModuleSelectPage key="module-select" />;
      case 'deploy':
        return <DeployPage key="deploy" />;
      case 'project-path':
        return <ProjectPathPage key="project-path" />;
      case 'rule-generation':
        return <RuleGenerationPage key="rule-generation" />;
      case 'monitoring':
        return <MonitoringPage key="monitoring" />;
      default:
        return <LandingPage key="landing" />;
    }
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={currentStep}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderStep()}
      </motion.div>
    </AnimatePresence>
  );
}
