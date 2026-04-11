import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import { Settings } from 'lucide-react';

interface Props {
  current: number;
  p30: number;
}

const IntensityGraph: React.FC<Props> = ({ current, p30 }) => {
  // Mock forecast data for visualization
  const data = [
    { time: '00:00', intensity: p30 + 10 },
    { time: '04:00', intensity: p30 - 5 },
    { time: '08:00', intensity: p30 + 30 },
    { time: '12:00', intensity: current }, // NOW
    { time: '16:00', intensity: p30 + 40 },
    { time: '20:00', intensity: p30 + 15 },
    { time: '23:59', intensity: p30 + 5 },
  ];

  const nowIndex = 3;

  return (
    <div className="glass p-8 rounded-[32px] h-full flex flex-col group relative overflow-hidden">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-1">
            Current Energy Grid Intensity
          </h3>
          <div className="flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live UK Node</span>
          </div>
        </div>
        <button className="text-slate-600 hover:text-white transition-colors">
          <Settings size={16} />
        </button>
      </div>

      <div className="flex-1 min-h-[220px] relative">
        {/* Custom "NOW" Tooltip Label */}
        <div 
          className="absolute z-20 pointer-events-none transition-all duration-700"
          style={{ 
            left: '42%', 
            top: `${100 - (current / 350) * 100}%`,
            transform: 'translate(-50%, -100%) translateY(-20px)'
          }}
        >
          <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl text-center shadow-xl">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Now</p>
            <p className="text-sm font-bold text-white leading-none">
              <span className="text-green-500">{current}</span> <span className="text-[9px] font-medium opacity-50">gCO₂/kWh</span>
            </p>
            {/* The little tail */}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-px h-4 bg-white/20"></div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="time" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
              dy={15}
            />
            <YAxis 
              domain={[0, 300]} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }}
              label={{ value: 'Carbon Intensity (gCO₂/kWh)', angle: -90, position: 'insideLeft', offset: -10, fill: '#475569', fontSize: 10, fontWeight: 700 }}
            />
            <Tooltip content={<div className="hidden" />} />
            
            <ReferenceLine y={p30} stroke="#22c55e" strokeDasharray="5 5" opacity={0.3} />
            
            <Area 
              type="monotone" 
              dataKey="intensity" 
              stroke="#22c55e" 
              strokeWidth={3}
              fillOpacity={1} 
              fill="url(#colorIntensity)" 
              animationDuration={2000}
            />

            <ReferenceDot 
              x={data[nowIndex].time} 
              y={current} 
              r={6} 
              fill="#fff" 
              stroke="#22c55e" 
              strokeWidth={3} 
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-8 flex justify-between items-center text-[10px] font-bold text-slate-600 uppercase tracking-widest px-2">
         <span>00:00</span>
         <span className="text-slate-400">Time</span>
         <span>00:00 - 23:59</span>
      </div>
    </div>
  );
};

export default IntensityGraph;
