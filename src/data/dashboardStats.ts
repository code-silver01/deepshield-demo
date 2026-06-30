import type { DashboardStats, ThreatTrendPoint } from '../types';

function generateThreatTrend(): ThreatTrendPoint[] {
  const points: ThreatTrendPoint[] = [];
  const now = new Date();
  for (let i = 23; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 3600000);
    points.push({
      time: `${time.getHours().toString().padStart(2, '0')}:00`,
      critical: Math.floor(Math.random() * 5) + (i < 6 ? 2 : 0),
      high: Math.floor(Math.random() * 10) + 3,
      medium: Math.floor(Math.random() * 15) + 5,
      low: Math.floor(Math.random() * 8) + 2,
    });
  }
  return points;
}

export const DASHBOARD_STATS: DashboardStats = {
  threatCounts: {
    critical: 12,
    high: 34,
    medium: 67,
    low: 23,
    info: 45,
  },
  totalThreats: 181,
  activeThreats: 47,
  resolvedThreats: 134,
  detectionRate: 97.3,
  avgResponseTime: 2.4,
  moduleStatus: [
    {
      name: 'Falco',
      status: 'running',
      uptime: '14d 7h 23m',
      eventsProcessed: 1247893,
      lastEvent: new Date(Date.now() - 15000),
      version: '0.37.1',
      cpu: 12.4,
      memory: 256,
    },
    {
      name: 'Suricata',
      status: 'running',
      uptime: '14d 7h 23m',
      eventsProcessed: 8934521,
      lastEvent: new Date(Date.now() - 3000),
      version: '7.0.3',
      cpu: 34.7,
      memory: 512,
    },
    {
      name: 'Wazuh',
      status: 'running',
      uptime: '14d 7h 22m',
      eventsProcessed: 562341,
      lastEvent: new Date(Date.now() - 45000),
      version: '4.7.2',
      cpu: 8.2,
      memory: 384,
    },
    {
      name: 'Zeek',
      status: 'running',
      uptime: '14d 7h 23m',
      eventsProcessed: 4521789,
      lastEvent: new Date(Date.now() - 8000),
      version: '6.1.0',
      cpu: 28.1,
      memory: 448,
    },
  ],
  systemMetrics: {
    cpuUsage: 42.3,
    memoryUsage: 67.8,
    diskUsage: 34.2,
    networkIn: 124.5,
    networkOut: 89.3,
    uptime: '14d 7h 23m',
    services: [
      { name: 'deepshield-engine', status: 'running', port: 8080, pid: 1234 },
      { name: 'event-bus', status: 'running', port: 9092, pid: 1235 },
      { name: 'rule-engine', status: 'running', port: 8081, pid: 1236 },
      { name: 'ai-analyzer', status: 'running', port: 8082, pid: 1237 },
      { name: 'alert-manager', status: 'running', port: 9093, pid: 1238 },
      { name: 'log-collector', status: 'running', port: 5044, pid: 1239 },
      { name: 'metrics-server', status: 'running', port: 9090, pid: 1240 },
      { name: 'dashboard-api', status: 'running', port: 3001, pid: 1241 },
    ],
  },
  threatTrend: generateThreatTrend(),
  topAttackTypes: [
    { name: 'Shell Spawn', count: 34 },
    { name: 'Network Scan', count: 28 },
    { name: 'Privilege Escalation', count: 21 },
    { name: 'Data Exfiltration', count: 18 },
    { name: 'Container Escape', count: 15 },
    { name: 'Crypto Mining', count: 12 },
    { name: 'Credential Access', count: 9 },
    { name: 'DNS Tunneling', count: 7 },
  ],
};
