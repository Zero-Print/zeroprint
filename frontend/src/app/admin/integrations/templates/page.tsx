'use client';

import React, { useEffect, useState } from 'react';
import { ZPCard } from '@/components/ZPCard';
import { ZPButton } from '@/components/ZPButton';
import api from '@/lib/api';

export default function NotificationTemplatesPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [templateId, setTemplateId] = useState('reward_redeemed');
  const [channel, setChannel] = useState('email');
  const [subject, setSubject] = useState('You redeemed {{rewardTitle}}');
  const [body, setBody] = useState('<p>Hi {{name}},</p><p>Your code: {{voucherCode}}</p>');

  useEffect(() => {
    (async () => {
      const res: any = await api.request('/admin/integrations/templates');
      setTemplates(res?.data || []);
    })();
  }, []);

  const save = async () => {
    await api.request('/admin/integrations/templates', { method: 'POST', body: JSON.stringify({ templateId, channel, subject, body }) });
    const res: any = await api.request('/admin/integrations/templates');
    setTemplates(res?.data || []);
    alert('Template saved');
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Notification Templates</h1>
      <ZPCard className="p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input value={templateId} onChange={e => setTemplateId(e.target.value)} className="px-3 py-2 border rounded" placeholder="templateId" />
          <select value={channel} onChange={e => setChannel(e.target.value)} className="px-3 py-2 border rounded bg-white">
            <option value="email">email</option>
            <option value="sms">sms</option>
            <option value="push">push</option>
          </select>
          <input value={subject} onChange={e => setSubject(e.target.value)} className="px-3 py-2 border rounded col-span-1 sm:col-span-2" placeholder="subject" />
          <textarea value={body} onChange={e => setBody(e.target.value)} className="w-full h-64 border rounded p-2 font-mono text-sm col-span-1 sm:col-span-2" placeholder="HTML body with {{variables}}" />
        </div>
        <div className="flex justify-end">
          <ZPButton onClick={save}>Save</ZPButton>
        </div>
      </ZPCard>
      <ZPCard title="Templates" className="p-4 space-y-2">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Template ID</th>
              <th className="text-left p-2">Channel</th>
              <th className="text-left p-2">Subject</th>
              <th className="text-left p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {templates.map(t => (
              <tr key={t.templateId} className="border-b">
                <td className="p-2">{t.templateId}</td>
                <td className="p-2">{t.channel}</td>
                <td className="p-2 truncate max-w-xs">{t.subject}</td>
                <td className="p-2">
                  <div className="flex gap-2">
                    <ZPButton size="sm" variant="outline" onClick={() => { setTemplateId(t.templateId); setChannel(t.channel); setSubject(t.subject || ''); setBody(t.body || ''); }}>Edit</ZPButton>
                    <ZPButton size="sm" variant="outline" onClick={async () => { await api.request(`/admin/integrations/templates/${t.templateId}`, { method: 'DELETE' }); const res: any = await api.request('/admin/integrations/templates'); setTemplates(res?.data || []); }}>Delete</ZPButton>
                  </div>
                </td>
              </tr>
            ))}
            {templates.length === 0 && (
              <tr><td colSpan={4} className="p-3 text-center text-gray-500">No templates</td></tr>
            )}
          </tbody>
        </table>
      </ZPCard>
    </div>
  );
}


