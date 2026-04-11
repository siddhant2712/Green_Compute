import React, { useState, useEffect } from 'react';
import { Shield, CloudRain, Bell, Settings as SettingsIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import DashboardView from './components/dashboard/DashboardView';
import ComputeView from './components/tabs/ComputeView';
import PlaceholderView from './components/tabs/PlaceholderView';
import ReportsView from './components/tabs/ReportsView';
import { getCarbonStatus, getTasks } from './api';
import type { CarbonStatus, TaskResponse } from './api';

const tabs = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'compute', label: 'Compute' },
  { id: 'reports', label: 'Reports' },
  { id: 'settings', label: 'Settings' }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [carbonStatus, setCarbonStatus] = useState<CarbonStatus | null>(null);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);

  const fetchStatus = async () => {
    try {
      const status = await getCarbonStatus();
      setCarbonStatus(status);
    } catch (err) {
      console.error("Failed to fetch carbon status", err);
    }
  };

  const loadTasks = async () => {
    try {
      const existing = await getTasks();
      setTasks(existing);
    } catch (err) {
      console.error("Failed to load tasks", err);
    }
  };

  useEffect(() => {
    fetchStatus();
    loadTasks();
    const interval = setInterval(() => {
      fetchStatus();
      loadTasks();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTaskSubmitted = (task: TaskResponse) => {
    setTasks([task, ...tasks]);
  };

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView status={carbonStatus} tasks={tasks} />;
      case 'compute':
        return <ComputeView tasks={tasks} onTaskSubmitted={handleTaskSubmitted} />;
      case 'reports':
        return <ReportsView tasks={tasks} />;
      case 'schedule':
        return <PlaceholderView title="Carbon Scheduler" description="Plan your AI workloads for the week's cleanest windows." icon="clock" />;
      case 'settings':
        return <PlaceholderView title="Compute Engine Settings" description="Configure API endpoints, regional nodes, and carbon thresholds." icon="settings" />;
      default:
        return <DashboardView status={carbonStatus} tasks={tasks} />;
    }
  };

  return (
    <div className="min-h-screen bg-black text-[#f5f5f7] selection:bg-green-500/30 font-sans">
      {/* Dynamic Background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-black">
        <div className="absolute top-[-10%] left-[10%] w-[50%] h-[50%] bg-[#22c55e]/5 blur-[120px] rounded-full animate-glow"></div>
        <div className="absolute bottom-[-5%] right-[-5%] w-[30%] h-[30%] bg-blue-500/5 blur-[100px] rounded-full"></div>
      </div>

      {/* High-Fidelity Pro Header */}
      <header className="fixed top-0 w-full bg-black/40 backdrop-blur-3xl border-b border-white/5 z-50 transition-all duration-500">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2 group cursor-default">
              <div className="bg-green-500 p-1 rounded-sm">
                <CloudRain size={16} className="text-black" />
              </div>
              <h1 className="font-bold tracking-tight text-sm text-white uppercase flex items-center gap-1">
                <span className="text-green-500">GREEN</span>
                <span className="opacity-60">-COMPUTE</span>
              </h1>
            </div>
            
            <nav className="hidden md:flex items-center">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-5 h-16 text-[11px] font-semibold tracking-widest uppercase transition-all relative group ${activeTab === tab.id ? 'text-white' : 'text-slate-500 hover:text-slate-200'}`}
                >
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTab" 
                      className="absolute bottom-0 left-0 right-0 h-[2px] bg-green-500" 
                    />
                  )}
                  {activeTab === tab.id && (
                    <div className="absolute inset-0 bg-white/[0.03] -z-10" />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-6 text-slate-400">
              <button className="hover:text-white transition-colors"><Bell size={18} /></button>
              <button className="hover:text-white transition-colors"><SettingsIcon size={18} /></button>
            </div>
            <div className="h-6 w-px bg-white/10"></div>
            <div className="flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all cursor-default group">
              <Shield size={14} className="text-green-500 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-bold font-mono tracking-tighter text-slate-300">SYSTEM READY</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-[1400px] mx-auto px-6 pt-24 pb-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {renderActiveView()}
          </motion.div>
        </AnimatePresence>
      </main>

      <footer className="border-t border-white/5 py-8 mt-auto">
        <div className="max-w-[1400px] mx-auto px-6 flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.2em]">
          <span>© 2026 GREEN-COMPUTE INFRASTRUCTURE</span>
          <div className="flex gap-8">
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Documentation</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Node Status</span>
            <span className="text-green-500/60 transition-colors">Verified ESG Pipeline</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
