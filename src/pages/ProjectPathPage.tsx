import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { PROJECT_ANALYSIS_LOGS, type LogEntry } from '../data/moduleLogs';
import { generateId } from '../utils/formatters';
import type { TerminalLine } from '../types';

export default function ProjectPathPage() {
  const { setStep, setProjectPath } = useApp();
  const [phase, setPhase] = useState<'prompt' | 'analyzing' | 'done'>('prompt');
  const [inputValue, setInputValue] = useState('');
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: generateId(), content: '$ deepshield analyze', type: 'input', timestamp: new Date() },
    { id: generateId(), content: '', type: 'output', timestamp: new Date() },
    { id: generateId(), content: 'Enter project path:', type: 'info', timestamp: new Date() },
  ]);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  const addLine = (content: string, type: TerminalLine['type'] = 'output') => {
    setLines(prev => [...prev, { id: generateId(), content, type, timestamp: new Date() }]);
  };

  const handleSubmit = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      const path = inputValue.trim();
      setProjectPath(path);
      addLine(`> ${path}`, 'input');
      addLine('', 'output');
      setInputValue('');
      setPhase('analyzing');
    }
  };

  // Run analysis
  useEffect(() => {
    if (phase !== 'analyzing') return;

    let i = 0;
    const logs = PROJECT_ANALYSIS_LOGS;

    const runNext = () => {
      if (i < logs.length) {
        const log = logs[i];
        addLine(log.message, log.level === 'success' ? 'success' : log.level === 'warning' ? 'warning' : 'info');
        i++;
        setTimeout(runNext, log.delay);
      } else {
        setPhase('done');
      }
    };

    setTimeout(runNext, 500);
  }, [phase]);

  // Auto-advance after done
  useEffect(() => {
    if (phase === 'done') {
      const timer = setTimeout(() => setStep('rule-generation'), 1500);
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
            <span className="text-xs text-gray-500 font-terminal ml-2">deepshield — project analysis</span>
          </div>

          <div
            className="p-6 font-terminal text-sm overflow-y-auto flex-1"
            onClick={() => inputRef.current?.focus()}
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
                  'text-gray-300'
                }`}
              >
                {line.content}
              </motion.div>
            ))}

            {phase === 'prompt' && (
              <div className="flex items-center">
                <span className="text-neon-green/70">{'> '}</span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleSubmit}
                  placeholder="/home/user/project"
                  className="flex-1 bg-transparent border-none outline-none text-neon-green font-terminal text-sm placeholder-gray-700 caret-neon-green"
                  autoFocus
                  spellCheck={false}
                />
                {!inputValue && <span className="terminal-cursor" />}
              </div>
            )}

            {phase === 'done' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mt-4 text-gray-500 text-xs"
              >
                Proceeding to rule generation...
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
