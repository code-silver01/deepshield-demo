import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, FileText, Info, Shield, TreePine, Box, Wrench, Brain, Gauge, Zap } from 'lucide-react';
import { useThreats } from '../../contexts/ThreatContext';
import { drawerVariants, overlayVariants } from '../../animations/variants';
import { formatFullTimestamp, relativeTime, getSeverityBg, getPriorityColor, formatBytes } from '../../utils/formatters';
import AIAnalysisModal from '../AIAnalysis/AIAnalysisModal';
import type { SecurityEvent } from '../../types';

const TABS = [
  { id: 'timeline', label: 'Timeline', icon: Clock },
  { id: 'logs', label: 'Raw Logs', icon: FileText },
  { id: 'metadata', label: 'Metadata', icon: Info },
  { id: 'mitre', label: 'MITRE ATT&CK', icon: Shield },
  { id: 'process', label: 'Process Tree', icon: TreePine },
  { id: 'container', label: 'Container', icon: Box },
  { id: 'fix', label: 'Suggested Fix', icon: Wrench },
] as const;

type TabId = typeof TABS[number]['id'];

export default function ThreatDrawer() {
  const { isDrawerOpen, selectedEvent, closeDrawer } = useThreats();
  const [activeTab, setActiveTab] = useState<TabId>('timeline');
  const [showAI, setShowAI] = useState(false);

  if (!selectedEvent) return null;

  const event = selectedEvent;

  return (
    <>
      <AnimatePresence>
        {isDrawerOpen && (
          <>
            {/* Overlay */}
            <motion.div
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={closeDrawer}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Drawer */}
            <motion.div
              variants={drawerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-bg-primary border-l border-white/[0.06] z-50 flex flex-col"
            >
              {/* Header */}
              <div className="flex items-start justify-between p-5 border-b border-white/[0.06] bg-bg-secondary">
                <div className="flex-1 min-w-0 pr-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`severity-dot ${event.severity}`} />
                    <span className={`text-xs font-terminal px-1.5 py-0.5 rounded border ${getSeverityBg(event.severity)}`}>
                      {event.severity.toUpperCase()}
                    </span>
                    <span className="text-xs font-terminal" style={{ color: getPriorityColor(event.priority) }}>
                      P{event.priority}
                    </span>
                    {event.count > 1 && (
                      <span className="text-xs font-terminal text-cyber-blue bg-cyber-blue/10 px-2 py-0.5 rounded-full">
                        ×{event.count}
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-semibold text-gray-100">{event.title}</h2>
                  <p className="text-sm text-gray-400 mt-1">{event.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-gray-500 font-terminal">
                    <span>{event.tool}</span>
                    <span>•</span>
                    <span>{relativeTime(event.timestamp)}</span>
                    <span>•</span>
                    <span>{event.eventId}</span>
                  </div>
                </div>
                <button onClick={closeDrawer} className="p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Risk score & AI button */}
              <div className="flex items-center gap-4 px-5 py-3 border-b border-white/[0.06]">
                <div className="flex items-center gap-2">
                  <Gauge className="w-4 h-4 text-gray-400" />
                  <span className="text-xs text-gray-500">Risk Score:</span>
                  <span className={`text-sm font-bold font-terminal ${
                    event.riskScore >= 80 ? 'text-alert-red' :
                    event.riskScore >= 60 ? 'text-alert-orange' :
                    event.riskScore >= 40 ? 'text-alert-yellow' :
                    'text-success-green'
                  }`}>
                    {event.riskScore}/100
                  </span>
                </div>
                <div className="flex-1" />
                <motion.button
                  onClick={() => setShowAI(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyber-blue/10 text-cyber-blue border border-cyber-blue/20 text-xs font-terminal hover:bg-cyber-blue/20 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Zap className="w-3.5 h-3.5" />
                  AI Analysis
                </motion.button>
              </div>

              {/* Tabs */}
              <div className="flex gap-0 border-b border-white/[0.06] px-2 overflow-x-auto">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2.5 text-xs whitespace-nowrap border-b-2 transition-all ${
                      activeTab === tab.id
                        ? 'border-neon-green text-neon-green'
                        : 'border-transparent text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <tab.icon className="w-3.5 h-3.5" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="flex-1 overflow-y-auto p-5">
                {activeTab === 'timeline' && <TimelineTab event={event} />}
                {activeTab === 'logs' && <RawLogsTab event={event} />}
                {activeTab === 'metadata' && <MetadataTab event={event} />}
                {activeTab === 'mitre' && <MitreTab event={event} />}
                {activeTab === 'process' && <ProcessTreeTab event={event} />}
                {activeTab === 'container' && <ContainerTab event={event} />}
                {activeTab === 'fix' && <FixTab event={event} />}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* AI Analysis Modal */}
      {showAI && selectedEvent && (
        <AIAnalysisModal event={selectedEvent} onClose={() => setShowAI(false)} />
      )}
    </>
  );
}

function TimelineTab({ event }: { event: SecurityEvent }) {
  return (
    <div className="space-y-0">
      {event.timeline.map((item, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.1 }}
          className="flex gap-4 pb-6 relative"
        >
          {/* Line */}
          {i < event.timeline.length - 1 && (
            <div className="absolute left-[11px] top-6 bottom-0 w-px bg-white/[0.06]" />
          )}
          {/* Dot */}
          <div className={`severity-dot ${item.severity} mt-1.5 flex-shrink-0 z-10`} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium text-gray-200">{item.action}</span>
            </div>
            <p className="text-xs text-gray-500">{item.detail}</p>
            <span className="text-[10px] text-gray-600 font-terminal mt-1 block">
              {formatFullTimestamp(new Date(item.timestamp))}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function RawLogsTab({ event }: { event: SecurityEvent }) {
  return (
    <div className="bg-bg-primary rounded-lg p-4 border border-white/[0.04]">
      <pre className="font-terminal text-xs text-gray-400 whitespace-pre-wrap leading-6 overflow-x-auto">
        {event.rawLogs.join('\n')}
      </pre>
    </div>
  );
}

function MetadataTab({ event }: { event: SecurityEvent }) {
  const meta = event.metadata;
  const fields = [
    ['Source IP', meta.sourceIP],
    ['Destination IP', meta.destinationIP],
    ['Port', meta.port.toString()],
    ['Protocol', meta.protocol],
    ['User', meta.user],
    ['PID', meta.pid.toString()],
    ['Command', meta.command],
    ['Parent Process', meta.parentProcess],
    ['Working Directory', meta.workingDirectory],
    ['File Hash', meta.fileHash],
    ['Network Bytes', formatBytes(meta.networkBytes)],
    ['Rule ID', event.ruleId],
    ['Event ID', event.eventId],
    ['Host', event.host],
  ];

  return (
    <div className="space-y-2">
      {fields.map(([key, value]) => (
        <div key={key} className="flex items-start gap-4 py-2 border-b border-white/[0.04] last:border-0">
          <span className="text-xs text-gray-500 w-32 flex-shrink-0 font-terminal">{key}</span>
          <span className="text-xs text-gray-300 font-terminal break-all">{value}</span>
        </div>
      ))}
    </div>
  );
}

function MitreTab({ event }: { event: SecurityEvent }) {
  const mitre = event.mitreAttack;
  return (
    <div className="space-y-4">
      <div className="glass rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Tactic</span>
            <div className="text-sm text-gray-200 mt-1">{mitre.tactic}</div>
            <span className="text-xs text-cyber-blue font-terminal">{mitre.tacticId}</span>
          </div>
          <div>
            <span className="text-[10px] text-gray-500 uppercase tracking-wider">Technique</span>
            <div className="text-sm text-gray-200 mt-1">{mitre.technique}</div>
            <span className="text-xs text-cyber-blue font-terminal">{mitre.techniqueId}</span>
          </div>
        </div>
        <div className="mt-4 pt-3 border-t border-white/[0.06]">
          <span className="text-[10px] text-gray-500 uppercase tracking-wider">Description</span>
          <p className="text-xs text-gray-400 mt-1">{mitre.description}</p>
        </div>
      </div>
      <a
        href={`https://attack.mitre.org/techniques/${mitre.techniqueId.replace('.', '/')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-cyber-blue hover:underline font-terminal"
      >
        View on MITRE ATT&CK →
      </a>
    </div>
  );
}

function ProcessTreeTab({ event }: { event: SecurityEvent }) {
  const renderNode = (node: SecurityEvent['processTree'], depth: number = 0): React.ReactNode => (
    <div key={node.pid} className={`${depth > 0 ? 'ml-6 border-l border-white/[0.06] pl-4' : ''}`}>
      <div className="flex items-center gap-2 py-2">
        <div className="w-2 h-2 rounded-full bg-neon-green/60" />
        <span className="text-xs font-terminal text-gray-300">{node.name}</span>
        <span className="text-[10px] font-terminal text-gray-600">PID:{node.pid}</span>
        <span className="text-[10px] font-terminal text-gray-600">({node.user})</span>
      </div>
      <div className="text-[10px] font-terminal text-gray-500 ml-4 mb-2">{node.command}</div>
      {node.children.map(child => renderNode(child, depth + 1))}
    </div>
  );

  return <div>{renderNode(event.processTree)}</div>;
}

function ContainerTab({ event }: { event: SecurityEvent }) {
  const fields = [
    ['Container', event.container],
    ['Container ID', event.containerId],
    ['Image', event.image],
    ['Namespace', event.namespace],
    ['Pod', event.pod],
    ['Host', event.host],
  ];

  return (
    <div className="space-y-2">
      {fields.map(([key, value]) => (
        <div key={key} className="flex items-start gap-4 py-2 border-b border-white/[0.04] last:border-0">
          <span className="text-xs text-gray-500 w-28 flex-shrink-0 font-terminal">{key}</span>
          <span className="text-xs text-gray-300 font-terminal break-all">{value}</span>
        </div>
      ))}
    </div>
  );
}

function FixTab({ event }: { event: SecurityEvent }) {
  return (
    <div className="glass rounded-lg p-4">
      <div className="flex items-center gap-2 mb-3">
        <Wrench className="w-4 h-4 text-alert-yellow" />
        <span className="text-sm font-medium text-gray-200">Recommended Action</span>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed">{event.suggestedFix}</p>
    </div>
  );
}
