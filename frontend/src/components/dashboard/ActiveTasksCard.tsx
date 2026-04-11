import React from 'react';
import { motion } from 'framer-motion';
import type { TaskResponse } from '../../api';

interface Props {
  tasks: TaskResponse[];
}

const ActiveTasksCard: React.FC<Props> = ({ tasks }) => {
  const activeTasks = tasks.length > 0 ? tasks.slice(0, 5) : [
    { request_id: '1', status: 'running', priority: 'urgent', input_data: '{"prompt": "ImageGen v3.1"}' },
    { request_id: '2', status: 'paused', priority: 'deferrable', input_data: '{"prompt": "LLM Training: alpha"}' },
    { request_id: '3', status: 'completed', priority: 'deferrable', input_data: '{"prompt": "Model Fine-Tune"}' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'paused': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'completed': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      default: return 'bg-white/5 text-slate-500 border-white/10';
    }
  };

  const parseName = (inputData: string) => {
    try {
      const data = JSON.parse(inputData);
      return data.name || data.prompt || "AI Workload";
    } catch {
      return "AI Workload";
    }
  };

  return (
    <div className="glass p-8 rounded-[32px] h-full flex flex-col">
      <div className="mb-8">
        <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-1">
          Active AI Tasks
        </h3>
      </div>

      <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activeTasks.map((task, idx) => {
          const name = parseName(task.input_data as string);
          const status = task.status;
          const progress = status === 'running' ? 45 + (idx * 15) : status === 'completed' ? 100 : 0;

          return (
            <div key={task.request_id} className="group cursor-default">
              <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3 w-full overflow-hidden">
                    <span className="text-[10px] font-bold text-slate-600 font-mono flex-shrink-0">{String(idx + 1).padStart(2, '0')}</span>
                    <h4 className="text-sm font-bold text-white group-hover:text-green-400 transition-colors duration-300 truncate pr-4">
                      {name}
                    </h4>
                  </div>
                 <div className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest border ${getStatusColor(status)}`}>
                   {status}
                 </div>
              </div>
              
              <div className="flex flex-col gap-1.5 ml-6">
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${progress}%` }}
                     transition={{ duration: 2, ease: "easeOut" }}
                     className={`h-full ${status === 'running' ? "bg-green-500" : status === 'completed' ? "bg-blue-500" : "bg-slate-700"}`}
                   />
                </div>
                <div className="flex justify-between text-[9px] font-bold text-slate-500 uppercase tracking-tighter">
                   <span>{progress}% complete</span>
                   {status === 'running' && <span className="text-slate-600">14min elapsed</span>}
                   {status === 'paused' && <span className="text-amber-500/60 font-mono tracking-tight">WAITING ON GRID</span>}
                </div>
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="py-12 text-center border border-dashed border-white/5 rounded-3xl">
             <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest leading-loose">
               No live workloads<br />Synchronize agents to begin
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActiveTasksCard;
