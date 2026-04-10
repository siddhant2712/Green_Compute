import React from 'react';
import { TrendingDown } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import type { CarbonStatus } from '../api';

interface Props {
  status: CarbonStatus | null;
  mode?: 'status' | 'graph';
}

const colors = {
  green: "text-green-400 font-bold",
  red: "text-red-400 font-bold",
  yellow: "text-yellow-400",
  slate: "text-slate-500"
};

const CarbonWidget: React.FC<Props> = ({ status, mode = 'status' }) => {
  if (!status) return null;

  const isGreen = status.is_green;
  
  // Mock forecast data for visualization
  const forecastData = [
    { time: '12:00', intensity: status.current },
    { time: '14:00', intensity: status.p30_threshold + 15 },
    { time: '16:00', intensity: status.p30_threshold - 5 },
    { time: '18:00', intensity: status.p30_threshold + 25 },
    { time: '20:00', intensity: status.p30_threshold - 8 },
    { time: '22:00', intensity: status.p30_threshold - 12 },
    { time: '00:00', intensity: status.p30_threshold + 5 },
  ];

  if (mode === 'status') {
    return (
      <div className="glass p-10 rounded-3xl relative h-full flex flex-col justify-between">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-2">
              Grid Intelligence
            </h2>
            <p className="text-white text-3xl font-bold tracking-tight">System Status</p>
          </div>
          <div className="text-right">
            <div className={`flex items-center gap-2 px-5 py-2 rounded-full border text-xs font-bold tracking-widest uppercase ${isGreen ? 'bg-green-500/10 border-green-500/20 ' + colors.green : 'bg-red-500/10 border-red-500/20 ' + colors.red}`}>
              {isGreen ? '🟢 Grid: Clean' : '🔴 Grid: Dirty'}
            </div>
            <p className={`mt-3 text-[10px] font-bold uppercase tracking-widest ${isGreen ? colors.green : 'text-amber-500'}`}>
              Decision: {isGreen ? 'Immediate Execution' : '⏸️ Tasks Deferred'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-8">
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm transition hover:bg-white/[0.07]">
            <p className="text-[10px] uppercase tracking-widest mb-2 font-bold text-slate-500">Current Intensity</p>
            <p className="text-4xl font-bold tracking-tight text-white">{status.current} <span className="text-xs font-medium text-slate-500">gCO₂</span></p>
          </div>
          <div className="bg-white/5 p-6 rounded-2xl border border-white/5 backdrop-blur-sm transition hover:bg-white/[0.07]">
            <p className="text-[10px] uppercase tracking-widest mb-2 font-bold text-green-500">Optimal (P30)</p>
            <p className="text-4xl font-bold tracking-tight text-white">{status.p30_threshold} <span className="text-xs font-medium text-slate-500">gCO₂</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="glass p-10 rounded-3xl transition hover:scale-[1.005] duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
        <div>
          <h2 className="text-[10px] font-bold tracking-[0.2em] text-slate-500 uppercase mb-2">
            Temporal Analysis
          </h2>
          <p className="text-white text-3xl font-bold tracking-tight">48h Carbon Forecast</p>
        </div>
        <div className="flex items-center gap-8 bg-white/5 px-8 py-4 rounded-2xl border border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-4 h-1 bg-green-500 rounded-full opacity-50"></div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">P30 Baseline</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingDown size={14} className="text-blue-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Predictive</span>
          </div>
        </div>
      </div>

      <div className="h-64 w-full px-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={forecastData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#475569" 
              fontSize={10} 
              tickLine={false} 
              axisLine={false}
              dy={15}
            />
            <YAxis hide domain={['dataMin - 10', 'dataMax + 10']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#000', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(20px)', padding: '12px' }}
              itemStyle={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}
              labelStyle={{ color: '#64748b', fontSize: '10px', fontWeight: 'bold', marginBottom: '4px', textTransform: 'uppercase' }}
            />
            
            {/* P30 Threshold Line */}
            <ReferenceLine 
              y={status.p30_threshold} 
              stroke="#22c55e" 
              strokeDasharray="10 10" 
              strokeWidth={1}
              opacity={0.5}
            />

            {/* Current Intensity Marker */}
            <ReferenceDot 
              x={forecastData[0].time} 
              y={status.current} 
              r={6} 
              fill="#ef4444" 
              stroke="#fff" 
              strokeWidth={3}
              isFront={true}
            />

            <Line 
              type="monotone" 
              dataKey="intensity" 
              stroke={isGreen ? '#5df18e' : '#334155'} 
              strokeWidth={3} 
              dot={false}
              activeDot={{ r: 6, fill: '#fff' }}
              animationDuration={2500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default CarbonWidget;
