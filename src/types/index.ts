// ─── Severity & Priority ───────────────────────────────────────────────────

export type Severity = 'critical' | 'high' | 'medium' | 'low' | 'info';
export type Priority = 1 | 2 | 3 | 4 | 5;
export type ThreatStatus = 'active' | 'investigating' | 'mitigated' | 'resolved' | 'false_positive';
export type ModuleName = 'Falco' | 'Suricata' | 'Wazuh' | 'Zeek';
export type OptionalModule = 'Project Analysis' | 'Rule Generation';
export type ModuleStatus = 'idle' | 'installing' | 'configuring' | 'starting' | 'running' | 'error';
export type TerminalLineType = 'input' | 'output' | 'error' | 'info' | 'success' | 'warning' | 'system' | 'ascii';

// ─── Workflow Steps ────────────────────────────────────────────────────────

export type WorkflowStep =
  | 'landing'
  | 'init'
  | 'module-select'
  | 'deploy'
  | 'project-path'
  | 'rule-generation'
  | 'monitoring';

// ─── Terminal ──────────────────────────────────────────────────────────────

export interface TerminalLine {
  id: string;
  content: string;
  type: TerminalLineType;
  timestamp: Date;
  isAnimating?: boolean;
}

export interface TerminalCommand {
  command: string;
  output: string[];
  timestamp: Date;
}

// ─── Modules ───────────────────────────────────────────────────────────────

export interface Module {
  name: ModuleName | OptionalModule;
  enabled: boolean;
  status: ModuleStatus;
  progress: number;
  logs: DeploymentLog[];
  description: string;
  icon: string;
  version: string;
}

export interface DeploymentLog {
  id: string;
  timestamp: Date;
  message: string;
  level: 'info' | 'success' | 'warning' | 'error' | 'debug';
  module: string;
}

// ─── Security Events ──────────────────────────────────────────────────────

export interface SecurityEvent {
  id: string;
  eventId: string;
  title: string;
  description: string;
  priority: Priority;
  severity: Severity;
  tool: ModuleName;
  timestamp: Date;
  status: ThreatStatus;
  host: string;
  container: string;
  containerId: string;
  image: string;
  namespace: string;
  pod: string;
  count: number;
  ruleId: string;
  metadata: ThreatMetadata;
  mitreAttack: MitreAttack;
  processTree: ProcessNode;
  timeline: TimelineEvent[];
  rawLogs: string[];
  suggestedFix: string;
  riskScore: number;
}

export interface ThreatMetadata {
  sourceIP: string;
  destinationIP: string;
  port: number;
  protocol: string;
  user: string;
  pid: number;
  command: string;
  parentProcess: string;
  workingDirectory: string;
  fileHash: string;
  networkBytes: number;
}

export interface MitreAttack {
  tactic: string;
  tacticId: string;
  technique: string;
  techniqueId: string;
  subtechnique?: string;
  subtechniqueId?: string;
  description: string;
}

export interface ProcessNode {
  pid: number;
  name: string;
  command: string;
  user: string;
  children: ProcessNode[];
}

export interface TimelineEvent {
  timestamp: Date;
  action: string;
  detail: string;
  severity: Severity;
}

// ─── AI Reports ────────────────────────────────────────────────────────────

export interface AIReport {
  id: string;
  eventId: string;
  executiveSummary: string;
  attackChain: AttackChainStep[];
  likelyCause: string;
  affectedAssets: AffectedAsset[];
  confidenceScore: number;
  recommendations: Recommendation[];
  mitreMapping: MitreMapping[];
  ruleImprovements: RuleImprovement[];
  generatedAt: Date;
}

export interface AttackChainStep {
  step: number;
  action: string;
  detail: string;
  indicator: string;
}

export interface AffectedAsset {
  name: string;
  type: 'container' | 'host' | 'service' | 'network';
  risk: Severity;
  details: string;
}

export interface Recommendation {
  priority: Priority;
  title: string;
  description: string;
  action: string;
}

export interface MitreMapping {
  tactic: string;
  technique: string;
  techniqueId: string;
  confidence: number;
}

export interface RuleImprovement {
  ruleId: string;
  currentRule: string;
  suggestedRule: string;
  reason: string;
}

// ─── Dashboard ─────────────────────────────────────────────────────────────

export interface DashboardStats {
  threatCounts: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    info: number;
  };
  totalThreats: number;
  activeThreats: number;
  resolvedThreats: number;
  detectionRate: number;
  avgResponseTime: number;
  moduleStatus: ModuleStatusInfo[];
  systemMetrics: SystemMetrics;
  threatTrend: ThreatTrendPoint[];
  topAttackTypes: { name: string; count: number }[];
}

export interface ModuleStatusInfo {
  name: ModuleName;
  status: 'running' | 'stopped' | 'error';
  uptime: string;
  eventsProcessed: number;
  lastEvent: Date;
  version: string;
  cpu: number;
  memory: number;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  networkIn: number;
  networkOut: number;
  uptime: string;
  services: ServiceStatus[];
}

export interface ServiceStatus {
  name: string;
  status: 'running' | 'stopped' | 'degraded';
  port: number;
  pid: number;
}

export interface ThreatTrendPoint {
  time: string;
  critical: number;
  high: number;
  medium: number;
  low: number;
}
