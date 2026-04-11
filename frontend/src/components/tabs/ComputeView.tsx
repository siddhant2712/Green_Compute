import React from 'react';
import TaskBoard from '../TaskBoard';
import type { TaskResponse } from '../../api';
import { motion } from 'framer-motion';

interface Props {
  tasks: TaskResponse[];
  onTaskSubmitted: (task: TaskResponse) => void;
}

const ComputeView: React.FC<Props> = ({ tasks, onTaskSubmitted }) => {
  return (
    <div className="space-y-8 max-w-5xl mx-auto px-4">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <h2 className="text-3xl font-bold tracking-tight text-white mb-2">Compute Engine</h2>
        <p className="text-slate-500 font-medium">Deploy and orchestrate carbon-aware AI workloads across the grid.</p>
      </motion.div>

      <div className="space-y-12">
        <section>
          <TaskBoard tasks={tasks} onTaskSubmitted={onTaskSubmitted} mode="submission" />
        </section>

        <section>
          <h3 className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-8">
            Global Execution Queue
          </h3>
          <TaskBoard tasks={tasks} onTaskSubmitted={onTaskSubmitted} mode="queue" />
        </section>
      </div>
    </div>
  );
};

export default ComputeView;
