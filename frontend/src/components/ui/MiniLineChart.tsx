'use client';

import React from 'react';

interface MiniLineChartProps {
  data: number[];
  width?: number;
  height?: number;
  stroke?: string;
  fill?: string;
  strokeWidth?: number;
  className?: string;
  ariaLabel?: string;
}

export function MiniLineChart({
  data,
  width = 240,
  height = 64,
  stroke = '#2563EB',
  fill = 'rgba(37, 99, 235, 0.15)',
  strokeWidth = 2,
  className = '',
  ariaLabel = 'trend chart'
}: MiniLineChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className={`w-[${width}px] h-[${height}px] bg-gray-50 rounded ${className}`} />
    );
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = 4;
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const points = data.map((v, i) => {
    const x = padding + (i / (data.length - 1)) * innerW;
    const y = padding + innerH - ((v - min) / range) * innerH;
    return `${x},${y}`;
  }).join(' ');

  // Area path (simple baseline to bottom)
  const first = points.split(' ')[0];
  const last = points.split(' ')[points.split(' ').length - 1];
  const areaPath = `M ${first} L ${points} L ${last.split(',')[0]},${height - padding} L ${first.split(',')[0]},${height - padding} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={ariaLabel}
      className={className}
    >
      <defs>
        <linearGradient id="miniLineGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#miniLineGradient)" />
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        points={points}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default MiniLineChart;


