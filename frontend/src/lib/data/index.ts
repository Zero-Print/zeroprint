// ZeroPrint Data Layer - Main Export
// Centralized access to all data operations

import { doc, setDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { activityLogsCollection, auditLogsCollection, usersCollection } from './collections';
import type { ActivityLog, AuditLog, User } from '@/types';

// Collection helpers
export * from './collections';

// Logging system
export * from './logging';

// Analytics and aggregations
export * from './analytics';

export class ZeroPrintDataLayer {
  activityLogs = {
    async getUserActivities(userId: string, limit = 10) {
      if (!userId) {
        return [] as ActivityLog[];
      }

      const result = await activityLogsCollection.getByUserId(userId, { pageSize: limit });
      const logs = (result.data ?? []) as ActivityLog[];
      return logs.slice(0, limit);
    },
  };

  auditLogs = {
    async logWalletTransaction(userId: string, type: string, metadata: Record<string, unknown> = {}) {
      if (!userId) {
        return;
      }

      const transactionId = (metadata as { transactionId?: unknown }).transactionId;
      const entityIdRef = typeof transactionId === 'string' ? transactionId : userId;

      const auditLog: Omit<AuditLog, 'auditId'> = {
        userId,
        action: `wallet_${type}`,
        entityType: 'wallet',
        entityId: entityIdRef,
        newValue: metadata,
        timestamp: new Date().toISOString(),
      };

      await auditLogsCollection.create(auditLog);
    },
  };

  async updateUserData(userId: string, updates: Partial<User>) {
    if (!userId) {
      throw new Error('updateUserData requires a valid userId');
    }

    await usersCollection.update(userId, updates);
  }

  async updateEntityData(entityId: string, updates: Record<string, unknown>) {
    if (!entityId) {
      throw new Error('updateEntityData requires a valid entityId');
    }

    const snapshotRef = doc(db, 'entitySnapshots', entityId);
    await setDoc(snapshotRef, {
      entityId,
      updatedAt: Timestamp.now(),
      ...updates,
    }, { merge: true });
  }
}

export default ZeroPrintDataLayer;
