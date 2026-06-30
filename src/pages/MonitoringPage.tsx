import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, LayoutDashboard, Terminal as TerminalIcon, AlertTriangle, Search, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, Eye, Zap, X, Target } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useThreats } from '../contexts/ThreatContext';
import { formatTimestamp, relativeTime, getSeverityBg, getPriorityColor } from '../utils/formatters';
import ThreatDrawer from '../components/ThreatDetail/ThreatDrawer';
import DashboardView from '../components/Dashboard/DashboardView';
import InvestigationCenter from '../components/Investigation/InvestigationCenter';
import { fadeInUp, staggerContainer, staggerItem, toastVariants } from '../animations/variants';
import type { SecurityEvent } from '../types';

type ViewMode = 'threats' | 'dashboard' | 'investigation';

export default function MonitoringPage() {
  const { soundEnabled, setSoundEnabled, sidebarCollapsed, setSidebarCollapsed } = useApp();
  const {
    events, paginatedEvents, filteredEvents, totalPages, currentPage,
    searchQuery, filterSeverity, filterTool, filterStatus,
    sortField, sortDirection,
    setSearchQuery, setFilterSeverity, setFilterTool, setFilterStatus,
    setSortField, toggleSortDirection, setCurrentPage,
    openDrawer, isDrawerOpen, selectedEvent, closeDrawer,
    startGenerating, isGenerating,
  } = useThreats();

  const [viewMode, setViewMode] = useState<ViewMode>('threats');
  const [toasts, setToasts] = useState<{ id: string; event: SecurityEvent }[]>([]);

  // Start generating threats
  useEffect(() => {
    if (!isGenerating) {
      startGenerating();
    }
  }, []);

  // Toast notifications for new critical/high events
  useEffect(() => {
    if (events.length === 0) return;
    const latest = events[0];
    if (latest && (latest.severity === 'critical' || latest.severity === 'high') && latest.count === 1) {
      const toastId = latest.id;
      setToasts(prev => [...prev.slice(-3), { id: toastId, event: latest }]);
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== toastId));
      }, 5000);
    }
  }, [events.length]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      toggleSortDirection();
    } else {
      setSortField(field);
    }
  };

  const SortIcon = ({ field }: { field: string }) => {
    if (sortField !== field) return null;
    return sortDirection === 'desc'
      ? <ChevronDown className="w-3 h-3 inline ml-1" />
      : <ChevronUp className="w-3 h-3 inline ml-1" />;
  };

  return (
    <div className="min-h-screen bg-bg-primary flex">
      {/* Sidebar */}
      <motion.aside
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className={`${sidebarCollapsed ? 'w-16' : 'w-56'} border-r border-white/[0.06] bg-bg-secondary flex-shrink-0 flex flex-col transition-all duration-300 hidden md:flex`}
      >
        {/* Logo */}
        <div className={`p-4 border-b border-white/[0.06] ${sidebarCollapsed ? 'px-3' : ''}`}>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-neon-green flex-shrink-0" />
            {!sidebarCollapsed && (
              <span className="font-terminal text-sm text-neon-green font-semibold tracking-wide">DEEPSHIELD</span>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-1">
          {[
            { id: 'threats' as ViewMode, icon: AlertTriangle, label: 'Threats' },
            { id: 'investigation' as ViewMode, icon: Target, label: 'Investigation' },
            { id: 'dashboard' as ViewMode, icon: LayoutDashboard, label: 'Dashboard' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setViewMode(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                viewMode === item.id
                  ? 'bg-neon-green/10 text-neon-green'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-white/[0.04]'
              }`}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!sidebarCollapsed && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-white/[0.06]">
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            <span>{soundEnabled ? '🔊' : '🔇'}</span>
            {!sidebarCollapsed && <span>Sound {soundEnabled ? 'On' : 'Off'}</span>}
          </button>
          <button
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-gray-500 hover:text-gray-300 transition-colors mt-1"
          >
            {sidebarCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
            {!sidebarCollapsed && <span>Collapse</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 border-b border-white/[0.06] bg-bg-secondary flex items-center justify-between px-4 md:px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="md:hidden flex items-center gap-2">
              <Shield className="w-5 h-5 text-neon-green" />
              <span className="font-terminal text-xs text-neon-green">DEEPSHIELD</span>
            </div>

            {/* Mobile nav */}
            <div className="flex md:hidden gap-1">
              <button
                onClick={() => setViewMode('threats')}
                className={`px-3 py-1.5 rounded text-xs ${viewMode === 'threats' ? 'bg-neon-green/10 text-neon-green' : 'text-gray-400'}`}
              >
                Threats
              </button>
              <button
                onClick={() => setViewMode('investigation')}
                className={`px-3 py-1.5 rounded text-xs ${viewMode === 'investigation' ? 'bg-neon-green/10 text-neon-green' : 'text-gray-400'}`}
              >
                Investigate
              </button>
              <button
                onClick={() => setViewMode('dashboard')}
                className={`px-3 py-1.5 rounded text-xs ${viewMode === 'dashboard' ? 'bg-neon-green/10 text-neon-green' : 'text-gray-400'}`}
              >
                Dashboard
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-neon-green shadow-[0_0_8px_rgba(0,255,65,0.5)] animate-pulse" />
              <span className="text-xs text-gray-400 font-terminal hidden sm:inline">MONITORING</span>
            </div>
            <div className="text-xs text-gray-600 font-terminal hidden sm:block">
              {events.length} events
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <AnimatePresence mode="wait">
            {viewMode === 'threats' && (
              <motion.div
                key="threats"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-3 mb-5">
                  {/* Search */}
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search threats..."
                      className="w-full bg-bg-secondary border border-white/[0.06] rounded-lg pl-9 pr-4 py-2 text-sm text-gray-200 placeholder-gray-600 font-terminal focus:border-neon-green/30 transition-colors"
                    />
                  </div>

                  {/* Filter dropdowns */}
                  <div className="flex gap-2">
                    <select
                      value={filterSeverity}
                      onChange={e => setFilterSeverity(e.target.value)}
                      className="bg-bg-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-gray-300 font-terminal appearance-none cursor-pointer"
                    >
                      <option value="all">All Severity</option>
                      <option value="critical">Critical</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>

                    <select
                      value={filterTool}
                      onChange={e => setFilterTool(e.target.value)}
                      className="bg-bg-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-gray-300 font-terminal appearance-none cursor-pointer"
                    >
                      <option value="all">All Tools</option>
                      <option value="Falco">Falco</option>
                      <option value="Suricata">Suricata</option>
                      <option value="Wazuh">Wazuh</option>
                      <option value="Zeek">Zeek</option>
                    </select>

                    <select
                      value={filterStatus}
                      onChange={e => setFilterStatus(e.target.value)}
                      className="bg-bg-secondary border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-gray-300 font-terminal appearance-none cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="active">Active</option>
                      <option value="investigating">Investigating</option>
                      <option value="mitigated">Mitigated</option>
                      <option value="resolved">Resolved</option>
                    </select>
                  </div>
                </div>

                {/* Summary cards */}
                <motion.div
                  variants={staggerContainer}
                  initial="hidden"
                  animate="visible"
                  className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5"
                >
                  {[
                    { label: 'Critical', count: events.filter(e => e.severity === 'critical').length, color: 'text-alert-red', bg: 'bg-alert-red/10', dot: 'critical' },
                    { label: 'High', count: events.filter(e => e.severity === 'high').length, color: 'text-alert-orange', bg: 'bg-alert-orange/10', dot: 'high' },
                    { label: 'Medium', count: events.filter(e => e.severity === 'medium').length, color: 'text-alert-yellow', bg: 'bg-alert-yellow/10', dot: 'medium' },
                    { label: 'Low', count: events.filter(e => e.severity === 'low').length, color: 'text-success-green', bg: 'bg-success-green/10', dot: 'low' },
                  ].map(card => (
                    <motion.div
                      key={card.label}
                      variants={staggerItem}
                      className={`glass rounded-xl p-4 ${card.bg}`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`severity-dot ${card.dot}`} />
                        <span className="text-xs text-gray-400">{card.label}</span>
                      </div>
                      <motion.div
                        key={card.count}
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className={`text-2xl font-bold font-terminal ${card.color}`}
                      >
                        {card.count}
                      </motion.div>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Threat table */}
                <div className="rounded-xl border border-white/[0.06] bg-bg-secondary overflow-hidden">
                  {/* Table header */}
                  <div className="grid grid-cols-[40px_80px_1fr_100px_90px_70px_60px] gap-2 px-4 py-3 text-xs text-gray-500 font-terminal border-b border-white/[0.06] bg-bg-tertiary/50 hidden md:grid">
                    <div />
                    <button onClick={() => handleSort('priority')} className="text-left hover:text-gray-300 transition-colors">
                      Priority <SortIcon field="priority" />
                    </button>
                    <button onClick={() => handleSort('title')} className="text-left hover:text-gray-300 transition-colors">
                      Description <SortIcon field="title" />
                    </button>
                    <div>Tool</div>
                    <button onClick={() => handleSort('timestamp')} className="text-left hover:text-gray-300 transition-colors">
                      Time <SortIcon field="timestamp" />
                    </button>
                    <div>Status</div>
                    <button onClick={() => handleSort('count')} className="text-left hover:text-gray-300 transition-colors">
                      Count <SortIcon field="count" />
                    </button>
                  </div>

                  {/* Rows */}
                  <div className="divide-y divide-white/[0.04]">
                    <AnimatePresence>
                      {paginatedEvents.map((event) => (
                        <motion.div
                          key={event.id}
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0 }}
                          onClick={() => openDrawer(event)}
                          className="grid grid-cols-1 md:grid-cols-[40px_80px_1fr_100px_90px_70px_60px] gap-2 px-4 py-3 hover:bg-white/[0.02] cursor-pointer transition-colors group"
                        >
                          {/* Severity dot */}
                          <div className="hidden md:flex items-center">
                            <div className={`severity-dot ${event.severity}`} />
                          </div>

                          {/* Priority */}
                          <div className="hidden md:flex items-center">
                            <span className="text-xs font-terminal" style={{ color: getPriorityColor(event.priority) }}>
                              P{event.priority}
                            </span>
                          </div>

                          {/* Description */}
                          <div className="min-w-0">
                            <div className="flex items-center gap-2 md:gap-0">
                              <div className={`severity-dot ${event.severity} md:hidden`} />
                              <span className="text-sm text-gray-200 truncate group-hover:text-neon-green transition-colors">
                                {event.title}
                              </span>
                            </div>
                            <p className="text-xs text-gray-600 truncate mt-0.5 hidden md:block">{event.description.slice(0, 80)}...</p>
                          </div>

                          {/* Tool */}
                          <div className="hidden md:flex items-center">
                            <span className="text-xs font-terminal text-gray-400 bg-white/[0.04] px-2 py-0.5 rounded">{event.tool}</span>
                          </div>

                          {/* Time */}
                          <div className="hidden md:flex items-center">
                            <span className="text-xs text-gray-500 font-terminal">{relativeTime(event.timestamp)}</span>
                          </div>

                          {/* Status */}
                          <div className="hidden md:flex items-center">
                            <span className={`text-[10px] font-terminal px-1.5 py-0.5 rounded border ${getSeverityBg(event.severity)}`}>
                              {event.status}
                            </span>
                          </div>

                          {/* Count */}
                          <div className="hidden md:flex items-center">
                            {event.count > 1 && (
                              <motion.span
                                key={event.count}
                                initial={{ scale: 1.4 }}
                                animate={{ scale: 1 }}
                                className="text-xs font-terminal text-cyber-blue bg-cyber-blue/10 px-2 py-0.5 rounded-full"
                              >
                                ×{event.count}
                              </motion.span>
                            )}
                          </div>

                          {/* Mobile extra info */}
                          <div className="flex md:hidden items-center gap-3 text-xs text-gray-500">
                            <span className="font-terminal" style={{ color: getPriorityColor(event.priority) }}>P{event.priority}</span>
                            <span>{event.tool}</span>
                            <span>{relativeTime(event.timestamp)}</span>
                            {event.count > 1 && <span className="text-cyber-blue">×{event.count}</span>}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>

                  {paginatedEvents.length === 0 && (
                    <div className="py-12 text-center text-gray-600 text-sm">
                      No threats match your filters
                    </div>
                  )}

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/[0.06]">
                      <span className="text-xs text-gray-600 font-terminal">
                        {filteredEvents.length} total events • Page {currentPage}/{totalPages}
                      </span>
                      <div className="flex gap-1">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="p-1.5 rounded hover:bg-white/[0.04] disabled:opacity-30 transition-colors"
                        >
                          <ChevronLeft className="w-4 h-4 text-gray-400" />
                        </button>
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          const page = currentPage <= 3 ? i + 1 : currentPage - 2 + i;
                          if (page > totalPages) return null;
                          return (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`w-8 h-8 rounded text-xs font-terminal transition-colors ${
                                page === currentPage
                                  ? 'bg-neon-green/10 text-neon-green'
                                  : 'text-gray-500 hover:bg-white/[0.04]'
                              }`}
                            >
                              {page}
                            </button>
                          );
                        })}
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="p-1.5 rounded hover:bg-white/[0.04] disabled:opacity-30 transition-colors"
                        >
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
            
            {viewMode === 'investigation' && (
              <motion.div
                key="investigation"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <InvestigationCenter />
              </motion.div>
            )}

            {viewMode === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <DashboardView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Threat Drawer */}
      <ThreatDrawer />

      {/* Toast notifications */}
      <div className="fixed top-16 right-4 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {toasts.map(toast => (
            <motion.div
              key={toast.id}
              variants={toastVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="glass rounded-lg p-3 border-l-2 cursor-pointer"
              style={{ borderLeftColor: getPriorityColor(toast.event.priority) }}
              onClick={() => {
                openDrawer(toast.event);
                setToasts(prev => prev.filter(t => t.id !== toast.id));
              }}
            >
              <div className="flex items-start gap-2">
                <div className={`severity-dot ${toast.event.severity} mt-1`} />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-gray-200 truncate">{toast.event.title}</p>
                  <p className="text-[10px] text-gray-500 mt-0.5">{toast.event.tool} • {formatTimestamp(toast.event.timestamp)}</p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setToasts(prev => prev.filter(t => t.id !== toast.id));
                  }}
                  className="text-gray-600 hover:text-gray-400"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
