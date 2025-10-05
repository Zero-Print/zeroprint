import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/modules/auth';
import { CarbonLog, CarbonLogFormData } from '@/types';

export function useCarbonLogs() {
  const [logs, setLogs] = useState<CarbonLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    (async () => {
      if (!user) { setLogs([]); setLoading(false); return; }
      try {
        setLoading(true);
        const res: any = await api.request('/trackers/carbon');
        const data = res?.data || res?.data === undefined ? (res?.data || res) : [];
        setLogs((data?.data || data)?.map((d: any) => ({
          logId: d.logId,
          userId: d.userId,
          transportMode: d.transportMode,
          energyKwh: d.energyKwh,
          wasteKg: d.wasteKg,
          waterLitres: d.waterLitres,
          co2Saved: d.co2Saved,
          createdAt: d.timestamp || d.createdAt,
        })) || []);
        setError(null);
      } catch (e: any) {
        setError(e?.message || 'Failed to fetch carbon logs');
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const addLog = async (logData: CarbonLogFormData): Promise<string> => {
    if (!user) throw new Error('User not authenticated');
    const transportMode = logData.activity?.includes('bike') ? 'bike' : logData.activity?.includes('car') ? 'car' : logData.activity?.includes('bus') ? 'bus' : 'walk';
    const actionType = logData.category as any || 'transport';
    const value = Number(logData.amount) || 0;
    const res: any = await api.request('/trackers/carbon', { method: 'POST', body: JSON.stringify({ actionType, value, description: logData.activity, location: logData.location }) });
    await (async () => { const r: any = await api.request('/trackers/carbon'); setLogs((r?.data || r)?.data || (r?.data || r) || []); })();
    return res?.data?.carbonLog?.logId || res?.data?.logId || '';
  };

  const updateLog = async (_logId: string, _updates: Partial<CarbonLogFormData>): Promise<void> => {
    throw new Error('Update not supported via REST');
  };

  const deleteLog = async (logId: string): Promise<void> => {
    if (!user) throw new Error('User not authenticated');
    await api.request(`/trackers/carbon/${logId}`, { method: 'DELETE' });
    const r: any = await api.request('/trackers/carbon');
    const data = (r?.data || r)?.data || (r?.data || r) || [];
    setLogs(data);
  };

  const getTotalCarbonFootprint = (timeframe?: 'week' | 'month' | 'year'): number => {
    let filteredLogs = logs;
    if (timeframe) {
      const now = new Date();
      const startDate = new Date();
      switch (timeframe) {
        case 'week': startDate.setDate(now.getDate() - 7); break;
        case 'month': startDate.setMonth(now.getMonth() - 1); break;
        case 'year': startDate.setFullYear(now.getFullYear() - 1); break;
      }
      filteredLogs = logs.filter(log => new Date(log.createdAt) >= startDate);
    }
    return filteredLogs.reduce((total, log) => total + (log.co2Saved || 0), 0);
  };

  return { logs, loading, error, addLog, updateLog, deleteLog, getTotalCarbonFootprint };
}
