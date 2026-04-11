import React, { useState, useEffect } from 'react';
import { Shield, BarChart3, CloudRain } from 'lucide-react';
import { motion } from 'framer-motion';
import CarbonWidget from './components/CarbonWidget';
import TaskBoard from './components/TaskBoard';
import { getCarbonStatus, getTasks } from './api';
import type { CarbonStatus, TaskResponse } from './api';

const App: React.FC = () => {
  const [carbonStatus, setCarbonStatus] = useState<CarbonStatus | null>(null);
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [activeTab, setActiveTab] = useState('dashboard');

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
    loadTasks();  // Restore tasks from DB on mount
    const interval = setInterval(fetchStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTaskSubmitted = (task: TaskResponse) => {
    setTasks([task, ...tasks]);
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-green-500/30 font-sans">
      {/* Subtle glowing ambient background */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10 bg-black">
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-blue-600/5 blur-[180px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-green-500/5 blur-[150px] rounded-full"></div>
      </div>

      <header className="fixed top-0 w-full bg-black/60 backdrop-blur-xl border-b border-white/5 z-50 transition-all duration-500">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-default">
            <CloudRain size={20} className="text-slate-200 group-hover:text-green-400 transition-colors duration-500" />
            <h1 className="font-semibold tracking-tight text-sm text-slate-200">Green-Compute</h1>
          </div>
          
          <nav className="flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`text-xs font-medium tracking-wide transition-colors duration-300 ${activeTab === 'dashboard' ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Overview
            </button>
            <button className="text-xs font-medium tracking-wide text-slate-500 hover:text-slate-300 transition-colors duration-300">
              Architecture
            </button>
            <div className="h-4 w-px bg-white/10 mx-2"></div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-white/5 px-3 py-1 rounded-full border border-white/5">
              <Shield size={12} className="text-green-500" />
              <span>v1.0.4-PRO</span>
            </div>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-32 pb-24">
        {/* Apple-style Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.25, 0.1, 0.25, 1] }}
          className="text-center mb-20"
        >
          <h2 className="text-6xl md:text-8xl font-bold tracking-tighter mb-6 bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent pb-2">
            Intelligence, <br />naturally.
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium tracking-tight">
            The world's most advanced carbon-aware orchestration engine.
          </p>
        </motion.div>

        {/* 12-Column Layout Grid */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Row 1: Status (60%) & Impact (40%) */}
          <div className="col-span-12 lg:col-span-7 transition hover:scale-[1.01] duration-500">
            <CarbonWidget status={carbonStatus} mode="status" />
          </div>

          <div className="col-span-12 lg:col-span-5 transition hover:scale-[1.01] duration-500">
            <div className="glass p-10 rounded-3xl relative h-full overflow-hidden group">
              <div className="absolute top-[-20px] right-[-20px] p-4 opacity-[0.03] group-hover:scale-105 group-hover:opacity-[0.06] transition-all duration-[1s] ease-in-out">
                <BarChart3 size={200} />
              </div>
              <h3 className="text-sm font-semibold tracking-wide text-slate-400 mb-8 uppercase">
                🌱 Carbon Impact
              </h3>
              
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-sm font-medium text-slate-400">Total Offset</span>
                    <span className="text-4xl font-bold tracking-tight text-white mb-1">142.8 <span className="text-lg text-slate-500 font-medium font-sans">g</span></span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-medium text-slate-400">Efficiency Shift</span>
                    <span className="text-xl font-bold text-green-400">+32%</span>
                  </div>
                </div>

                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-slate-600 via-slate-400 to-white h-full w-[65%]" />
                </div>
                
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md">
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-3 font-semibold">Real World Equivalent</p>
                  <p className="text-base text-slate-200 flex items-center gap-3 font-medium">
                    <span className="text-2xl opacity-80">💡</span> 34 hours of clean LED usage
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Row 2: Task Submission (Full Width) */}
          <div className="col-span-12 transition hover:scale-[1.01] duration-500">
            <TaskBoard 
              tasks={tasks} 
              onTaskSubmitted={handleTaskSubmitted} 
              mode="submission" 
            />
          </div>

          {/* Row 3: Forecast Header & Graph (Full Width) */}
          <div className="col-span-12 transition hover:scale-[1.01] duration-500">
            <CarbonWidget status={carbonStatus} mode="graph" />
          </div>

          {/* Row 4: Task Queue Table (Full Width) */}
          <div className="col-span-12 transition hover:scale-[1.01] duration-500">
            <TaskBoard 
              tasks={tasks} 
              onTaskSubmitted={handleTaskSubmitted} 
              mode="queue" 
            />
          </div>

        </div>
      </main>

      <footer className="mt-10 border-t border-white/5 py-16">
        <div className="max-w-6xl mx-auto px-6 text-center flex flex-col items-center">
          <CloudRain size={24} className="text-slate-800 mb-6" />
          <p className="text-slate-500 text-xs tracking-wide">
            Powered by LangGraph Agentic Intelligence. Designed in California.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
