import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';

export interface WorkloadItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  count: number;
  color: string;       // e.g., '#7c3aed' or Tailwind class 'bg-purple-600'
  // For Tailwind class background, we'll map to a background style
}

interface WorkloadByDepartmentProps {
  departments: WorkloadItem[];
  title?: string;
  maxBarWidth?: number;   // max width percentage (default 100)
  onDepartmentClick?: (deptId: string) => void;
}

export function WorkloadByDepartment({
  departments,
  title = 'حمولة العمل حسب القسم',
  maxBarWidth = 100,
  onDepartmentClick,
}: WorkloadByDepartmentProps) {
  // Calculate maximum count for scaling progress bars
  const maxCount = useMemo(() => {
    if (departments.length === 0) return 1;
    return Math.max(...departments.map(d => d.count));
  }, [departments]);

  return (
    <div className="bg-card rounded-lg border border-border p-5 shadow-sm">
      <h4 className="text-sm font-bold text-text mb-4 flex items-center gap-2">
        <BarChart3 size={18} className="text-primary" /> {title}
      </h4>
      <div className="space-y-4">
        {departments.map((dept) => {
          const percentage = dept.count === 0 ? 0 : Math.min((dept.count / maxCount) * 100, maxBarWidth);
          return (
            <div
              key={dept.id}
              onClick={() => onDepartmentClick?.(dept.id)}
              className="cursor-pointer hover:bg-primary-light/30 transition-colors rounded-md p-1 -mx-1"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">{dept.icon}</span>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-sm font-semibold text-text">{dept.label}</span>
                    <span className="text-sm font-bold" style={{ color: dept.color }}>
                      {dept.count}
                    </span>
                  </div>
                  <div className="h-2 bg-primary-light/20 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: dept.color,
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}