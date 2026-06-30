import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { terminalLineVariants } from '../../animations/variants';
import type { TerminalLine as TLine } from '../../types';

interface TerminalProps {
  lines: TLine[];
  onCommand?: (command: string) => void;
  showInput?: boolean;
  inputPrefix?: string;
  className?: string;
  minHeight?: string;
  autoScroll?: boolean;
  showHeader?: boolean;
  title?: string;
}

const LINE_COLORS: Record<string, string> = {
  input: 'text-neon-green',
  output: 'text-gray-300',
  error: 'text-alert-red',
  info: 'text-cyber-blue',
  success: 'text-success-green',
  warning: 'text-alert-yellow',
  system: 'text-gray-500',
  ascii: 'text-neon-green',
};

export default function Terminal({
  lines,
  onCommand,
  showInput = false,
  inputPrefix = '$ ',
  className = '',
  minHeight = '400px',
  autoScroll = true,
  showHeader = true,
  title = 'Terminal',
}: TerminalProps) {
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lines, autoScroll]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      onCommand?.(inputValue.trim());
      setCommandHistory(prev => [inputValue.trim(), ...prev]);
      setInputValue('');
      setHistoryIndex(-1);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIdx = historyIndex + 1;
        setHistoryIndex(newIdx);
        setInputValue(commandHistory[newIdx]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIdx = historyIndex - 1;
        setHistoryIndex(newIdx);
        setInputValue(commandHistory[newIdx]);
      } else {
        setHistoryIndex(-1);
        setInputValue('');
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      // Clear is handled by parent
    }
  }, [inputValue, onCommand, commandHistory, historyIndex]);

  const focusInput = () => {
    inputRef.current?.focus();
  };

  return (
    <div
      className={`rounded-lg overflow-hidden border border-white/[0.06] bg-bg-primary ${className}`}
      style={{ minHeight }}
      onClick={focusInput}
    >
      {showHeader && (
        <div className="flex items-center gap-2 px-4 py-2.5 bg-bg-secondary border-b border-white/[0.06]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs text-gray-500 font-terminal ml-2">{title}</span>
        </div>
      )}

      <div
        ref={containerRef}
        className="p-4 overflow-y-auto font-terminal text-sm leading-6"
        style={{ maxHeight: `calc(${minHeight} - ${showHeader ? '42px' : '0px'})` }}
      >
        {lines.map((line, i) => (
          <motion.div
            key={line.id || i}
            variants={terminalLineVariants}
            initial="hidden"
            animate="visible"
            className={`${LINE_COLORS[line.type] || 'text-gray-300'} whitespace-pre-wrap break-all`}
          >
            {line.type === 'input' && (
              <span className="text-neon-green/70">{inputPrefix}</span>
            )}
            {line.content}
          </motion.div>
        ))}

        {showInput && (
          <div className="flex items-center mt-0.5">
            <span className="text-neon-green/70 font-terminal text-sm">{inputPrefix}</span>
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent border-none outline-none text-neon-green font-terminal text-sm caret-neon-green"
              autoFocus
              spellCheck={false}
              autoComplete="off"
            />
            {!inputValue && (
              <span className="terminal-cursor" />
            )}
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
