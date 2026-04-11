import React, { useState } from 'react';
import { Send, Clock, CheckCircle2, PauseCircle, AlertCircle, FileText, Activity } from 'lucide-react';
import { submitTask } from '../api';
import type { TaskResponse } from '../api';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  tasks: TaskResponse[];
  onTaskSubmitted: (task: TaskResponse) => void;
  mode?: 'submission' | 'queue';
}

const REGIONS = [
  { value: 'auto', label: '🌐 Auto (AI Optimizer)', flag: '🌐' },
  { value: 'UK',   label: '🇬🇧 United Kingdom',     flag: '🇬🇧' },
  { value: 'IN',   label: '🇮🇳 India (Central)',     flag: '🇮🇳' },
  { value: 'DE',   label: '🇩🇪 Germany',             flag: '🇩🇪' },
  { value: 'US',   label: '🇺🇸 USA (Cal-Grid)',      flag: '🇺🇸' },
];

const TaskBoard: React.FC<Props> = ({ tasks, onTaskSubmitted, mode = 'submission' }) => {
  const [prompt, setPrompt] = useState('');
  const [taskName, setTaskName] = useState('');
  const [priority, setPriority] = useState('deferrable');
  const [targetRegion, setTargetRegion] = useState('auto');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;
    
    setIsSubmitting(true);
    try {
      const payload: Record<string, string> = { prompt, name: taskName };
      if (targetRegion !== 'auto') payload.preferred_region = targetRegion;
      const task = await submitTask(priority, payload);
      onTaskSubmitted(task);
      setPrompt('');
      setTaskName('');
      setTargetRegion('auto');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400 bg-green-500/10 border-green-500/20';
      case 'paused': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'running': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-slate-500 bg-white/5 border-white/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 size={16} />;
      case 'paused': return <PauseCircle size={16} />;
      case 'running': return <Clock size={16} className="animate-spin" />;
      default: return <AlertCircle size={16} />;
    }
  };

  if (mode === 'submission') {
    return (
      <div className="glass p-10 rounded-3xl">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-8 text-center">
            New Workload
          </h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex flex-col gap-4">
              <input
                type="text"
                value={taskName}
                onChange={(e) => setTaskName(e.target.value)}
                placeholder="Task Name (e.g. My Demo Job)"
                className="w-full bg-white/5 border border-white/10 rounded-full py-4 px-8 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-white/20 backdrop-blur-md transition-all font-semibold"
              />
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the AI task (e.g., Generate a research report on carbon-aware systems...)"
                className="w-full bg-white/5 border border-white/10 rounded-[32px] p-8 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-white/20 min-h-[160px] resize-none backdrop-blur-md transition-all text-lg leading-relaxed"
              />
            </div>
            <div className="flex flex-col md:flex-row items-center justify-center gap-4">
              {/* Priority Selector */}
              <div className="relative w-full md:w-auto">
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full md:w-auto bg-white/10 border border-white/10 rounded-full px-8 py-4 text-sm font-semibold focus:outline-none text-slate-200 backdrop-blur-md appearance-none cursor-pointer pr-12"
                >
                  <option value="deferrable" className="bg-black">🌱 Deferrable (Optimal)</option>
                  <option value="urgent" className="bg-black">⚡ Urgent (Immediate)</option>
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                   <Clock size={14} />
                </div>
              </div>

              {/* Region Selector */}
              <div className="relative w-full md:w-auto">
                <select
                  value={targetRegion}
                  onChange={(e) => setTargetRegion(e.target.value)}
                  className="w-full md:w-auto bg-white/10 border border-white/10 rounded-full px-8 py-4 text-sm font-semibold focus:outline-none text-slate-200 backdrop-blur-md appearance-none cursor-pointer pr-12"
                >
                  {REGIONS.map(r => (
                    <option key={r.value} value={r.value} className="bg-black">{r.label}</option>
                  ))}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                  <span className="text-xs font-bold">{REGIONS.find(r => r.value === targetRegion)?.flag}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !prompt}
                className="w-full md:w-auto bg-white text-black hover:bg-slate-200 disabled:bg-white/10 disabled:text-white/20 font-bold py-4 px-12 rounded-full transition-all flex items-center justify-center gap-3 transform active:scale-[0.98] shadow-lg shadow-white/5"
              >
                <Send size={18} />
                <span>{isSubmitting ? 'Syncing...' : 'Dispatch Job'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-10 rounded-3xl overflow-hidden">
      <h2 className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-10 text-center">
        Live Orchestration Queue
      </h2>
      <div className="space-y-3">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-8 py-4 border-b border-white/5 text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">
          <div className="col-span-12 md:col-span-5">Identity / Payload</div>
          <div className="hidden md:block col-span-3 text-center">Status Index</div>
          <div className="hidden md:block col-span-4 text-right">System Output</div>
        </div>

        <AnimatePresence initial={false}>
          {tasks.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 bg-white/[0.01] rounded-3xl border border-dashed border-white/10"
            >
              <Activity className="mx-auto mb-4 text-slate-700 animate-pulse" size={32} />
              <p className="text-slate-500 text-sm font-medium tracking-tight">
                System ready. Submit a task to begin orchestration.
              </p>
            </motion.div>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task.request_id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/[0.02] hover:bg-white/[0.04] p-6 rounded-3xl border border-white/5 flex flex-col md:grid md:grid-cols-12 gap-6 md:gap-4 items-center transition-all duration-500 group"
              >
                {/* Task Details */}
                <div className="col-span-5 flex items-center justify-start w-full md:w-auto gap-5">
                  <div className={`p-3 rounded-2xl border flex-shrink-0 transition-transform group-hover:scale-110 duration-500 ${getStatusStyle(task.status)}`}>
                    {getStatusIcon(task.status)}
                  </div>
                  <div>
                    <p className="font-mono text-[9px] text-slate-500 mb-0.5 tracking-widest uppercase opacity-60">ID: {task.request_id.slice(0, 8)}</p>
                    <p className="text-sm font-bold text-white mb-1 line-clamp-1">
                      {(() => {
                        try {
                          const data = JSON.parse(task.input_data as string);
                          return data.name || data.prompt || "AI Workload";
                        } catch {
                          return "AI Workload";
                        }
                      })()}
                    </p>
                    <p className="text-[10px] font-medium text-slate-500 flex items-center gap-2">
                       {task.priority === 'urgent' ? '⚡ Urgent Priority' : '🌱 Carbon-Aware'}
                       <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                       {task.assigned_region && (
                         <span className="text-blue-400/80 font-bold uppercase tracking-tighter">NODE: {task.assigned_region}</span>
                       )}
                       <span className="w-1 h-1 rounded-full bg-slate-700"></span>
                       {new Date(task.created_at || "").toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
                
                {/* Status */}
                <div className="col-span-3 flex flex-col items-center justify-center w-full md:w-auto px-6 border-x border-white/5">
                  <div className={`px-5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] w-full text-center ${getStatusStyle(task.status)}`}>
                    {task.status}
                  </div>
                  {task.status === 'paused' && (
                    <p className="text-[10px] text-amber-500/80 mt-2 text-center font-bold tracking-tight">Deferred for Optimal Grid</p>
                  )}
                  {task.status === 'running' && (
                    <p className="text-[10px] text-blue-400 mt-2 text-center font-bold tracking-tight animate-pulse">Orchestrating Agents...</p>
                  )}
                </div>

                {/* Action */}
                <div className="col-span-4 flex items-center md:justify-end justify-center w-full md:w-auto gap-4">
                  {task.status === 'completed' ? (
                    <>
                      <div className="text-right hidden lg:block">
                        <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest mb-1">Offset</p>
                        <p className="text-green-400 font-bold text-sm tracking-tighter">{task.emissions_saved} <span className="text-[10px] font-normal">gCO₂</span></p>
                      </div>
                      <button 
                        onClick={() => window.open(`http://localhost:8000/certificate/${task.request_id}`)}
                        className="flex items-center gap-2 bg-white/5 hover:bg-white text-white hover:text-black text-xs font-bold py-3 px-6 rounded-full border border-white/10 transition-all duration-500"
                        title="View Sustainability Certificate"
                      >
                        <FileText size={16} />
                        <span>ESG Receipt</span>
                      </button>
                    </>
                  ) : (
                    <div className="flex items-center gap-3 px-6">
                       <div className="flex gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-1.5 h-1.5 rounded-full bg-slate-700 animate-bounce"></span>
                       </div>
                       <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Processing</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TaskBoard;
