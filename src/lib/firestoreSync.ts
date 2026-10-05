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
 * Push an entire dataset to Firestore in batches
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
): Promise<{ success: boolean; totalUploaded: number; error?: string }> {
  if (!db) {
    throw new Error('Firestore is not initialized. Please check your Firebase configuration.');
  }

  try {
    const collectionsToSync: { name: string; items: any[]; isSingleDoc?: boolean }[] = [
      { name: 'categories', items: data.categories },
      { name: 'subcategories', items: data.subcategories },
      { name: 'zones', items: data.zones },
      { name: 'coupons', items: data.coupons },
      { name: 'sliders', items: data.sliders },
      { name: 'services', items: data.services },
      { name: 'providers', items: data.providers },
      { name: 'orders', items: data.orders },
      { name: 'users', items: data.users },
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
        await setDoc(docRef, group.items[0], { merge: true });
        completedCount++;
        continue;
      }

      // Batch upload items in chunks of 250 (Firestore limit is 500)
      const chunkSize = 250;
      for (let i = 0; i < group.items.length; i += chunkSize) {
        const chunk = group.items.slice(i, i + chunkSize);
        const batch = writeBatch(db);

        for (const item of chunk) {
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
    return { success: false, totalUploaded: 0, error: err?.message || 'Upload failed' };
  }
}

/**
 * Update or insert a single document in Firestore
 */
export async function syncDocToFirestore(collectionName: string, docId: string, data: any): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, collectionName, String(docId));
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (e) {
    console.error(`Error syncing ${collectionName}/${docId} to Firestore:`, e);
    return false;
  }
}

/**
 * Remove a document from Firestore
 */
export async function removeDocFromFirestore(collectionName: string, docId: string): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, collectionName, String(docId));
    await deleteDoc(docRef);
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
