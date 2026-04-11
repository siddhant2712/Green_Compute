import React, { useMemo, useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, ReferenceDot } from 'recharts';
import { Settings } from 'lucide-react';

interface Props {
  current: number;
  p30: number;
  region?: string;
}

const REGION_TZ: Record<string, string> = {
  UK: 'Europe/London',
  IN: 'Asia/Kolkata',
  DE: 'Europe/Berlin',
  US: 'America/Los_Angeles',
};

/** Returns the current { hour, minute } in the given IANA timezone */
const getRegionTime = (tz: string): { hour: number; minute: number; label: string } => {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);

  const hour = parseInt(parts.find(p => p.type === 'hour')!.value, 10);
  const minute = parseInt(parts.find(p => p.type === 'minute')!.value, 10);
  const label = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
  return { hour, minute, label };
};

/** Format an hour (0-23) as "HH:00" */
const fmtHour = (h: number) => `${String(h % 24).padStart(2, '0')}:00`;

const IntensityGraph: React.FC<Props> = ({ current, p30, region = 'UK' }) => {
  const tz = REGION_TZ[region] ?? 'UTC';
  
  const [_, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 30000);
    return () => clearInterval(id);
  }, []);

  const { hour: nowHour, minute: nowMin, label: nowLabel } = getRegionTime(tz);
  const nowFraction = (nowHour + nowMin / 60) / 24;

  const data = useMemo(() => {
    const slots = [0, 4, 8, 12, 16, 20, 23.9];
    const points = slots.map(h => {
      const distFromNow = Math.abs(h - (nowHour + nowMin/60));
      const offset = distFromNow < 1 ? 0 : (h % 3 === 0 ? 15 : -8);
      return {
        time: fmtHour(Math.floor(h)),
        intensity: Math.max(10, p30 + offset),
        isNow: false,
        absTime: h
      };
    });

    // Insert actual "Now" point
    const nowPoint = { 
      time: nowLabel, 
      intensity: current, 
      isNow: true,
      absTime: nowHour + nowMin/60
    };

    const insertIdx = points.findIndex(p => p.absTime > nowPoint.absTime);
    if (insertIdx === -1) {
      points.push(nowPoint);
    } else {
      points.splice(insertIdx, 0, nowPoint);
    }

    return points.sort((a, b) => a.absTime - b.absTime);
  }, [nowHour, nowMin, current, p30, nowLabel]);

  const nowPoint = data.find(d => d.isNow) || data[0];
  const nowLeft = 0.05 + (nowFraction * 0.92); // Adjusted for typical Recharts chart area

  return (
    <div className="glass p-8 rounded-[32px] h-full flex flex-col group relative overflow-hidden">
      <div className="flex justify-between items-start mb-12">
        <div>
          <h3 className="text-[10px] font-bold tracking-[0.2em] uppercase text-slate-500 mb-1">
            Current Energy Grid Intensity
          </h3>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Live {region} Node
            </span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Local Time</p>
          <p className="text-sm font-bold font-mono text-white">{nowLabel}</p>
        </div>
      </div>

      <div className="flex-1 min-h-[220px] relative">
        <div
          className="absolute z-20 pointer-events-none transition-all duration-1000"
          style={{
            left: `${nowLeft * 100}%`,
            top: `${100 - (current / 350) * 100}%`,
            transform: 'translate(-50%, -100%) translateY(-20px)',
          }}
        >
          <div className="bg-slate-900/90 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl text-center shadow-xl">
            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-0.5">Now · {nowLabel}</p>
            <p className="text-sm font-bold text-white leading-none">
              <span className="text-green-500">{current}</span> <span className="text-[9px] font-medium opacity-50">gCO₂/kWh</span>
            </p>
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-px h-4 bg-white/20"></div>
          </div>
        </div>

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorIntensity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
            />
            <Tooltip content={() => null} />

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
              x={nowPoint.time}
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
        <span className="text-slate-400">Local Time ({region})</span>
        <span>23:59</span>
      </div>
    </div>
  );
};

export default IntensityGraph;
