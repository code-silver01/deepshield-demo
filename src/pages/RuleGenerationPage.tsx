import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { RULE_GENERATION_LOGS } from '../data/moduleLogs';
import { generateId } from '../utils/formatters';
import type { TerminalLine } from '../types';

export default function RuleGenerationPage() {
  const { setStep } = useApp();
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: generateId(), content: '$ deepshield generate-rules', type: 'input', timestamp: new Date() },
    { id: generateId(), content: '', type: 'output', timestamp: new Date() },
  ]);
  const [phase, setPhase] = useState<'running' | 'done'>('running');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  // Run rule generation sequence
  useEffect(() => {
    let i = 0;
    const logs = RULE_GENERATION_LOGS;

    const runNext = () => {
      if (i < logs.length) {
        const log = logs[i];
        setLines(prev => [...prev, {
          id: generateId(),
          content: log.message,
          type: log.level === 'success' ? 'success' : log.level === 'warning' ? 'warning' : log.level === 'debug' ? 'system' : 'info',
          timestamp: new Date(),
        }]);
        i++;
        setTimeout(runNext, log.delay);
      } else {
        setPhase('done');
      }
    };

    setTimeout(runNext, 800);
  }, []);

  // Auto-advance
  useEffect(() => {
    if (phase === 'done') {
      const timer = setTimeout(() => setStep('monitoring'), 2000);
      return () => clearTimeout(timer);
    }
  }, [phase, setStep]);

  return (
    <div className="min-h-screen bg-bg-primary p-4 md:p-8 flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full flex-1 flex flex-col"
      >
        <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-bg-primary shadow-2xl flex-1 flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 bg-bg-secondary border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840]" />
            </div>
            <span className="text-xs text-gray-500 font-terminal ml-2">deepshield — rule generation</span>
          </div>

          <div
            className="p-6 font-terminal text-sm overflow-y-auto flex-1"
          >
            {lines.map((line) => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={`leading-7 whitespace-pre-wrap ${
                  line.type === 'input' ? 'text-neon-green' :
                  line.type === 'success' ? 'text-success-green' :
                  line.type === 'warning' ? 'text-alert-yellow' :
                  line.type === 'info' ? 'text-cyber-blue' :
                  line.type === 'system' ? 'text-gray-600' :
                  'text-gray-300'
                }`}
              >
                {line.content}
              </motion.div>
            ))}

            {phase === 'done' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6"
              >
                <div className="border border-neon-green/20 rounded-lg p-4 bg-neon-green/[0.03]">
                  <div className="text-neon-green text-sm font-semibold mb-2">✓ All systems operational</div>
                  <div className="text-gray-400 text-xs space-y-1">
                    <div>• 64 detection rules deployed across 3 engines</div>
                    <div>• Real-time monitoring active</div>
                    <div>• Threat detection starting...</div>
                  </div>
                </div>
                <div className="mt-3 text-gray-600 text-xs">
                  Transitioning to monitoring dashboard...
                </div>
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
