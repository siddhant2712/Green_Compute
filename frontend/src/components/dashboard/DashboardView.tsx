import React from 'react';
import IntensityGraph from './IntensityGraph';
import StatusOrb from './StatusOrb';
import ActiveTasksCard from './ActiveTasksCard';
import { EnergyMixCard, SavingsSummaryCard } from './SummaryCards';
import type { CarbonStatus, TaskResponse } from '../../api';
import { motion } from 'framer-motion';

interface Props {
  status: CarbonStatus | null;
  tasks: TaskResponse[];
}

const DashboardView: React.FC<Props> = ({ status, tasks }) => {
  if (!status) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-green-500/20 border-t-green-500 rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">Hydrating Grid Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Top Row: 3 Columns matching the image */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-12 xl:col-span-5 h-[480px]"
        >
          <IntensityGraph current={status.current} p30={status.p30_threshold} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-6 xl:col-span-3 h-[480px]"
        >
          <StatusOrb isGreen={status.is_green} intensity={status.current} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-6 xl:col-span-4 h-[480px]"
        >
          <ActiveTasksCard tasks={tasks} />
        </motion.div>
      </div>

      {/* Bottom Row: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.3 }}
           className="h-[280px]"
        >
          <EnergyMixCard />
        </motion.div>
        
        <motion.div
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ duration: 0.6, delay: 0.4 }}
           className="h-[280px]"
        >
          <SavingsSummaryCard />
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardView;
