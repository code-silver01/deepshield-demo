import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, Cpu, HardDrive, Wifi, Clock, AlertTriangle, CheckCircle2, TrendingUp, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { DASHBOARD_STATS } from '../../data/dashboardStats';
import { useThreats } from '../../contexts/ThreatContext';
import { staggerContainer, staggerItem, fadeInUp } from '../../animations/variants';
import { formatNumber } from '../../utils/formatters';

const PIE_COLORS = ['#ff1744', '#ff6d00', '#ffab00', '#00e676'];

export default function DashboardView() {
  const { events } = useThreats();
  const stats = DASHBOARD_STATS;

  const liveThreats = {
    critical: events.filter(e => e.severity === 'critical').length || stats.threatCounts.critical,
    high: events.filter(e => e.severity === 'high').length || stats.threatCounts.high,
    medium: events.filter(e => e.severity === 'medium').length || stats.threatCounts.medium,
    low: events.filter(e => e.severity === 'low').length || stats.threatCounts.low,
  };

  const pieData = [
    { name: 'Critical', value: liveThreats.critical },
    { name: 'High', value: liveThreats.high },
    { name: 'Medium', value: liveThreats.medium },
    { name: 'Low', value: liveThreats.low },
  ];

  return (
    <div className="space-y-6">
      {/* Section: Overview Cards */}
      <motion.div
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[
          { label: 'Total Threats', value: events.length || stats.totalThreats, icon: AlertTriangle, color: 'text-alert-red', bg: 'bg-alert-red/10' },
          { label: 'Active', value: events.filter(e => e.status === 'active').length || stats.activeThreats, icon: Activity, color: 'text-alert-orange', bg: 'bg-alert-orange/10' },
          { label: 'Detection Rate', value: `${stats.detectionRate}%`, icon: Shield, color: 'text-neon-green', bg: 'bg-neon-green/10' },
          { label: 'Avg Response', value: `${stats.avgResponseTime}s`, icon: Clock, color: 'text-cyber-blue', bg: 'bg-cyber-blue/10' },
        ].map(card => (
          <motion.div
            key={card.label}
            variants={staggerItem}
            className="glass rounded-xl p-5"
          >
            <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
            </div>
            <div className={`text-2xl font-bold font-terminal ${card.color}`}>
              {card.value}
            </div>
            <div className="text-xs text-gray-500 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Threat Distribution Pie */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="glass rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-200 mb-4 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            Threat Distribution
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  stroke="none"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i]} fillOpacity={0.8} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: '#141420',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontFamily: 'JetBrains Mono',
                    color: '#a1a1aa',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-4 mt-2">
            {pieData.map((d, i) => (
              <div key={d.name} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                <span className="text-[10px] text-gray-500">{d.name} ({d.value})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Threat Timeline */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="glass rounded-xl p-5 lg:col-span-2">
          <h3 className="text-sm font-medium text-gray-200 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-gray-400" />
            Threat Trend (24h)
          </h3>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.threatTrend}>
                <defs>
                  <linearGradient id="criticalGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff1744" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff1744" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="highGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff6d00" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ff6d00" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="medGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffab00" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#ffab00" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#52525b', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#52525b', fontFamily: 'JetBrains Mono' }} axisLine={false} tickLine={false} width={30} />
                <Tooltip
                  contentStyle={{
                    background: '#141420',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontFamily: 'JetBrains Mono',
                    color: '#a1a1aa',
                  }}
                />
                <Area type="monotone" dataKey="critical" stroke="#ff1744" fill="url(#criticalGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="high" stroke="#ff6d00" fill="url(#highGrad)" strokeWidth={1.5} />
                <Area type="monotone" dataKey="medium" stroke="#ffab00" fill="url(#medGrad)" strokeWidth={1} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Module Status & System Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Module Status */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="glass rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-200 mb-4">Module Status</h3>
          <div className="space-y-3">
            {stats.moduleStatus.map(mod => (
              <div key={mod.name} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02]">
                <div className={`w-2.5 h-2.5 rounded-full ${mod.status === 'running' ? 'bg-neon-green shadow-[0_0_8px_rgba(0,255,65,0.5)]' : 'bg-alert-red'}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-200">{mod.name}</span>
                    <span className="text-[10px] text-gray-600 font-terminal">v{mod.version}</span>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-gray-500 font-terminal">
                    <span>↑ {mod.uptime}</span>
                    <span>{formatNumber(mod.eventsProcessed)} events</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-gray-400 font-terminal">{mod.cpu}% CPU</div>
                  <div className="text-[10px] text-gray-600 font-terminal">{mod.memory}MB</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* System Metrics */}
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="glass rounded-xl p-5">
          <h3 className="text-sm font-medium text-gray-200 mb-4">System Metrics</h3>

          {/* Gauges */}
          <div className="grid grid-cols-3 gap-4 mb-5">
            {[
              { label: 'CPU', value: stats.systemMetrics.cpuUsage, icon: Cpu },
              { label: 'Memory', value: stats.systemMetrics.memoryUsage, icon: HardDrive },
              { label: 'Disk', value: stats.systemMetrics.diskUsage, icon: HardDrive },
            ].map(gauge => (
              <div key={gauge.label} className="text-center">
                <div className="relative w-16 h-16 mx-auto mb-2">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="4" />
                    <motion.circle
                      cx="32" cy="32" r="28" fill="none"
                      stroke={gauge.value > 80 ? '#ff1744' : gauge.value > 60 ? '#ffab00' : '#00ff41'}
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 28}`}
                      initial={{ strokeDashoffset: 2 * Math.PI * 28 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 28 * (1 - gauge.value / 100) }}
                      transition={{ duration: 1.5, ease: 'easeOut' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-terminal text-gray-200">{gauge.value}%</span>
                  </div>
                </div>
                <span className="text-[10px] text-gray-500">{gauge.label}</span>
              </div>
            ))}
          </div>

          {/* Services */}
          <div className="border-t border-white/[0.06] pt-4">
            <div className="flex items-center gap-2 mb-3">
              <Wifi className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-400">Services</span>
              <span className="text-[10px] text-gray-600 font-terminal ml-auto">Uptime: {stats.systemMetrics.uptime}</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {stats.systemMetrics.services.map(svc => (
                <div key={svc.name} className="flex items-center gap-2 px-2 py-1.5 rounded bg-white/[0.02]">
                  <div className={`w-1.5 h-1.5 rounded-full ${svc.status === 'running' ? 'bg-neon-green' : 'bg-alert-red'}`} />
                  <span className="text-[10px] text-gray-400 font-terminal truncate">{svc.name}</span>
                  <span className="text-[10px] text-gray-600 font-terminal ml-auto">:{svc.port}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Top Attack Types */}
      <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="glass rounded-xl p-5">
        <h3 className="text-sm font-medium text-gray-200 mb-4">Top Attack Types</h3>
        <div className="space-y-2.5">
          {stats.topAttackTypes.map((type, i) => (
            <div key={type.name} className="flex items-center gap-3">
              <span className="text-[10px] text-gray-600 font-terminal w-4">{i + 1}</span>
              <span className="text-xs text-gray-300 w-40 truncate">{type.name}</span>
              <div className="flex-1 h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyber-blue to-neon-green"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(type.count / stats.topAttackTypes[0].count) * 100}%` }}
                  transition={{ duration: 1, delay: i * 0.1 }}
                />
              </div>
              <span className="text-xs text-gray-500 font-terminal w-8 text-right">{type.count}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
