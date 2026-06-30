import React, { createContext, useContext, useState, useCallback, useRef, useEffect, type ReactNode } from 'react';
import type { SecurityEvent } from '../types';
import { generateEvent, INITIAL_EVENTS } from '../data/securityEvents';
import { CONFIG } from '../constants/config';

interface ThreatContextType {
  events: SecurityEvent[];
  selectedEvent: SecurityEvent | null;
  isDrawerOpen: boolean;
  isGenerating: boolean;
  searchQuery: string;
  filterSeverity: string;
  filterTool: string;
  filterStatus: string;
  sortField: string;
  sortDirection: 'asc' | 'desc';
  currentPage: number;
  addEvent: (event: SecurityEvent) => void;
  selectEvent: (event: SecurityEvent | null) => void;
  openDrawer: (event: SecurityEvent) => void;
  closeDrawer: () => void;
  startGenerating: () => void;
  stopGenerating: () => void;
  setSearchQuery: (q: string) => void;
  setFilterSeverity: (s: string) => void;
  setFilterTool: (t: string) => void;
  setFilterStatus: (s: string) => void;
  setSortField: (f: string) => void;
  toggleSortDirection: () => void;
  setCurrentPage: (p: number) => void;
  filteredEvents: SecurityEvent[];
  paginatedEvents: SecurityEvent[];
  totalPages: number;
  updateEventStatus: (id: string, status: SecurityEvent['status']) => void;
}

const ThreatContext = createContext<ThreatContextType | undefined>(undefined);

export function ThreatProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState('all');
  const [filterTool, setFilterTool] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState('timestamp');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const addEvent = useCallback((event: SecurityEvent) => {
    setEvents(prev => {
      // Check for duplicate by title
      const existingIdx = prev.findIndex(e => e.title === event.title);
      if (existingIdx !== -1 && Math.random() < CONFIG.threats.duplicateChance) {
        // Increment count instead of adding new
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          count: updated[existingIdx].count + 1,
          timestamp: new Date(),
        };
        return updated;
      }
      // Add new event, keep max
      const newEvents = [{ ...event, timestamp: new Date() }, ...prev];
      return newEvents.slice(0, CONFIG.threats.maxVisible);
    });
  }, []);

  const selectEvent = useCallback((event: SecurityEvent | null) => {
    setSelectedEvent(event);
  }, []);

  const openDrawer = useCallback((event: SecurityEvent) => {
    setSelectedEvent(event);
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
    setTimeout(() => setSelectedEvent(null), 300);
  }, []);

  const startGenerating = useCallback(() => {
    setIsGenerating(true);
    // Load initial events
    setEvents(INITIAL_EVENTS.map(e => ({ ...e, timestamp: new Date(Date.now() - Math.random() * 3600000) })));
  }, []);

  const stopGenerating = useCallback(() => {
    setIsGenerating(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const toggleSortDirection = useCallback(() => {
    setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
  }, []);

  const updateEventStatus = useCallback((id: string, status: SecurityEvent['status']) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, status } : e));
  }, []);

  // Auto-generate threats
  useEffect(() => {
    if (!isGenerating) return;

    const generateThreat = () => {
      const newEvent = generateEvent();
      addEvent(newEvent);
    };

    // Generate first one quickly
    const firstTimeout = setTimeout(generateThreat, 2000);

    intervalRef.current = setInterval(() => {
      generateThreat();
    }, CONFIG.delays.threatInterval + Math.random() * CONFIG.delays.threatIntervalVariance);

    return () => {
      clearTimeout(firstTimeout);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isGenerating, addEvent]);

  // Filter & sort
  const filteredEvents = events.filter(e => {
    if (searchQuery && !e.title.toLowerCase().includes(searchQuery.toLowerCase()) && !e.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterSeverity !== 'all' && e.severity !== filterSeverity) return false;
    if (filterTool !== 'all' && e.tool !== filterTool) return false;
    if (filterStatus !== 'all' && e.status !== filterStatus) return false;
    return true;
  }).sort((a, b) => {
    let cmp = 0;
    switch (sortField) {
      case 'timestamp': cmp = a.timestamp.getTime() - b.timestamp.getTime(); break;
      case 'priority': cmp = a.priority - b.priority; break;
      case 'severity': {
        const order = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
        cmp = order[a.severity] - order[b.severity]; break;
      }
      case 'count': cmp = a.count - b.count; break;
      case 'title': cmp = a.title.localeCompare(b.title); break;
      default: cmp = 0;
    }
    return sortDirection === 'desc' ? -cmp : cmp;
  });

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / CONFIG.threats.pageSize));
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * CONFIG.threats.pageSize,
    currentPage * CONFIG.threats.pageSize
  );

  return (
    <ThreatContext.Provider
      value={{
        events,
        selectedEvent,
        isDrawerOpen,
        isGenerating,
        searchQuery,
        filterSeverity,
        filterTool,
        filterStatus,
        sortField,
        sortDirection,
        currentPage,
        addEvent,
        selectEvent,
        openDrawer,
        closeDrawer,
        startGenerating,
        stopGenerating,
        setSearchQuery,
        setFilterSeverity,
        setFilterTool,
        setFilterStatus,
        setSortField,
        toggleSortDirection,
        setCurrentPage,
        filteredEvents,
        paginatedEvents,
        totalPages,
        updateEventStatus,
      }}
    >
      {children}
    </ThreatContext.Provider>
  );
}

export function useThreats(): ThreatContextType {
  const context = useContext(ThreatContext);
  if (!context) throw new Error('useThreats must be used within ThreatProvider');
  return context;
}
