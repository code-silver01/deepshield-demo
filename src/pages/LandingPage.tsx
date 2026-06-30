import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../contexts/AppContext';
import { ASCII_LOGO, BOOT_SEQUENCE, CONFIG } from '../constants/config';
import type { TerminalLine } from '../types';
import { generateId } from '../utils/formatters';

export default function LandingPage() {
  const { setStep } = useApp();
  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [phase, setPhase] = useState<'logo' | 'boot' | 'ready' | 'done'>('logo');
  const [logoLines, setLogoLines] = useState<string[]>([]);
  const [showCursor, setShowCursor] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  const addLine = useCallback((content: string, type: TerminalLine['type'] = 'output') => {
    setLines(prev => [...prev, { id: generateId(), content, type, timestamp: new Date() }]);
  }, []);

  // Phase 1: Animate ASCII logo line by line
  useEffect(() => {
    if (phase !== 'logo') return;
    const allLines = ASCII_LOGO.split('\n');
    let i = 0;
    const interval = setInterval(() => {
      if (i < allLines.length) {
        setLogoLines(prev => [...prev, allLines[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase('boot'), 600);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [phase]);

  // Phase 2: Boot sequence with typing
  useEffect(() => {
    if (phase !== 'boot') return;
    let i = 0;
    const runNext = () => {
      if (i < BOOT_SEQUENCE.length) {
        const step = BOOT_SEQUENCE[i];
        const isLast = i === BOOT_SEQUENCE.length - 1;
        addLine(step.text, isLast ? 'success' : 'info');
        i++;
        setTimeout(runNext, step.delay);
      } else {
        setTimeout(() => setPhase('ready'), 500);
      }
    };
    setTimeout(runNext, 400);
  }, [phase, addLine]);

  // Phase 3: Ready — show prompt
  useEffect(() => {
    if (phase !== 'ready') return;
    addLine('', 'output');
    addLine('Type "deepshield init" to begin.', 'system');
    setPhase('done');
  }, [phase, addLine]);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines, logoLines]);

  // Handle command
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleCommand = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const cmd = inputValue.trim().toLowerCase();
      addLine(`$ ${inputValue}`, 'input');
      setInputValue('');
      if (cmd === 'deepshield init' || cmd === 'init') {
        addLine('Initializing DeepShield...', 'success');
        setTimeout(() => setStep('module-select'), 800);
      } else if (cmd === 'clear') {
        setLines([]);
        setLogoLines([]);
      } else if (cmd === 'help') {
        addLine('Available commands:', 'info');
        addLine('  deepshield init  — Initialize and deploy security modules', 'output');
        addLine('  clear          — Clear terminal', 'output');
        addLine('  help           — Show this help', 'output');
      } else if (cmd) {
        addLine(`command not found: ${inputValue.trim()}`, 'error');
        addLine('Type "deepshield init" to get started.', 'system');
      }
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        {/* Terminal window */}
        <div className="rounded-xl overflow-hidden border border-white/[0.06] bg-bg-primary shadow-2xl shadow-black/50">
          {/* Title bar */}
          <div className="flex items-center gap-2 px-4 py-3 bg-bg-secondary border-b border-white/[0.06]">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-[#ff5f57] shadow-[0_0_6px_rgba(255,95,87,0.4)]" />
              <div className="w-3 h-3 rounded-full bg-[#febc2e] shadow-[0_0_6px_rgba(254,188,46,0.4)]" />
              <div className="w-3 h-3 rounded-full bg-[#28c840] shadow-[0_0_6px_rgba(40,200,64,0.4)]" />
            </div>
            <span className="text-xs text-gray-500 font-terminal ml-2">deepshield — terminal</span>
          </div>

          {/* Terminal content */}
          <div
            className="p-6 font-terminal text-sm overflow-y-auto relative"
            style={{ minHeight: '500px', maxHeight: '80vh' }}
            onClick={() => inputRef.current?.focus()}
          >
            {/* Scan line overlay */}
            <div className="absolute inset-0 pointer-events-none scan-line opacity-30" />

            {/* ASCII Logo */}
            <AnimatePresence>
              {logoLines.length > 0 && (
                <div className="mb-4">
                  {logoLines.map((line, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: i * 0.02 }}
                      className="text-neon-green text-neon-glow whitespace-pre leading-[1.15] text-[11px] sm:text-xs md:text-sm"
                    >
                      {line}
                    </motion.div>
                  ))}
                  {logoLines.length === ASCII_LOGO.split('\n').length && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-gray-500 text-xs mt-2"
                    >
                      v2.4.1 — Container Security Platform
                    </motion.div>
                  )}
                </div>
              )}
            </AnimatePresence>

            {/* Divider after logo */}
            {lines.length > 0 && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                className="border-t border-white/[0.06] my-3 origin-left"
              />
            )}

            {/* Boot lines */}
            {lines.map((line) => (
              <motion.div
                key={line.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.15 }}
                className={`leading-7 whitespace-pre-wrap ${
                  line.type === 'input' ? 'text-neon-green' :
                  line.type === 'success' ? 'text-success-green' :
                  line.type === 'error' ? 'text-alert-red' :
                  line.type === 'info' ? 'text-cyber-blue' :
                  line.type === 'system' ? 'text-gray-500' :
                  'text-gray-300'
                }`}
              >
                {line.content}
              </motion.div>
            ))}

            {/* Input */}
            {phase === 'done' && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center mt-1"
              >
                <span className="text-neon-green/70">$ </span>
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={e => setInputValue(e.target.value)}
                  onKeyDown={handleCommand}
                  className="flex-1 bg-transparent border-none outline-none text-neon-green font-terminal text-sm caret-neon-green"
                  autoFocus
                  spellCheck={false}
                  autoComplete="off"
                />
                {!inputValue && showCursor && <span className="terminal-cursor" />}
              </motion.div>
            )}

            <div ref={bottomRef} />
          </div>
        </div>

        {/* Subtle hint */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: phase === 'done' ? 0.4 : 0 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-gray-600 mt-4 font-terminal"
        >
          Press Enter after typing a command
        </motion.p>
      </motion.div>
    </div>
  );
}
