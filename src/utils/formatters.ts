import type { Severity, Priority } from '../types';
import { COLORS, SEVERITY_COLORS } from '../constants/colors';

export function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatFullTimestamp(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

export function relativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getSeverityColor(severity: Severity): string {
  return SEVERITY_COLORS[severity] || COLORS.gray400;
}

export function getPriorityLabel(priority: Priority): string {
  const labels: Record<Priority, string> = {
    1: 'P1 — Critical',
    2: 'P2 — High',
    3: 'P3 — Medium',
    4: 'P4 — Low',
    5: 'P5 — Info',
  };
  return labels[priority];
}

export function getPriorityColor(priority: Priority): string {
  const colors: Record<Priority, string> = {
    1: COLORS.critical,
    2: COLORS.high,
    3: COLORS.medium,
    4: COLORS.low,
    5: COLORS.info,
  };
  return colors[priority];
}

export function getSeverityBg(severity: Severity): string {
  const bgs: Record<Severity, string> = {
    critical: 'bg-red-500/10 text-red-400 border-red-500/20',
    high: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    low: 'bg-green-500/10 text-green-400 border-green-500/20',
    info: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  };
  return bgs[severity];
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1073741824) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${(bytes / 1073741824).toFixed(2)} GB`;
}

export function formatNumber(n: number): string {
  return n.toLocaleString('en-US');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
