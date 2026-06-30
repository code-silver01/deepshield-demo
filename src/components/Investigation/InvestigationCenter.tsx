import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, AlertTriangle, Clock, Target, Box, ChevronRight, Zap, Copy, FileCode, CheckCircle2, Bot, Send, Brain } from 'lucide-react';
import { useThreats } from '../../contexts/ThreatContext';
import { staggerContainer, staggerItem, fadeInUp } from '../../animations/variants';
import { getPriorityColor, relativeTime } from '../../utils/formatters';
import type { SecurityEvent } from '../../types';

export default function InvestigationCenter() {
  const { events } = useThreats();
  
  // 1. Immediate Attention (Top critical event)
  const topThreat = events.find(e => e.severity === 'critical') || events[0];

  // 2. Correlated Timeline for top threat
  const getCorrelatedTimeline = () => {
    if (!topThreat) return [];
    const baseTime = topThreat.timestamp.getTime();
    return [
      {
        id: '1',
        tool: 'Zeek',
        message: 'Detected anomalous inbound connection attempt',
        timestamp: new Date(baseTime - 5 * 60000), // 5 mins ago
        severity: 'low' as const,
      },
      {
        id: '2',
        tool: 'Wazuh',
        message: 'Suspicious file modification detected in /tmp',
        timestamp: new Date(baseTime - 2 * 60000), // 2 mins ago
        severity: 'medium' as const,
      },
      {
        id: '3',
        tool: topThreat.tool,
        message: topThreat.title,
        timestamp: topThreat.timestamp,
        severity: topThreat.severity,
      }
    ];
  };
  const correlatedTimeline = getCorrelatedTimeline();

  // 3. Mitigations & Chatbot
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'ai'; text: string; id: number }[]>([
    { role: 'ai', text: 'Hello Analyst. I am the DeepShield SOC Assistant. How can I help you mitigate the current active threats?', id: 1 }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', text: userMsg, id: Date.now() }]);
    setChatInput('');
    setIsTyping(true);

    // Mock AI response
    setTimeout(() => {
      let aiResponse = "I've analyzed the telemetry. This appears to be part of a coordinated recon campaign. I recommend applying the suggested firewall blocks and isolating the affected container immediately.";
      if (userMsg.toLowerCase().includes('mitigate')) {
        aiResponse = "To mitigate this, you can execute the suggested remediation playbook: 1) Isolate container 2) Rotate credentials 3) Deploy the generated Suricata rule.";
      } else if (userMsg.toLowerCase().includes('rule')) {
        aiResponse = "The new rule has been staged. It targets the specific C2 communication pattern observed in the raw logs.";
      }

      setChatMessages(prev => [...prev, { role: 'ai', text: aiResponse, id: Date.now() }]);
      setIsTyping(false);
    }, 1500);
  };

  // 4. New Rules
  const suggestedRule = topThreat ? `alert ${topThreat.metadata.protocol.toLowerCase()} ${topThreat.metadata.sourceIP} any -> $HOME_NET any (msg:"DEEPSHIELD ${topThreat.title}"; sid:1000001; rev:1;)` : '';
  const [ruleCopied, setRuleCopied] = useState(false);

  const copyRule = () => {
    navigator.clipboard.writeText(suggestedRule);
    setRuleCopied(true);
    setTimeout(() => setRuleCopied(false), 2000);
  };

  // 5. Duplicate Detection
  const duplicates = events.filter(e => e.count > 1).sort((a, b) => b.count - a.count).slice(0, 5);

  return (
    <div className="space-y-4">
      {/* Top row: Immediate Attention (Span 2) & Mitigations (Span 1) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* 1. Immediate Attention */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="lg:col-span-2 glass rounded-xl overflow-hidden border border-alert-red/30 relative flex flex-col min-h-[400px] lg:h-[450px]">
          <div className="absolute top-0 left-0 right-0 h-1 bg-alert-red shadow-[0_0_10px_rgba(255,23,68,0.5)]" />
          <div className="p-5 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-alert-red" />
                <h3 className="text-sm font-semibold text-gray-100 uppercase tracking-wider">Immediate Attention Required</h3>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-[10px] text-gray-500 uppercase">Confidence</div>
                  <div className="text-sm font-terminal font-bold text-alert-red">{topThreat?.riskScore || 0}%</div>
                </div>
              </div>
            </div>
            
            {topThreat ? (
              <div className="flex-1 flex flex-col md:flex-row gap-5">
                <div className="flex-1 space-y-3">
                  <div className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.06]">
                    <div className="text-xs text-gray-400 mb-1">Target Asset</div>
                    <div className="font-terminal text-sm text-neon-green">{topThreat.container}</div>
                    <div className="text-[10px] text-gray-500 font-terminal mt-0.5">{topThreat.host}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Attacker Context & Reasoning</div>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      High-confidence match for <span className="text-cyber-blue font-terminal">{topThreat.mitreAttack.technique}</span>. 
                      The actor is attempting to execute unauthorized processes. This behavior strongly correlates with known initial access vectors. Immediate containment is advised to prevent lateral movement.
                    </p>
                  </div>
                </div>
                
                <div className="flex-1 flex flex-col">
                  <div className="text-xs text-gray-400 mb-1">Relevant Telemetry (Snippet)</div>
                  <div className="flex-1 bg-bg-primary rounded-lg border border-white/[0.06] p-3 overflow-hidden relative">
                    <pre className="text-[10px] font-terminal text-gray-400 whitespace-pre-wrap leading-5 h-full overflow-y-auto">
                      {topThreat.rawLogs.slice(0, 4).join('\n')}
                    </pre>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-bg-primary to-transparent" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-sm py-8 text-center flex-1 flex items-center justify-center">
                No active threats requiring immediate attention.
              </div>
            )}
          </div>
        </motion.div>

        {/* 3. Mitigations & Chatbot */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="glass rounded-xl flex flex-col min-h-[400px] lg:h-[450px]">
          <div className="p-4 border-b border-white/[0.06] flex items-center gap-2 bg-bg-secondary/50">
            <Brain className="w-4 h-4 text-cyber-blue" />
            <h3 className="text-sm font-medium text-gray-200">SOC Assistant</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map(msg => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'ai' && (
                  <div className="w-6 h-6 rounded bg-cyber-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-cyber-blue" />
                  </div>
                )}
                <div className={`p-3 rounded-lg max-w-[85%] text-xs leading-relaxed ${
                  msg.role === 'user' ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' : 'bg-white/[0.04] text-gray-300 border border-white/[0.06]'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-6 h-6 rounded bg-cyber-blue/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Bot className="w-3.5 h-3.5 text-cyber-blue" />
                </div>
                <div className="p-3 rounded-lg bg-white/[0.04] border border-white/[0.06] flex gap-1">
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4 }} className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                  <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} className="w-1.5 h-1.5 rounded-full bg-gray-500" />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/[0.06] bg-bg-secondary/50">
            <div className="relative">
              <input
                type="text"
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                placeholder="Ask for mitigations..."
                className="w-full bg-bg-primary border border-white/[0.1] rounded-lg pl-3 pr-10 py-2 text-xs text-gray-200 font-terminal focus:border-cyber-blue/50 outline-none"
              />
              <button 
                type="submit"
                disabled={!chatInput.trim() || isTyping}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-cyber-blue disabled:opacity-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </form>
        </motion.div>
      </div>

      {/* Bottom row: Timeline, Duplicates, New Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* 2. Timeline & History */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="glass rounded-xl p-5 md:col-span-1 flex flex-col min-h-[400px] lg:h-[450px]">
          <h3 className="text-sm font-medium text-gray-200 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-400" />
            Attack Correlation
          </h3>
          <div className="flex-1 overflow-y-auto pr-2 space-y-4">
            {topThreat ? (
              <>
                {correlatedTimeline.map((evt, i) => (
                  <div key={evt.id} className="relative pl-4 pb-1">
                    {i !== correlatedTimeline.length - 1 && (
                      <div className="absolute left-[7px] top-4 bottom-[-16px] w-px bg-white/[0.06]" />
                    )}
                    <div className={`absolute left-0 top-1.5 w-3.5 h-3.5 rounded-full border-[3px] border-bg-primary shadow-sm ${
                      evt.severity === 'critical' ? 'bg-alert-red' :
                      evt.severity === 'high' ? 'bg-alert-orange' :
                      evt.severity === 'medium' ? 'bg-alert-yellow' : 'bg-success-green'
                    }`} />
                    <div className="text-[10px] text-gray-500 font-terminal">
                      {evt.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </div>
                    <div className="text-xs font-medium text-gray-200 mt-0.5" title={evt.message}>{evt.message}</div>
                    <div className="text-[10px] text-cyber-blue font-terminal mt-1">{evt.tool}</div>
                  </div>
                ))}
                
                <div className="mt-6 pt-4 border-t border-white/[0.06]">
                  <div className="text-[11px] font-terminal text-gray-400 leading-relaxed bg-white/[0.03] p-3 rounded-lg border border-white/[0.06]">
                    <span className="text-alert-yellow">Correlation Insight: </span>
                    Combined events suggest a coordinated attack aimed at <span className="text-neon-green">{topThreat.mitreAttack.tactic}</span>.
                    <br /><br />
                    <span className="text-gray-500">Ref: Similar pattern was observed during testing for vulnerabilities.</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center text-gray-500 text-sm py-10">No threat to correlate.</div>
            )}
          </div>
        </motion.div>

        {/* 5. Duplicate Detection */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="glass rounded-xl p-5 flex flex-col min-h-[400px] lg:h-[450px]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <Box className="w-4 h-4 text-gray-400" />
              Duplicate Detection
            </h3>
            <span className="text-[10px] text-gray-500 font-terminal">Volume Analysis</span>
          </div>
          
          <div className="flex-1 overflow-y-auto space-y-2.5">
            {duplicates.length > 0 ? duplicates.map(dup => (
              <div key={dup.id} className="p-3 bg-white/[0.02] border border-white/[0.04] rounded-lg">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="text-xs text-gray-300 font-medium line-clamp-2">{dup.title}</div>
                  <div className="px-2 py-0.5 rounded-full bg-cyber-blue/10 border border-cyber-blue/20 text-cyber-blue text-xs font-terminal font-bold shrink-0">
                    ×{dup.count}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-gray-500 font-terminal">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3 h-3" /> {dup.tool}
                  </span>
                  <span>{relativeTime(dup.timestamp)}</span>
                </div>
                <div className="mt-2 text-[10px] text-gray-400 bg-bg-primary px-2 py-1 rounded">
                  Suppressed duplicate alerts automatically to reduce alert fatigue.
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 text-sm py-10">No significant duplicates detected yet.</div>
            )}
          </div>
        </motion.div>

        {/* 4. New Rules to be written */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="glass rounded-xl p-5 flex flex-col min-h-[400px] lg:h-[450px]">
          <h3 className="text-sm font-medium text-gray-200 mb-4 flex items-center gap-2">
            <FileCode className="w-4 h-4 text-gray-400" />
            Proactive Rule Generation
          </h3>
          <p className="text-xs text-gray-400 mb-4">
            Based on the current threat landscape, the DeepShield engine recommends staging the following rule to proactively block similar indicators of compromise.
          </p>
          
          {topThreat ? (
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="bg-bg-primary border border-white/[0.06] rounded-lg p-3 relative flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Suricata Rule</span>
                  <button 
                    onClick={copyRule}
                    className="p-1 hover:bg-white/[0.1] rounded text-gray-400 hover:text-white transition-colors"
                  >
                    {ruleCopied ? <CheckCircle2 className="w-3.5 h-3.5 text-neon-green" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <pre className="text-xs font-terminal text-cyber-blue whitespace-pre-wrap flex-1 overflow-y-auto leading-relaxed">
                  {suggestedRule}
                </pre>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="flex-1 bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20 py-2 rounded-lg text-xs font-terminal font-bold transition-all">
                  Stage Rule
                </button>
                <button className="flex-1 bg-white/[0.04] text-gray-400 border border-white/[0.06] hover:bg-white/[0.08] hover:text-gray-200 py-2 rounded-lg text-xs font-terminal font-bold transition-all">
                  Dismiss
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500 text-sm py-10">No immediate rules required.</div>
          )}
        </motion.div>

      </div>
    </div>
  );
}
