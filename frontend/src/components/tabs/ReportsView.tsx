import React from 'react';
import { FileText, Download, BarChart3, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import type { TaskResponse } from '../../api';

interface Props {
  tasks: TaskResponse[];
}

const ReportsView: React.FC<Props> = ({ tasks }) => {
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Sustainability Reports</h2>
        <p className="text-slate-500 font-medium">Verify your carbon-aware computations and download ESG-compliant certificates.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
        <div className="glass p-8 rounded-[32px] border-green-500/10">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Total Net Savings</p>
          <h3 className="text-4xl font-bold text-green-400">14.8 <span className="text-lg text-slate-500">kg CO₂</span></h3>
        </div>
        <div className="glass p-8 rounded-[32px] border-blue-500/10">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Verification Score</p>
          <h3 className="text-4xl font-bold text-blue-400">98.2<span className="text-lg text-slate-500">%</span></h3>
        </div>
        <div className="glass p-8 rounded-[32px] border-purple-500/10">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Audit Transparency</p>
          <h3 className="text-4xl font-bold text-purple-400 font-mono tracking-tighter uppercase">High</h3>
        </div>
      </div>

      <div className="glass rounded-[32px] overflow-hidden">
        <div className="p-8 border-b border-white/5 flex justify-between items-center">
          <h3 className="text-sm font-bold tracking-[0.2em] uppercase text-white">Historical ESG Certificates</h3>
          <button className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest hover:text-white transition-colors">
            <Download size={14} /> Bulk Export
          </button>
        </div>

        <div className="divide-y divide-white/5">
          {completedTasks.length === 0 ? (
            <div className="py-20 text-center">
              <FileText size={48} className="mx-auto text-slate-800 mb-6" />
              <p className="text-slate-500 font-medium">No verified computations found.</p>
            </div>
          ) : (
            completedTasks.map((task) => (
              <motion.div 
                key={task.request_id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="p-6 hover:bg-white/[0.02] flex items-center justify-between transition-all"
              >
                <div className="flex items-center gap-6">
                  <div className="bg-green-500/10 p-3 rounded-2xl">
                    <FileText size={24} className="text-green-500" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white mb-0.5 tracking-tight">Verified ESG Receipt: {task.request_id.slice(0, 12)}...</h4>
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Saved {task.emissions_saved}g CO₂ // HMAC-SIGNED</p>
                  </div>
                </div>
                
                <button 
                   onClick={() => window.open(`http://localhost:8000/certificate/${task.request_id}`)}
                   className="flex items-center gap-2 bg-white text-black hover:bg-slate-200 text-[10px] font-bold py-2.5 px-6 rounded-full transition-all tracking-widest uppercase"
                >
                  <Download size={14} /> Download PDF
                </button>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportsView;
