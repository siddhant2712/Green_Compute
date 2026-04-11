import React, { useState, useEffect } from 'react';
import { Globe, ArrowRight, Zap, CheckCircle2, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  optimization: {
    best_region: string;
    intensities: Record<string, number>;
    scores: Record<string, number>;
  };
  selectedRegion: string;
  onRegionChange: (region: string) => void;
}

const REGION_META: Record<string, { name: string; icon: string; tz: string }> = {
  UK: { name: 'United Kingdom', icon: '🇬🇧', tz: 'Europe/London' },
  IN: { name: 'India (Central)', icon: '🇮🇳', tz: 'Asia/Kolkata' },
  DE: { name: 'Germany', icon: '🇩🇪', tz: 'Europe/Berlin' },
  US: { name: 'USA (Cal-Grid)', icon: '🇺🇸', tz: 'America/Los_Angeles' },
};

const getIntensityColor = (intensity: number): string => {
  if (intensity < 150) return '#22c55e';
  if (intensity < 300) return '#eab308';
  return '#ef4444';
};

const getLocalTime = (tz: string): string => {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date());
};

const GlobalOptimizerWidget: React.FC<Props> = ({ optimization, selectedRegion, onRegionChange }) => {
  const maxIntensity = Math.max(...Object.values(optimization.intensities));

  // Tick every 30 seconds to keep local times fresh (forces re-render for clock display)
  const [_tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="glass p-8 rounded-[32px] h-full flex flex-col group overflow-hidden relative">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-1">
            Global Carbon Optimization
          </h3>
          <div className="flex items-center gap-2">
            <Globe size={14} className="text-blue-400 group-hover:rotate-180 transition-transform duration-[3s]" />
            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">
              Multi-Node Registry Active
            </span>
          </div>
        </div>

        {/* Best Region Badge */}
        <div className="bg-green-500/10 border border-green-500/20 px-3 py-1 rounded-full text-[9px] font-bold text-green-500 uppercase tracking-widest flex items-center gap-1.5">
          <Zap size={9} />
          {optimization.best_region} optimal
        </div>
      </div>

      {/* Region Selector List */}
      <div className="space-y-3 flex-1 overflow-auto">
        {Object.entries(REGION_META).map(([id, meta]) => {
          const intensity = optimization.intensities[id] ?? 0;
          const isBest = optimization.best_region === id;
          const isSelected = selectedRegion === id;
          const color = getIntensityColor(intensity);

          return (
            <motion.button
              key={id}
              onClick={() => onRegionChange(id)}
              whileHover={{ scale: 1.012 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full text-left px-4 py-3 rounded-2xl border transition-all duration-200 relative overflow-hidden cursor-pointer
                ${isSelected
                  ? 'border-white/20 bg-white/[0.07] shadow-[0_0_20px_rgba(255,255,255,0.04)]'
                  : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/10'
                }`}
            >
              {/* Selected pulse bg */}
              {isSelected && (
                <motion.div
                  layoutId="regionHighlight"
                  className="absolute inset-0 rounded-2xl"
                  style={{ background: `${color}10` }}
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}

              <div className="relative z-10 flex items-center gap-3">
                {/* Flag + Name */}
                <span className="text-xl leading-none">{meta.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`text-xs font-bold truncate ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                      {meta.name}
                    </span>
                    {isBest && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-[8px] font-bold text-green-500 uppercase tracking-tighter bg-green-500/10 px-1.5 py-0.5 rounded-full"
                      >
                        Best
                      </motion.span>
                    )}
                    {/* Live local time */}
                    <span className="ml-auto flex items-center gap-1 text-[9px] font-mono text-slate-600">
                      <Clock size={8} />
                      {getLocalTime(meta.tz)}
                    </span>
                  </div>
                  {/* Intensity bar */}
                  <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, (intensity / maxIntensity) * 100)}%` }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full rounded-full"
                      style={{
                        background: color,
                        boxShadow: isSelected ? `0 0 8px ${color}80` : 'none',
                      }}
                    />
                  </div>
                </div>

                {/* Intensity Value */}
                <div className="text-right shrink-0">
                  <span className="text-xs font-mono font-bold" style={{ color }}>
                    {Math.round(intensity)}
                    <span className="text-[8px] opacity-50 ml-0.5">g</span>
                  </span>
                </div>

                {/* Check mark for selected */}
                <AnimatePresence>
                  {isSelected && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                    >
                      <CheckCircle2 size={14} style={{ color }} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Footer: Routing Decision */}
      <div className="mt-6 pt-5 border-t border-white/5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
          <span className="text-slate-500">Viewing Region:</span>
          <span className="text-white flex items-center gap-2">
            {REGION_META[selectedRegion]?.icon} {selectedRegion}
            {selectedRegion !== optimization.best_region && (
              <>
                <ArrowRight size={10} className="text-slate-600" />
                <span className="text-green-500">{optimization.best_region} optimal</span>
              </>
            )}
          </span>
        </div>
      </div>

      {/* Background Glow */}
      <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
    </div>
  );
};

export default GlobalOptimizerWidget;
