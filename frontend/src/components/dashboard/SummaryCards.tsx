import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Settings, BarChart } from 'lucide-react';

export const EnergyMixCard: React.FC = () => {
  return (
    <div className="glass p-8 rounded-[32px] h-full relative overflow-hidden group">
      <div className="flex justify-between items-start mb-8">
        <h3 className="text-sm font-bold tracking-tight text-white mb-1">Today's Energy Mix</h3>
        <button className="text-slate-600 hover:text-white transition-colors">
          <Settings size={16} />
        </button>
      </div>

      <div className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-2 text-white">
              <Zap size={14} className="text-green-500" /> Renewables
            </span>
            <span className="text-white">82%</span>
          </div>
          <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '82%' }}
              transition={{ duration: 2 }}
              className="h-full bg-green-500 rounded-full shadow-[0_0_15px_rgba(34,197,94,0.4)]"
            />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center text-[11px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="flex items-center gap-2">
              <BarChart size={14} /> Fossil Fuels
            </span>
            <span>18%</span>
          </div>
          <div className="w-full bg-white/5 h-2.5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: '18%' }}
              transition={{ duration: 2 }}
              className="h-full bg-slate-600 rounded-full"
            />
          </div>
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:scale-110 transition-all duration-[2s]">
        <Zap size={100} />
      </div>
    </div>
  );
};

export const SavingsSummaryCard: React.FC = () => {
  return (
    <div className="glass p-8 rounded-[32px] h-full flex flex-col group relative overflow-hidden">
       <div className="flex justify-between items-start mb-12">
        <h3 className="text-sm font-bold tracking-tight text-white mb-1">Savings Summary</h3>
        <button className="text-slate-600 hover:text-white transition-colors">
          <BarChart size={16} />
        </button>
      </div>

      <div className="flex items-center gap-20">
         <div className="space-y-8 flex-1">
            <div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Total Offset</p>
               <h4 className="text-4xl font-bold tracking-tighter text-white">4.1t <span className="text-xl text-slate-500 font-medium">CO₂</span></h4>
            </div>
            <div>
               <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">System Efficiency</p>
               <h4 className="text-2xl font-bold tracking-tighter text-green-400">+42%</h4>
            </div>
         </div>

         <div className="relative w-32 h-32 flex items-center justify-center">
            {/* Simple CSS Donut representation */}
            <div className="w-32 h-32 rounded-full border-[10px] border-white/5 relative">
               <div 
                 className="absolute inset-[-10px] rounded-full border-[10px] border-green-500"
                 style={{ clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 100%, 0% 100%, 0% 0%, 50% 0%)' }}
               ></div>
               <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Yield</span>
                  <span className="text-lg font-bold text-white">92%</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};
