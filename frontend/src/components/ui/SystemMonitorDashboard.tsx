'use client';

import React, { useState, useEffect } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import { ZPBadge } from '@/components/ZPBadge';
import { TrackerCard } from '@/components/ui/TrackerCard';

export function SystemMonitorDashboard() {
  const [systemMetrics, setSystemMetrics] = useState({
    uptime: 99.95,
    responseTime: 124,
    errorRate: 0.02,
    activeUsers: 1248,
    cpuUsage: 42,
    memoryUsage: 68,
    diskUsage: 34,
    networkTraffic: 1.2,
  });

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemMetrics(prev => ({
        ...prev,
        uptime: parseFloat((99.9 + Math.random() * 0.1).toFixed(2)),
        responseTime: Math.floor(100 + Math.random() * 100),
        errorRate: parseFloat((Math.random() * 0.1).toFixed(2)),
        activeUsers: Math.floor(1200 + Math.random() * 100),
        cpuUsage: Math.floor(30 + Math.random() * 40),
        memoryUsage: Math.floor(60 + Math.random() * 20),
        diskUsage: Math.floor(30 + Math.random() * 10),
        networkTraffic: parseFloat((1 + Math.random() * 2).toFixed(1)),
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getHealthStatus = (value: number, thresholds: { good: number; warning: number }) => {
    if (value >= thresholds.good) return 'good';
    if (value >= thresholds.warning) return 'warning';
    return 'critical';
  };

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthVariant = (status: string) => {
    switch (status) {
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'danger';
      default: return 'default';
    }
  };

  // Use a fixed date to avoid hydration mismatches
  const fixedDate = new Date('2023-01-01T00:00:00Z');

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">System Monitor</h1>
        <p className="text-gray-600">Real-time monitoring of platform performance and health</p>
      </div>

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <ZPCard className="border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Uptime</p>
              <p className="text-2xl font-bold">{systemMetrics.uptime}%</p>
            </div>
            <ZPBadge variant={getHealthVariant(getHealthStatus(systemMetrics.uptime, { good: 99.9, warning: 99.5 }))}>
              {getHealthStatus(systemMetrics.uptime, { good: 99.9, warning: 99.5 })}
            </ZPBadge>
          </div>
        </ZPCard>
        
        <ZPCard className="border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Response Time</p>
              <p className="text-2xl font-bold">{systemMetrics.responseTime}ms</p>
            </div>
            <ZPBadge variant={getHealthVariant(getHealthStatus(systemMetrics.responseTime, { good: 200, warning: 500 }))}>
              {getHealthStatus(systemMetrics.responseTime, { good: 200, warning: 500 })}
            </ZPBadge>
          </div>
        </ZPCard>
        
        <ZPCard className="border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Error Rate</p>
              <p className="text-2xl font-bold">{systemMetrics.errorRate}%</p>
            </div>
            <ZPBadge variant={getHealthVariant(getHealthStatus(100 - systemMetrics.errorRate, { good: 99.9, warning: 99.5 }))}>
              {getHealthStatus(100 - systemMetrics.errorRate, { good: 99.9, warning: 99.5 })}
            </ZPBadge>
          </div>
        </ZPCard>
        
        <ZPCard className="border-l-4 border-purple-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 mb-1">Active Users</p>
              <p className="text-2xl font-bold">{systemMetrics.activeUsers.toLocaleString()}</p>
            </div>
            <ZPBadge variant="info">Live</ZPBadge>
          </div>
        </ZPCard>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <TrackerCard
          type="carbon"
          title="Server Performance"
          metrics={[
            { label: 'CPU Usage', value: systemMetrics.cpuUsage, unit: '%' },
            { label: 'Memory Usage', value: systemMetrics.memoryUsage, unit: '%' },
            { label: 'Disk Usage', value: systemMetrics.diskUsage, unit: '%' },
          ]}
          trend="stable"
          lastUpdated={fixedDate}
        />

        <TrackerCard
          type="mental-health"
          title="Network Metrics"
          metrics={[
            { label: 'Network Traffic', value: systemMetrics.networkTraffic, unit: 'Gbps' },
            { label: 'Connections', value: 1248, unit: 'active' },
            { label: 'Bandwidth', value: 8.4, unit: 'TB' },
          ]}
          trend="improving"
          lastUpdated={fixedDate}
        />

        <TrackerCard
          type="animal-welfare"
          title="Application Health"
          metrics={[
            { label: 'API Success Rate', value: 99.8, unit: '%' },
            { label: 'Database Latency', value: 12, unit: 'ms' },
            { label: 'Cache Hit Rate', value: 92.4, unit: '%' },
          ]}
          trend="improving"
          lastUpdated={fixedDate}
        />
      </div>

      {/* Resource Usage Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ZPCard title="CPU & Memory Usage" description="Real-time resource utilization">
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">CPU Usage</span>
                <span className="text-sm text-gray-500">{systemMetrics.cpuUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full" 
                  style={{ width: `${systemMetrics.cpuUsage}%` }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Memory Usage</span>
                <span className="text-sm text-gray-500">{systemMetrics.memoryUsage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full" 
                  style={{ width: `${systemMetrics.memoryUsage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </ZPCard>

        <ZPCard title="System Alerts" description="Recent system events and warnings">
          <div className="space-y-4">
            {[
              { 
                message: 'High CPU usage detected on web servers', 
                severity: 'warning', 
                time: '2 minutes ago' 
              },
              { 
                message: 'Database backup completed successfully', 
                severity: 'success', 
                time: '15 minutes ago' 
              },
              { 
                message: 'New user registration spike', 
                severity: 'info', 
                time: '1 hour ago' 
              },
              { 
                message: 'SSL certificate expires in 30 days', 
                severity: 'warning', 
                time: '2 hours ago' 
              },
            ].map((alert, index) => (
              <div key={index} className="flex items-start p-3 rounded-lg border-l-4 bg-gray-50">
                <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 mr-3 ${
                  alert.severity === 'success' ? 'bg-green-500' :
                  alert.severity === 'warning' ? 'bg-yellow-500' :
                  alert.severity === 'info' ? 'bg-blue-500' : 'bg-red-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{alert.message}</p>
                  <p className="text-xs text-gray-500">{alert.time}</p>
                </div>
              </div>
            ))}
          </div>
        </ZPCard>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-3">
        <ZPButton variant="outline">Export Metrics</ZPButton>
        <ZPButton variant="primary">Refresh Data</ZPButton>
      </div>
    </div>
  );
}