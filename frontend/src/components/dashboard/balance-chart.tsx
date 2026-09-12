"use client";

import React, { useState, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { BalancePoint, CustomerStateType } from "@/types";
import { formatCurrency, formatCompact } from "@/lib/utils";

export interface BalanceChartProps {
  data: BalancePoint[];
  state: CustomerStateType;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number; payload: BalancePoint }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const item = payload[0].payload;
    return (
      <div className="bg-saarthi-elevated border border-saarthi-border-subtle rounded-md p-2.5 shadow-lg">
        <p className="text-[11px] text-saarthi-text-muted font-normal uppercase tracking-wider">
          {item.month}
        </p>
        <p className="text-sm font-light text-saarthi-text-primary mt-0.5">
          {formatCurrency(item.balance)}
        </p>
      </div>
    );
  }
  return null;
};

/**
 * BalanceChart displays an interactive Recharts AreaChart showing historical balance trends.
 * Stroke and gradient colors dynamically shift between healthy teal and stressed red.
 */
export const BalanceChart: React.FC<BalanceChartProps> = ({ data, state }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Line stroke colors based on customer state: #00D4AA for healthy, #EF4444 for stressed
  const strokeColorMap: Record<CustomerStateType, string> = {
    healthy: "#00D4AA",
    vulnerable: "#F59E0B",
    stressed: "#EF4444",
    fraud_risk: "#F97316",
  };

  const strokeColor = strokeColorMap[state] || "#00D4AA";

  return (
    <div className="card p-4 flex flex-col justify-between h-full">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-normal text-saarthi-text-secondary">
          Balance trend
        </h3>
        {data && data.length > 0 && (
          <span className="text-xs font-light text-saarthi-text-muted">
            Latest: {formatCurrency(data[data.length - 1].balance)}
          </span>
        )}
      </div>

      <div className="h-[220px] w-full">
        {mounted ? (
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="balanceAreaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={strokeColor} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={strokeColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>

              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#52525B", fontSize: 11, fontWeight: 300 }}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#52525B", fontSize: 11, fontWeight: 300 }}
                tickFormatter={(val: number) => formatCompact(val)}
              />

              <Tooltip content={<CustomTooltip />} />

              <Area
                type="monotone"
                dataKey="balance"
                stroke={strokeColor}
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#balanceAreaGradient)"
                isAnimationActive={true}
                animationDuration={800}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] w-full bg-saarthi-elevated/30 rounded-md animate-pulse flex items-center justify-center">
            <span className="text-xs text-saarthi-text-muted font-light">
              Loading balance trend...
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default BalanceChart;
