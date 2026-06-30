import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Zap, Brain, Target, Shield, AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import { overlayVariants, scaleIn, staggerContainer, staggerItem } from '../../animations/variants';
import { getReportForEvent } from '../../data/aiReports';
import type { SecurityEvent, AIReport } from '../../types';

const ANALYSIS_STEPS = [
  { label: 'Running AI Agent...', icon: Brain, duration: 1500 },
  { label: 'Collecting Context...', icon: Target, duration: 1200 },
  { label: 'Comparing Historical Events...', icon: Shield, duration: 1800 },
  { label: 'Generating Report...', icon: Zap, duration: 2000 },
  { label: 'Writing Recommendations...', icon: CheckCircle2, duration: 1000 },
];

interface Props {
  event: SecurityEvent;
  onClose: () => void;
}

export default function AIAnalysisModal({ event, onClose }: Props) {
  const [phase, setPhase] = useState<'analyzing' | 'report'>('analyzing');
  const [currentStep, setCurrentStep] = useState(0);
  const [report, setReport] = useState<AIReport | null>(null);

  // Run analysis steps
  useEffect(() => {
    if (phase !== 'analyzing') return;

    let stepIdx = 0;
    const runStep = () => {
      if (stepIdx < ANALYSIS_STEPS.length) {
        setCurrentStep(stepIdx);
        const duration = ANALYSIS_STEPS[stepIdx].duration;
        stepIdx++;
        setTimeout(runStep, duration);
      } else {
        setReport(getReportForEvent(event.eventId));
        setPhase('report');
      }
    };
    setTimeout(runStep, 500);
  }, [phase, event.eventId]);

  return (
    <AnimatePresence>
      <motion.div
        variants={overlayVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          variants={scaleIn}
          initial="hidden"
          animate="visible"
          exit="exit"
          className="w-full max-w-3xl max-h-[85vh] bg-bg-primary border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] bg-bg-secondary">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyber-blue/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-cyber-blue" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-100">AI Threat Analysis</h2>
                <p className="text-[10px] text-gray-500 font-terminal">{event.title}</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/[0.04]">
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto" style={{ maxHeight: 'calc(85vh - 65px)' }}>
            {phase === 'analyzing' ? (
              <div className="p-8">
                <div className="max-w-sm mx-auto space-y-4">
                  {ANALYSIS_STEPS.map((step, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{
                        opacity: i <= currentStep ? 1 : 0.3,
                        x: i <= currentStep ? 0 : -20,
                      }}
                      transition={{ delay: i * 0.1, duration: 0.3 }}
                      className="flex items-center gap-3"
                    >
                      {i < currentStep ? (
                        <CheckCircle2 className="w-5 h-5 text-neon-green flex-shrink-0" />
                      ) : i === currentStep ? (
                        <Loader2 className="w-5 h-5 text-cyber-blue flex-shrink-0 animate-spin" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border border-gray-700 flex-shrink-0" />
                      )}
                      <span className={`text-sm font-terminal ${
                        i < currentStep ? 'text-gray-400' :
                        i === currentStep ? 'text-cyber-blue' :
                        'text-gray-600'
                      }`}>
                        {step.label}
                      </span>
                    </motion.div>
                  ))}
                </div>

                <motion.div
                  animate={{ opacity: [0.3, 0.7, 0.3] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="text-center text-xs text-gray-600 font-terminal mt-8"
                >
                  Processing threat data...
                </motion.div>
              </div>
            ) : report ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 space-y-6"
              >
                {/* Executive Summary */}
                <section>
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Executive Summary
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">{report.executiveSummary}</p>
                </section>

                {/* Confidence Score */}
                <section className="glass rounded-lg p-4 flex items-center gap-4">
                  <div className="flex-shrink-0">
                    <div className={`text-2xl font-bold font-terminal ${
                      report.confidenceScore >= 80 ? 'text-alert-red' :
                      report.confidenceScore >= 60 ? 'text-alert-orange' :
                      'text-alert-yellow'
                    }`}>
                      {report.confidenceScore}%
                    </div>
                    <div className="text-[10px] text-gray-500 uppercase">Confidence</div>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-bg-primary rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full rounded-full ${
                          report.confidenceScore >= 80 ? 'bg-alert-red' :
                          report.confidenceScore >= 60 ? 'bg-alert-orange' :
                          'bg-alert-yellow'
                        }`}
                        initial={{ width: '0%' }}
                        animate={{ width: `${report.confidenceScore}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </section>

                {/* Likely Cause */}
                <section>
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Likely Cause</h3>
                  <div className="glass rounded-lg p-3">
                    <p className="text-sm text-gray-300">{report.likelyCause}</p>
                  </div>
                </section>

                {/* Attack Chain */}
                <section>
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-3">Attack Chain</h3>
                  <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-2">
                    {report.attackChain.map((step, i) => (
                      <motion.div
                        key={i}
                        variants={staggerItem}
                        className="flex gap-3 items-start"
                      >
                        <div className="w-6 h-6 rounded-full bg-cyber-blue/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-[10px] font-terminal text-cyber-blue">{step.step}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-200">{step.action}</div>
                          <div className="text-[11px] text-gray-500 mt-0.5">{step.detail}</div>
                          <div className="text-[10px] text-gray-600 font-terminal mt-0.5">IoC: {step.indicator}</div>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </section>

                {/* Affected Assets */}
                <section>
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Affected Assets</h3>
                  <div className="space-y-1.5">
                    {report.affectedAssets.map((asset, i) => (
                      <div key={i} className="flex items-center gap-3 glass rounded-lg px-3 py-2">
                        <div className={`severity-dot ${asset.risk}`} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-gray-200">{asset.name}</span>
                          <span className="text-[10px] text-gray-600 ml-2">({asset.type})</span>
                        </div>
                        <span className="text-[10px] text-gray-500">{asset.details.slice(0, 40)}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Recommendations */}
                <section>
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Recommendations</h3>
                  <div className="space-y-2">
                    {report.recommendations.map((rec, i) => (
                      <div key={i} className="glass rounded-lg p-3 border-l-2" style={{ borderLeftColor: getPriorityColor(rec.priority) }}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-terminal" style={{ color: getPriorityColor(rec.priority) }}>P{rec.priority}</span>
                          <span className="text-xs font-medium text-gray-200">{rec.title}</span>
                        </div>
                        <p className="text-[11px] text-gray-500">{rec.description}</p>
                        <code className="text-[10px] text-gray-600 font-terminal mt-1 block">{rec.action}</code>
                      </div>
                    ))}
                  </div>
                </section>

                {/* MITRE Mapping */}
                <section>
                  <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">MITRE ATT&CK Mapping</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-gray-500 border-b border-white/[0.06]">
                          <th className="py-2 px-3 text-left font-terminal font-normal">Tactic</th>
                          <th className="py-2 px-3 text-left font-terminal font-normal">Technique</th>
                          <th className="py-2 px-3 text-left font-terminal font-normal">ID</th>
                          <th className="py-2 px-3 text-right font-terminal font-normal">Confidence</th>
                        </tr>
                      </thead>
                      <tbody>
                        {report.mitreMapping.map((m, i) => (
                          <tr key={i} className="border-b border-white/[0.04]">
                            <td className="py-2 px-3 text-gray-300">{m.tactic}</td>
                            <td className="py-2 px-3 text-gray-400">{m.technique}</td>
                            <td className="py-2 px-3 text-cyber-blue font-terminal">{m.techniqueId}</td>
                            <td className="py-2 px-3 text-right">
                              <span className={`font-terminal ${m.confidence >= 80 ? 'text-alert-red' : m.confidence >= 60 ? 'text-alert-orange' : 'text-alert-yellow'}`}>
                                {m.confidence}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                {/* Rule Improvements */}
                {report.ruleImprovements.length > 0 && (
                  <section>
                    <h3 className="text-xs text-gray-500 uppercase tracking-wider mb-2">Rule Improvements</h3>
                    <div className="space-y-3">
                      {report.ruleImprovements.map((rule, i) => (
                        <div key={i} className="glass rounded-lg p-3">
                          <div className="text-xs font-terminal text-cyber-blue mb-2">{rule.ruleId}</div>
                          <div className="text-[10px] text-gray-500 mb-1">Current:</div>
                          <pre className="text-[10px] font-terminal text-gray-600 bg-bg-primary p-2 rounded mb-2 overflow-x-auto">{rule.currentRule}</pre>
                          <div className="text-[10px] text-neon-green/70 mb-1">Suggested:</div>
                          <pre className="text-[10px] font-terminal text-neon-green/60 bg-bg-primary p-2 rounded mb-2 overflow-x-auto">{rule.suggestedRule}</pre>
                          <div className="text-[10px] text-gray-500">{rule.reason}</div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Generated timestamp */}
                <div className="text-[10px] text-gray-600 font-terminal text-center pt-4 border-t border-white/[0.06]">
                  Report generated at {report.generatedAt.toLocaleString()} • Powered by DeepShield AI Engine v2.4
                </div>
              </motion.div>
            ) : null}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function getPriorityColor(priority: number): string {
  const colors: Record<number, string> = { 1: '#ff1744', 2: '#ff6d00', 3: '#ffab00', 4: '#00e676', 5: '#2979ff' };
  return colors[priority] || '#71717a';
}
