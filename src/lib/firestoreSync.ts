import { 
  collection, doc, setDoc, getDocs, onSnapshot, writeBatch, deleteDoc, updateDoc 
} from 'firebase/firestore';
import { db } from './firebase';

export interface SyncProgress {
  total: number;
  completed: number;
  currentCollection: string;
}

/**
 * Recursively sanitizes data for Firestore by removing any undefined values.
 * Firestore strictly rejects undefined in setDoc, writeBatch, and updateDoc.
 */
export function cleanForFirestore<T>(val: T): T {
  if (val === undefined) {
    return null as any;
  }
  if (val === null) {
    return null as any;
  }
  if (Array.isArray(val)) {
    return val
      .filter(item => item !== undefined)
      .map(item => cleanForFirestore(item)) as any;
  }
  if (typeof val === 'object' && val !== null) {
    if (val instanceof Date) {
      return val.toISOString() as any;
    }
    const cleaned: any = {};
    for (const [key, value] of Object.entries(val)) {
      if (value !== undefined) {
        cleaned[key] = cleanForFirestore(value);
      }
    }
    return cleaned;
  }
  return val;
}

// Map portal collection to mobile app alias collections
const MOBILE_COLLECTION_MAP: Record<string, string[]> = {
  orders: ['durgapur_bookings', 'bookings', 'durgapur_orders'],
  categories: ['durgapur_categories'],
  providers: ['durgapur_professionals'],
  sliders: ['durgapur_sliders'],
  users: ['durgapur_users']
};

/**
 * Push an entire dataset to Firestore in batches (syncs both Web & Android collections)
 */
export async function pushAllSeedDataToFirestore(
  data: {
    categories: any[];
    subcategories: any[];
    zones: any[];
    coupons: any[];
    sliders: any[];
    services: any[];
    providers: any[];
    orders: any[];
    users: any[];
    settings: any;
  },
  onProgress?: (progress: SyncProgress) => void
): Promise<{ success: boolean; totalUploaded: number; error?: string; isPermissionError?: boolean }> {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check your Firebase configuration.');
  }

  try {
    const collectionsToSync: { name: string; items: any[]; isSingleDoc?: boolean }[] = [
      { name: 'categories', items: data.categories },
      { name: 'durgapur_categories', items: data.categories },
      { name: 'subcategories', items: data.subcategories },
      { name: 'zones', items: data.zones },
      { name: 'coupons', items: data.coupons },
      { name: 'sliders', items: data.sliders },
      { name: 'durgapur_sliders', items: data.sliders },
      { name: 'services', items: data.services },
      { name: 'providers', items: data.providers },
      { name: 'durgapur_professionals', items: data.providers },
      { name: 'orders', items: data.orders },
      { name: 'durgapur_bookings', items: data.orders },
      { name: 'bookings', items: data.orders },
      { name: 'users', items: data.users },
      { name: 'durgapur_users', items: data.users },
      { name: 'settings', items: [data.settings], isSingleDoc: true }
    ];

    let totalItems = collectionsToSync.reduce((acc, c) => acc + c.items.length, 0);
    let completedCount = 0;

    for (const group of collectionsToSync) {
      if (onProgress) {
        onProgress({
          total: totalItems,
          completed: completedCount,
          currentCollection: group.name
        });
      }

      if (group.isSingleDoc) {
        const docRef = doc(db, 'settings', 'global');
        const cleanedSettings = cleanForFirestore(group.items[0]);
        await setDoc(docRef, cleanedSettings, { merge: true });
        completedCount++;
        continue;
      }

      // Batch upload items in chunks of 250 (Firestore limit is 500)
      const chunkSize = 250;
      for (let i = 0; i < group.items.length; i += chunkSize) {
        const chunk = group.items.slice(i, i + chunkSize);
        const batch = writeBatch(db);

        for (const rawItem of chunk) {
          const item = cleanForFirestore(rawItem);
          const docId = item.id || `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          const docRef = doc(db, group.name, String(docId));
          batch.set(docRef, item, { merge: true });
        }

        await batch.commit();
        completedCount += chunk.length;

        if (onProgress) {
          onProgress({
            total: totalItems,
            completed: completedCount,
            currentCollection: group.name
          });
        }
      }
    }

    return { success: true, totalUploaded: completedCount };
  } catch (err: any) {
    console.error('Error syncing to Firestore:', err);
    const msg = err?.message || String(err);
    const isPermissionError = 
      err?.code === 'permission-denied' || 
      msg.toLowerCase().includes('permission') || 
      msg.toLowerCase().includes('missing or insufficient');

    return { 
      success: false, 
      totalUploaded: 0, 
      isPermissionError,
      error: isPermissionError 
        ? 'Missing or insufficient permissions: Firestore security rules in your Firebase Console (durgapurfix-1935c) are locked. Update rules to allow read/write and click Publish.'
        : (msg || 'Upload failed') 
    };
  }
}

/**
 * Tests live Firestore write and delete permissions using a harmless test document.
 */
export async function testFirestoreWritePermission(): Promise<{ 
  allowed: boolean; 
  latencyMs: number; 
  error: string | null; 
  isPermissionError: boolean;
}> {
  if (!db) {
    return { allowed: false, latencyMs: 0, error: 'Database client not initialized', isPermissionError: false };
  }

  const startTime = Date.now();
  try {
    const testDocRef = doc(db, '_connection_test', 'permission_ping');
    await setDoc(testDocRef, { timestamp: Date.now(), test: true, initiatedBy: 'admin_panel' });
    // Clean up immediately
    try {
      await deleteDoc(testDocRef);
    } catch (delErr) {
      console.warn('Test document cleanup deferred:', delErr);
    }
    return {
      allowed: true,
      latencyMs: Date.now() - startTime,
      error: null,
      isPermissionError: false
    };
  } catch (err: any) {
    const msg = err?.message || String(err);
    const isPermissionError = 
      err?.code === 'permission-denied' || 
      msg.toLowerCase().includes('permission') || 
      msg.toLowerCase().includes('missing or insufficient');

    return {
      allowed: false,
      latencyMs: Date.now() - startTime,
      error: msg,
      isPermissionError
    };
  }
}

/**
 * Update or insert a single document in Firestore (with dual-sync for mobile collections)
 */
export async function syncDocToFirestore(collectionName: string, docId: string, data: any): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, collectionName, String(docId));
    const cleaned = cleanForFirestore(data);
    await setDoc(docRef, cleaned, { merge: true });

    // Mirror to mobile alias collections if mapped
    const mobileAliases = MOBILE_COLLECTION_MAP[collectionName];
    if (mobileAliases && Array.isArray(mobileAliases)) {
      for (const mobileAlias of mobileAliases) {
        try {
          const aliasRef = doc(db, mobileAlias, String(docId));
          await setDoc(aliasRef, cleaned, { merge: true });
        } catch (aliasErr) {
          console.warn(`Dual sync to ${mobileAlias} warning:`, aliasErr);
        }
      }
    }

    return true;
  } catch (e) {
    console.error(`Error syncing ${collectionName}/${docId} to Firestore:`, e);
    return false;
  }
}

/**
 * Remove a document from Firestore (with dual-delete for mobile collections)
 */
export async function removeDocFromFirestore(collectionName: string, docId: string): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, collectionName, String(docId));
    await deleteDoc(docRef);

    // Mirror delete to mobile alias collections if mapped
    const mobileAliases = MOBILE_COLLECTION_MAP[collectionName];
    if (mobileAliases && Array.isArray(mobileAliases)) {
      for (const mobileAlias of mobileAliases) {
        try {
          const aliasRef = doc(db, mobileAlias, String(docId));
          await deleteDoc(aliasRef);
        } catch (aliasErr) {
          console.warn(`Dual delete from ${mobileAlias} warning:`, aliasErr);
        }
      }
    }

    return true;
  } catch (e) {
    console.error(`Error deleting ${collectionName}/${docId} from Firestore:`, e);
    return false;
  }
}

/**
 * Subscribe to real-time changes in a collection
 */
export function subscribeToCollection<T>(
  collectionName: string, 
  callback: (items: T[]) => void,
  onError?: (err: Error) => void
): () => void {
  if (!db) {
    return () => {};
  }

  const colRef = collection(db, collectionName);
  const unsubscribe = onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ ...docSnap.data(), id: docSnap.id } as T);
      });
      callback(items);
    },
    (error) => {
      console.warn(`Firestore subscription error on ${collectionName}:`, error);
      if (onError) onError(error);
    }
  );

  return unsubscribe;
}

/**
 * Wipes Firestore collections for a clean handover to the production admin.
 */
export async function wipeAllFirestoreCollections(includeCatalog = false): Promise<{ success: boolean; wipedCount: number; error?: string }> {
  if (!db) {
    return { success: false, wipedCount: 0, error: 'Database not initialized' };
  }

  const collectionsToWipe = [
    'orders', 'durgapur_bookings', 'bookings', 'durgapur_orders',
    'users', 'durgapur_users',
    'providers', 'durgapur_professionals',
    'reviews', 'payments', 'withdrawals', 'notifications'
  ];

  if (includeCatalog) {
    collectionsToWipe.push('categories', 'durgapur_categories', 'subcategories', 'services', 'zones', 'coupons', 'sliders', 'durgapur_sliders');
  }

  let totalDeleted = 0;

  for (const colName of collectionsToWipe) {
    try {
      const colRef = collection(db, colName);
      const snapshot = await getDocs(colRef);
      if (snapshot.empty) continue;

      const batch = writeBatch(db);
      snapshot.forEach(docSnap => {
        batch.delete(docSnap.ref);
        totalDeleted++;
      });
      await batch.commit();
    } catch (e) {
      console.warn(`Error wiping ${colName}:`, e);
    }
  }

  return { success: true, wipedCount: totalDeleted };
}
