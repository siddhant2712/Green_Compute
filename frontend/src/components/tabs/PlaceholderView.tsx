import React from 'react';
import { Clock, Settings, Package, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  title: string;
  description: string;
  icon: 'clock' | 'settings' | 'package';
}

const PlaceholderView: React.FC<Props> = ({ title, description, icon }) => {
  const Icon = icon === 'clock' ? Clock : icon === 'settings' ? Settings : Package;

  return (
    <div className="flex items-center justify-center h-[70vh]">
      <div className="max-w-md text-center">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/[0.03] border border-white/5 w-24 h-24 rounded-[32px] flex items-center justify-center mx-auto mb-8 relative"
        >
          <Icon size={32} className="text-slate-600" />
          <div className="absolute -top-2 -right-2 bg-amber-500/20 text-amber-500 border border-amber-500/20 p-1.5 rounded-lg shadow-xl backdrop-blur-md">
            <Lock size={12} />
          </div>
        </motion.div>
        
        <motion.h2 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold tracking-tight text-white mb-4"
        >
          {title}
        </motion.h2>
        
        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-slate-500 font-medium text-sm leading-relaxed"
        >
          {description}
          <br /><br />
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#22c55e]/60">Expected in v1.1.0-PRO</span>
        </motion.p>
      </div>
    </div>
  );
};

export default PlaceholderView;
