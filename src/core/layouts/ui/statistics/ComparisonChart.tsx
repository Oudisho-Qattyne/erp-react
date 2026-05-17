'use client';

import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend,
  TooltipProps
} from 'recharts';

interface ComparisonChartProps {
  data: any[];
  xKey: string;
  bars: { key: string; label: string; color: string }[];
  title?: string;
  height?: number;
}

const CustomTooltip = ({ active, payload, label }:any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border p-3 rounded-lg shadow-xl backdrop-blur-md bg-opacity-90">
        <p className="text-[10px] font-black text-text-muted uppercase mb-2 border-b border-border pb-1">{label}</p>
        <div className="space-y-1">
          {payload.map((entry:any, index:number) => (
            <div key={index} className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                <span className="text-[10px] font-bold text-text">{entry.name}:</span>
              </div>
              <span className="text-xs font-black text-text">{entry.value?.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export function ComparisonChart({ data, xKey, bars, title, height = 300 }: ComparisonChartProps) {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card shadow-sm hover:shadow-md transition-shadow duration-500">
      {title && (
        <h4 className="text-sm font-black text-text mb-6 flex items-center gap-2">
          <span className="w-1.5 h-4 bg-primary rounded-full" />
          {title}
        </h4>
      )}
      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border)" opacity={0.5} />
            <XAxis 
              dataKey={xKey} 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} 
              dy={10}
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 10, fill: 'var(--color-text-muted)' }} 
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'var(--color-primary)', opacity: 0.05 }} />
            <Legend 
              verticalAlign="top" 
              align="right" 
              iconType="circle"
              wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', paddingBottom: '20px' }}
            />
            {bars.map((bar, idx) => (
              <Bar 
                key={idx}
                dataKey={bar.key} 
                name={bar.label} 
                fill={bar.color} 
                radius={[4, 4, 0, 0]} 
                barSize={12}
                animationDuration={1500 + idx * 500}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
