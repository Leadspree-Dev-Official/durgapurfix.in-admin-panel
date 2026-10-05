import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getFirestore, Firestore, doc, getDocFromServer } from 'firebase/firestore';
import { getAuth, Auth } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

let app: FirebaseApp | null = null;
let db: Firestore | null = null;
let auth: Auth | null = null;

try {
  if (firebaseConfig && firebaseConfig.projectId) {
    app = getApps().length > 0 ? getApp() : initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    });

    if (firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)') {
      db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
    } else {
      db = getFirestore(app);
    }

    auth = getAuth(app);
  }
} catch (err) {
  console.warn('Firebase initialization skipped or failed:', err);
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const currentAuth = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentAuth?.uid,
      email: currentAuth?.email,
      emailVerified: currentAuth?.emailVerified,
      isAnonymous: currentAuth?.isAnonymous,
      tenantId: currentAuth?.tenantId,
      providerInfo: currentAuth?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export interface BackendConnectionResult {
  connected: boolean;
  projectId: string;
  databaseId: string;
  latencyMs: number;
  error: string | null;
  timestamp: string;
}

export async function checkBackendConnection(): Promise<BackendConnectionResult> {
  const startTime = Date.now();
  const projectId = firebaseConfig?.projectId || '';
  const databaseId = firebaseConfig?.firestoreDatabaseId || '(default)';

  if (!db) {
    return {
      connected: false,
      projectId,
      databaseId,
      latencyMs: 0,
      error: 'Firestore client is not initialized',
      timestamp: new Date().toISOString()
    };
  }

  try {
    // Validate live connection using getDocFromServer as required by Firebase skill
    await getDocFromServer(doc(db, 'test', 'connection'));
    return {
      connected: true,
      projectId,
      databaseId,
      latencyMs: Date.now() - startTime,
      error: null,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    // A document not found (does not exist) still confirms connection succeeded!
    // Only if error indicates network failure or offline is it disconnected
    if (error?.code === 'unavailable' || error?.message?.includes('the client is offline') || error?.code === 'failed-precondition') {
      return {
        connected: false,
        projectId,
        databaseId,
        latencyMs: Date.now() - startTime,
        error: error.message || String(error),
        timestamp: new Date().toISOString()
      };
    }
    // Any permission or query response from server means server is reached
    return {
      connected: true,
      projectId,
      databaseId,
      latencyMs: Date.now() - startTime,
      error: null,
      timestamp: new Date().toISOString()
    };
  }
}

// Initial boot connection test as required by Firebase skill
if (typeof window !== 'undefined' && db) {
  checkBackendConnection().then(res => {
    if (res.connected) {
      console.log(`[Firebase Firestore] Backend connected successfully to database "${res.databaseId}" in project "${res.projectId}" (${res.latencyMs}ms).`);
    } else {
      console.warn('[Firebase Firestore] Backend connection warning:', res.error);
    }
  }).catch(err => {
    console.error('[Firebase Firestore] Test connection failed:', err);
  });
}

export { app, db, auth };
