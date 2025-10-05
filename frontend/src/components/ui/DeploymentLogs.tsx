'use client';

import React, { useEffect, useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';

interface DeployLog {
  deployId: string;
  branch: string;
  actor: string;
  status: string;
  timestamp: string;
  commitHash: string;
}

export const DeploymentLogs: React.FC = () => {
  const [logs, setLogs] = useState<DeployLog[]>([]);
  const [branch, setBranch] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');

  useEffect(() => {
    // For demo, use placeholder data; in real app, use Firestore query with admin rights
    setLogs([
      { deployId: 'dep1', branch: 'main', actor: 'vikash', status: 'success', timestamp: new Date().toISOString(), commitHash: 'abc123' },
      { deployId: 'dep2', branch: 'dev', actor: 'ci-bot', status: 'failed', timestamp: new Date().toISOString(), commitHash: 'def456' },
    ]);
  }, []);

  const filtered = logs.filter(l => (branch === 'all' || l.branch === branch) && (status === 'all' || l.status === status));

  const exportCsv = () => {
    const rows = [['deployId','branch','actor','status','timestamp','commitHash'], ...filtered.map(l => [l.deployId,l.branch,l.actor,l.status,l.timestamp,l.commitHash])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'deployment_logs.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <ZPCard title="Deployment Logs" description="Branch, status, actor, time and commit hash for each deployment">
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={branch} onChange={(e) => setBranch(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md bg-white">
          <option value="all">All Branches</option>
          <option value="main">main</option>
          <option value="dev">dev</option>
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-md bg-white">
          <option value="all">All Status</option>
          <option value="success">success</option>
          <option value="failed">failed</option>
        </select>
        <ZPButton variant="outline" size="sm" onClick={exportCsv}>Export CSV</ZPButton>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left p-3 font-medium">Branch</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Actor</th>
              <th className="text-left p-3 font-medium">Date</th>
              <th className="text-left p-3 font-medium">Commit</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(l => (
              <tr key={l.deployId} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-3">{l.branch}</td>
                <td className="p-3">{l.status}</td>
                <td className="p-3">{l.actor}</td>
                <td className="p-3">{new Date(l.timestamp).toLocaleString()}</td>
                <td className="p-3 font-mono">{l.commitHash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ZPCard>
  );
};


