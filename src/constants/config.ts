// ─── App Configuration ─────────────────────────────────────────────────────

export const CONFIG = {
  // Typing animation speeds (ms per character)
  typingSpeed: {
    fast: 15,
    normal: 30,
    slow: 50,
    command: 40,
  },
  
  // Delays
  delays: {
    bootLine: 400,
    moduleDeployStep: 800,
    progressTick: 50,
    threatInterval: 4000,
    threatIntervalVariance: 3000,
    aiAnalysisStep: 1200,
    pageTransition: 300,
  },
  
  // Terminal
  terminal: {
    maxLines: 500,
    maxHistory: 50,
    promptPrefix: '$ ',
    blinkRate: 530,
  },
  
  // Threat generation
  threats: {
    maxVisible: 100,
    duplicateChance: 0.3,
    pageSize: 15,
  },
  
  // Progress bar
  progressBar: {
    width: 30,
    filledChar: '█',
    emptyChar: '░',
  },
} as const;

export const ASCII_LOGO = `██████╗ ███████╗███████╗██████╗ ███████╗██╗  ██╗██║███████╗██╗     ██████╗ 
██╔══██╗██╔════╝██╔════╝██╔══██╗██╔════╝██║  ██║██║██╔════╝██║     ██╔══██╗
██║  ██║█████╗  █████╗  ██████╔╝███████╗███████║██║█████╗  ██║     ██║  ██║
██║  ██║██╔══╝  ██╔══╝  ██╔═══╝ ╚════██║██╔══██║██║██╔══╝  ██║     ██║  ██║
██████╔╝███████╗███████╗██║     ███████║██║  ██║██║███████╗███████╗██████╔╝
╚═════╝ ╚══════╝╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝╚═╝╚══════╝╚══════╝╚═════╝`;

export const BOOT_SEQUENCE = [
  { text: 'Initializing DeepShield v3.0.0...', delay: 600 },
  { text: 'Loading kernel modules...', delay: 400 },
  { text: 'Mounting secure filesystem...', delay: 350 },
  { text: 'Starting threat engine...', delay: 500 },
  { text: 'Connecting to event bus...', delay: 300 },
  { text: 'Loading detection signatures...', delay: 450 },
  { text: 'Checking environment... OK', delay: 400 },
  { text: 'System ready.', delay: 200 },
];

export const MODULE_DESCRIPTIONS: Record<string, string> = {
  Falco: 'Runtime security monitoring for containers and Kubernetes',
  Suricata: 'High-performance network IDS, IPS, and security monitoring',
  Wazuh: 'Security monitoring, compliance, and incident response',
  Zeek: 'Network analysis framework for traffic inspection',
  'Project Analysis': 'Analyze project structure and generate security profile',
  'Rule Generation': 'AI-powered custom detection rule generation',
};

export const MODULE_VERSIONS: Record<string, string> = {
  Falco: '0.37.1',
  Suricata: '7.0.3',
  Wazuh: '4.7.2',
  Zeek: '6.1.0',
  'Project Analysis': '1.2.0',
  'Rule Generation': '1.5.0',
};
