import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  isGreen: boolean;
  intensity: number;
  region?: string;
}

const REGION_NAMES: Record<string, string> = {
  UK: '🇬🇧 United Kingdom',
  IN: '🇮🇳 India',
  DE: '🇩🇪 Germany',
  US: '🇺🇸 USA (West)',
};

const StatusOrb: React.FC<Props> = ({ isGreen, intensity, region = 'UK' }) => {
  return (
    <div className="glass p-8 rounded-[32px] h-full flex flex-col items-center justify-between relative overflow-hidden group">
      <div className="w-full">
        <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-white mb-1">
          Grid Status: <span className={isGreen ? "text-green-500" : "text-red-500"}>{isGreen ? "Green" : "Dirty"}</span>
        </h3>
        <p className="text-[10px] font-bold tracking-widest text-slate-500 uppercase">
          {REGION_NAMES[region] ?? region}
        </p>
      </div>

      <div className="relative flex items-center justify-center py-12">
        {/* The Glow */}
        <div className={`absolute w-32 h-32 rounded-full blur-[40px] opacity-40 transition-colors duration-1000 ${isGreen ? "bg-green-500" : "bg-red-500"}`} />
        
        {/* The Orb */}
        <motion.div 
          animate={{ 
            scale: [1, 1.05, 1],
            opacity: [0.8, 1, 0.8]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className={`w-28 h-28 rounded-full shadow-[inset_0_0_20px_rgba(255,255,255,0.2)] relative z-10 transition-colors duration-1000 ${isGreen ? "bg-green-500" : "bg-red-500"}`}
        >
          <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-white/20 to-transparent" />
        </motion.div>
      </div>

      <div className="text-center">
        <h4 className="text-sm font-bold tracking-tight text-white uppercase mb-1">
          {isGreen ? "Optimal // Low" : "Sub-Optimal // High"}
        </h4>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-widest mb-4">Carbon Intensity</p>
        <p className="text-2xl font-bold tracking-tight text-white mb-2">
          {intensity} <span className="text-[10px] font-medium text-slate-500">gCO₂/kWh</span>
        </p>
      </div>

      {/* Background decoration */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-green-500/5 to-transparent pointer-events-none" />
    </div>
  );
};

export default StatusOrb;
