import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  startAfter,
  updateDoc,
  where,
  Timestamp,
  type DocumentSnapshot,
  type QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  User,
  Wallet,
  Transaction,
  CarbonLog,
  MentalHealthLog,
  AnimalWelfareLog,
  DigitalTwinSimulation,
  MSMEReport,
  AuditLog,
  ActivityLog,
  Leaderboard,
  Reward,
  Redemption,
  AdminConfig,
  Ward,
  School,
  MSME,
  GameScore,
  Game,
  Subscription,
  Payment,
} from '@/types';

// ============================================================================
// PAGINATION HELPER
// ============================================================================

export interface PaginationOptions {
  pageSize?: number;
  lastDoc?: DocumentSnapshot;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
}

export interface PaginatedResult<T> {
  data: T[];
  lastDoc?: DocumentSnapshot;
  hasMore: boolean;
  total?: number;
}

// ============================================================================
// CORE COLLECTIONS
// ============================================================================

// Users Collection
export const usersCollection = {
  async getById(userId: string): Promise<User | null> {
    const docRef = doc(db, 'users', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { userId, ...docSnap.data() } as User : null;
  },

  async getByRole(role: string, options: PaginationOptions = {}): Promise<PaginatedResult<User>> {
    const { pageSize = 20, lastDoc, orderByField = 'createdAt', orderDirection = 'desc' } = options;
    
    const constraints: QueryConstraint[] = [
      where('role', '==', role),
      orderBy(orderByField, orderDirection),
      limit(pageSize)
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, 'users'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs.map(doc => ({
      userId: doc.id,
      ...doc.data()
    } as User));

    return {
      data,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === pageSize
    };
  },

  async create(userData: Omit<User, 'userId'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'users'), {
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    });
    return docRef.id;
  },

  async update(userId: string, updates: Partial<User>): Promise<void> {
    const docRef = doc(db, 'users', userId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }
};

// Wallets Collection
export const walletsCollection = {
  async getByUserId(userId: string): Promise<Wallet | null> {
    const docRef = doc(db, 'wallets', userId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { userId, ...docSnap.data() } as Wallet : null;
  },

  async updateBalance(userId: string, newBalance: number): Promise<void> {
    const docRef = doc(db, 'wallets', userId);
    await updateDoc(docRef, {
      balance: newBalance,
      updatedAt: Timestamp.now()
    });
  },

  async getTransactions(userId: string, options: PaginationOptions = {}): Promise<PaginatedResult<Transaction>> {
    const { pageSize = 20, lastDoc, orderByField = 'createdAt', orderDirection = 'desc' } = options;
    
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy(orderByField, orderDirection),
      limit(pageSize)
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, 'transactions'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs.map(doc => ({
      transactionId: doc.id,
      ...doc.data()
    } as Transaction));

    return {
      data,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === pageSize
    };
  }
};

// ============================================================================
// TRACKER COLLECTIONS
// ============================================================================

// Carbon Logs Collection
export const carbonLogsCollection = {
  async getByUserId(userId: string, options: PaginationOptions = {}): Promise<PaginatedResult<CarbonLog>> {
    const { pageSize = 50, lastDoc, orderByField = 'createdAt', orderDirection = 'desc' } = options;
    
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy(orderByField, orderDirection),
      limit(pageSize)
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, 'carbonLogs'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs.map(doc => ({
      logId: doc.id,
      ...doc.data()
    } as CarbonLog));

    return {
      data,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === pageSize
    };
  },

  async getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<CarbonLog[]> {
    const q = query(
      collection(db, 'carbonLogs'),
      where('userId', '==', userId),
      where('createdAt', '>=', Timestamp.fromDate(startDate)),
      where('createdAt', '<=', Timestamp.fromDate(endDate)),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      logId: doc.id,
      ...doc.data()
    } as CarbonLog));
  },

  async create(logData: Omit<CarbonLog, 'logId'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'carbonLogs'), {
      ...logData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }
};

// Mental Health Logs Collection
export const mentalHealthLogsCollection = {
  async getByUserId(userId: string, options: PaginationOptions = {}): Promise<PaginatedResult<MentalHealthLog>> {
    const { pageSize = 50, lastDoc, orderByField = 'createdAt', orderDirection = 'desc' } = options;
    
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy(orderByField, orderDirection),
      limit(pageSize)
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, 'mentalHealthLogs'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs.map(doc => ({
      logId: doc.id,
      ...doc.data()
    } as MentalHealthLog));

    return {
      data,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === pageSize
    };
  },

  async create(logData: Omit<MentalHealthLog, 'logId'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'mentalHealthLogs'), {
      ...logData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }
};

// Animal Welfare Logs Collection
export const animalWelfareLogsCollection = {
  async getByUserId(userId: string, options: PaginationOptions = {}): Promise<PaginatedResult<AnimalWelfareLog>> {
    const { pageSize = 50, lastDoc, orderByField = 'createdAt', orderDirection = 'desc' } = options;
    
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy(orderByField, orderDirection),
      limit(pageSize)
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, 'animalWelfareLogs'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs.map(doc => ({
      logId: doc.id,
      ...doc.data()
    } as AnimalWelfareLog));

    return {
      data,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === pageSize
    };
  },

  async create(logData: Omit<AnimalWelfareLog, 'logId'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'animalWelfareLogs'), {
      ...logData,
      createdAt: Timestamp.now()
    });
    return docRef.id;
  }
};

// ============================================================================
// LEADERBOARDS COLLECTION
// ============================================================================

export const leaderboardsCollection = {
  async getByScope(scope: string, period: string): Promise<Leaderboard | null> {
    const docRef = doc(db, 'leaderboards', `${scope}_${period}`);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docRef.id, ...docSnap.data() } as Leaderboard : null;
  },

  async getTopUsers(scope: string, period: string, limit: number = 10): Promise<any[]> {
    const leaderboard = await this.getByScope(scope, period);
    return leaderboard?.rankings?.slice(0, limit) || [];
  }
};

// ============================================================================
// AUDIT & ACTIVITY LOGS
// ============================================================================

export const auditLogsCollection = {
  async create(logData: Omit<AuditLog, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'auditLogs'), {
      ...logData,
      timestamp: Timestamp.now()
    });
    return docRef.id;
  },

  async getByUserId(userId: string, options: PaginationOptions = {}): Promise<PaginatedResult<AuditLog>> {
    const { pageSize = 50, lastDoc, orderByField = 'timestamp', orderDirection = 'desc' } = options;
    
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy(orderByField, orderDirection),
      limit(pageSize)
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, 'auditLogs'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as AuditLog));

    return {
      data,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === pageSize
    };
  }
};

export const activityLogsCollection = {
  async create(logData: Omit<ActivityLog, 'id'>): Promise<string> {
    const docRef = await addDoc(collection(db, 'activityLogs'), {
      ...logData,
      timestamp: Timestamp.now()
    });
    return docRef.id;
  },

  async getByUserId(userId: string, options: PaginationOptions = {}): Promise<PaginatedResult<ActivityLog>> {
    const { pageSize = 50, lastDoc, orderByField = 'timestamp', orderDirection = 'desc' } = options;
    
    const constraints: QueryConstraint[] = [
      where('userId', '==', userId),
      orderBy(orderByField, orderDirection),
      limit(pageSize)
    ];

    if (lastDoc) {
      constraints.push(startAfter(lastDoc));
    }

    const q = query(collection(db, 'activityLogs'), ...constraints);
    const querySnapshot = await getDocs(q);
    
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as ActivityLog));

    return {
      data,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1],
      hasMore: querySnapshot.docs.length === pageSize
    };
  }
};

// ============================================================================
// ORGANIZATION COLLECTIONS
// ============================================================================

export const wardsCollection = {
  async getAll(): Promise<Ward[]> {
    const q = query(collection(db, 'wards'), orderBy('name'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      wardId: doc.id,
      ...doc.data()
    } as Ward));
  },

  async getById(wardId: string): Promise<Ward | null> {
    const docRef = doc(db, 'wards', wardId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { wardId, ...docSnap.data() } as Ward : null;
  }
};

export const schoolsCollection = {
  async getByWardId(wardId: string): Promise<School[]> {
    const q = query(
      collection(db, 'schools'),
      where('wardId', '==', wardId),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      schoolId: doc.id,
      ...doc.data()
    } as School));
  },

  async getById(schoolId: string): Promise<School | null> {
    const docRef = doc(db, 'schools', schoolId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { schoolId, ...docSnap.data() } as School : null;
  }
};

export const msmesCollection = {
  async getByWardId(wardId: string): Promise<MSME[]> {
    const q = query(
      collection(db, 'msmes'),
      where('wardId', '==', wardId),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      msmeId: doc.id,
      ...doc.data()
    } as MSME));
  },

  async getById(msmeId: string): Promise<MSME | null> {
    const docRef = doc(db, 'msmes', msmeId);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { msmeId, ...docSnap.data() } as MSME : null;
  }
};

// ============================================================================
// EXPORT HELPER FUNCTIONS
// ============================================================================

export const exportHelpers = {
  // Get all data for a user for export
  async getUserExportData(userId: string) {
    const [user, wallet, carbonLogs, mentalHealthLogs, animalWelfareLogs] = await Promise.all([
      usersCollection.getById(userId),
      walletsCollection.getByUserId(userId),
      carbonLogsCollection.getByUserId(userId, { pageSize: 1000 }),
      mentalHealthLogsCollection.getByUserId(userId, { pageSize: 1000 }),
      animalWelfareLogsCollection.getByUserId(userId, { pageSize: 1000 })
    ]);

    return {
      user,
      wallet,
      carbonLogs: carbonLogs.data,
      mentalHealthLogs: mentalHealthLogs.data,
      animalWelfareLogs: animalWelfareLogs.data
    };
  },

  // Get ward data for government export
  async getWardExportData(wardId: string) {
    const [ward, schools, msmes] = await Promise.all([
      wardsCollection.getById(wardId),
      schoolsCollection.getByWardId(wardId),
      msmesCollection.getByWardId(wardId)
    ]);

    return {
      ward,
      schools,
      msmes
    };
  }
};
