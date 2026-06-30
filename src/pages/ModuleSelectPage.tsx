import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { staggerContainer, staggerItem } from '../animations/variants';

export default function ModuleSelectPage() {
  const { modules, toggleModule, setStep } = useApp();

  const handleDeploy = () => {
    const hasSelected = modules.some(m => m.enabled);
    if (hasSelected) {
      setStep('deploy');
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary p-4 md:p-8 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full flex-1 flex flex-col"
      >
        <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-bg-primary shadow-2xl shadow-black/50 flex-1 flex flex-col">
          {/* Header bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-bg-secondary border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-xs text-gray-500 font-terminal ml-2">deepshield init — module selection</span>
          </div>

          <div className="p-6 flex-1 flex flex-col">
            {/* Command echo */}
            <div className="font-terminal text-sm mb-6">
              <span className="text-neon-green/70">$ </span>
              <span className="text-neon-green">deepshield init</span>
            </div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <p className="text-gray-300 text-sm mb-1">Select modules to deploy:</p>
              <p className="text-gray-600 text-xs mb-6 font-terminal">Use click to toggle • Press Deploy to continue</p>
            </motion.div>

            {/* Module list */}
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-2 flex-1 overflow-y-auto pr-2"
            >
              {modules.map((mod) => (
                <motion.button
                  key={mod.name}
                  variants={staggerItem}
                  onClick={() => toggleModule(mod.name)}
                  className={`w-full flex items-center gap-4 p-4 rounded-lg border transition-all duration-200 text-left group ${
                    mod.enabled
                      ? 'border-neon-green/30 bg-neon-green/[0.04]'
                      : 'border-white/[0.06] bg-bg-secondary hover:border-white/[0.12] hover:bg-bg-tertiary'
                  }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  {/* Checkbox */}
                  <motion.div
                    className={`w-5 h-5 rounded flex-shrink-0 flex items-center justify-center border-2 transition-colors ${
                      mod.enabled
                        ? 'border-neon-green bg-neon-green/20'
                        : 'border-gray-600 group-hover:border-gray-500'
                    }`}
                    animate={mod.enabled ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 0.25 }}
                  >
                    {mod.enabled && (
                      <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 400 }}
                      >
                        <Check className="w-3 h-3 text-neon-green" strokeWidth={3} />
                      </motion.div>
                    )}
                  </motion.div>

                  {/* Icon */}
                  <span className="text-lg">{mod.icon}</span>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium text-sm ${mod.enabled ? 'text-neon-green' : 'text-gray-200'}`}>
                        {mod.name}
                      </span>
                      <span className="text-[10px] text-gray-600 font-terminal">v{mod.version}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5 truncate">{mod.description}</p>
                  </div>

                  {/* Status indicator */}
                  {mod.enabled && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_rgba(0,255,65,0.5)]"
                    />
                  )}
                </motion.button>
              ))}
            </motion.div>

            {/* Deploy button */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-8 flex items-center justify-between pt-4 border-t border-white/[0.06]"
            >
              <span className="text-xs text-gray-600 font-terminal">
                {modules.filter(m => m.enabled).length} module{modules.filter(m => m.enabled).length !== 1 ? 's' : ''} selected
              </span>
              <motion.button
                onClick={handleDeploy}
                disabled={!modules.some(m => m.enabled)}
                className={`px-6 py-2.5 rounded-lg font-terminal text-sm font-medium transition-all ${
                  modules.some(m => m.enabled)
                    ? 'bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20 hover:shadow-[0_0_20px_rgba(0,255,65,0.15)]'
                    : 'bg-gray-800 text-gray-600 border border-gray-700 cursor-not-allowed'
                }`}
                whileHover={modules.some(m => m.enabled) ? { scale: 1.02 } : {}}
                whileTap={modules.some(m => m.enabled) ? { scale: 0.98 } : {}}
              >
                Deploy →
              </motion.button>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
