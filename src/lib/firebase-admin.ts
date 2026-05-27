import {
  initializeApp,
  getApps,
  cert,
  type App,
  type ServiceAccount,
} from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

let adminAppInstance: App | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

function getAdminApp(): App {
  if (adminAppInstance) return adminAppInstance;

  const existingApps = getApps();
  if (existingApps.length > 0) {
    adminAppInstance = existingApps[0];
    return adminAppInstance;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKeyRaw = process.env.FIREBASE_ADMIN_PRIVATE_KEY;

  if (
    !projectId ||
    !clientEmail ||
    !privateKeyRaw ||
    clientEmail === 'REPLACE_ME' ||
    privateKeyRaw === 'REPLACE_ME'
  ) {
    throw new Error(
      'Missing or invalid Firebase Admin environment variables. Ensure FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_CLIENT_EMAIL, and FIREBASE_ADMIN_PRIVATE_KEY are set in .env.local.'
    );
  }

  // Environment variables store literal "\\n" — replace with real newlines
  const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

  const serviceAccount: ServiceAccount = {
    projectId,
    clientEmail,
    privateKey,
  };

  adminAppInstance = initializeApp({ credential: cert(serviceAccount) });
  return adminAppInstance;
}

// Lazy loaded Proxy instances for adminDb and adminAuth
const adminDb = new Proxy({} as Firestore, {
  get(target, prop, receiver) {
    if (!dbInstance) {
      dbInstance = getFirestore(getAdminApp());
    }
    return Reflect.get(dbInstance, prop, receiver);
  },
});

const adminAuth = new Proxy({} as Auth, {
  get(target, prop, receiver) {
    if (!authInstance) {
      authInstance = getAuth(getAdminApp());
    }
    return Reflect.get(authInstance, prop, receiver);
  },
});

export { adminDb, adminAuth };

