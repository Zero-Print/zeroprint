'use client';

import { db } from './firebase';
import { collection, doc, setDoc, addDoc, serverTimestamp } from 'firebase/firestore';
import type { CarbonLog, MentalHealthLog, AnimalWelfareLog, DigitalTwinSimulation, MSMEReport } from '../../../types/trackers';

// Generic pass-through converter (keeps types at call-sites)
const passthroughConverter = {
  toFirestore: (data: any) => data,
  fromFirestore: (snap: any) => snap.data(),
};

export async function logCarbonAction(userId: string, actionType: CarbonLog['actionType'], value: number) {
  if (!db) return; // SSR safe
  const ref = collection(db, 'carbonLogs').withConverter(passthroughConverter);
  const log: CarbonLog = {
    logId: '',
    userId,
    actionType,
    value,
    co2Saved: 0,
    coinsEarned: 0,
    timestamp: new Date().toISOString(),
  };
  const added = await addDoc(ref as any, log);
  await setDoc(doc(db, 'carbonLogs', added.id), { logId: added.id }, { merge: true });
  return added.id;
}

export async function logMoodCheckin(userId: string, mood: number, note?: string) {
  if (!db) return;
  const ref = collection(db, 'mentalHealthLogs').withConverter(passthroughConverter);
  const log: MentalHealthLog = {
    logId: '',
    userId,
    mood,
    note,
    ecoMindScore: Math.max(0, Math.min(100, Math.round(mood * 20))),
    timestamp: new Date().toISOString(),
  };
  const added = await addDoc(ref as any, log);
  await setDoc(doc(db, 'mentalHealthLogs', added.id), { logId: added.id }, { merge: true });
  return added.id;
}

export async function logAnimalAction(userId: string, actions: string[]) {
  if (!db) return;
  const ref = collection(db, 'animalWelfareLogs').withConverter(passthroughConverter);
  const log: AnimalWelfareLog = {
    logId: '',
    userId,
    actions,
    kindnessScore: actions.length * 10,
    coinsEarned: actions.length * 5,
    timestamp: new Date().toISOString(),
  };
  const added = await addDoc(ref as any, log);
  await setDoc(doc(db, 'animalWelfareLogs', added.id), { logId: added.id }, { merge: true });
  return added.id;
}

export async function runDigitalTwinSimulation(userId: string, inputConfig: Record<string, any>) {
  if (!db) return;
  const ref = collection(db, 'digitalTwinSimulations').withConverter(passthroughConverter);
  const sim: DigitalTwinSimulation = {
    simId: '',
    userId,
    inputConfig,
    results: { co2Saved: 0, energySaved: 0, comparison: {} },
    createdAt: new Date().toISOString(),
  };
  const added = await addDoc(ref as any, sim);
  await setDoc(doc(db, 'digitalTwinSimulations', added.id), { simId: added.id }, { merge: true });
  return added.id;
}

export async function generateMSMEReport(orgId: string, month: string, metrics: Omit<MSMEReport, 'reportId' | 'orgId' | 'month' | 'createdAt' | 'reportUrl'> & { reportUrl?: string }) {
  if (!db) return;
  const ref = collection(db, 'msmeReports').withConverter(passthroughConverter);
  const report: MSMEReport = {
    reportId: '',
    orgId,
    month,
    energyUsage: metrics.energyUsage,
    wasteGenerated: metrics.wasteGenerated,
    transportFuel: metrics.transportFuel,
    sustainabilityScore: metrics.sustainabilityScore,
    reportUrl: metrics.reportUrl || '',
    createdAt: new Date().toISOString(),
  };
  const added = await addDoc(ref as any, report);
  await setDoc(doc(db, 'msmeReports', added.id), { reportId: added.id }, { merge: true });
  return added.id;
}


