/**
 * Minimal Firebase/Firestore wiring for the Fleet app.
 *
 * Only the pieces required by `messagingService.ts` are initialized here.
 * The rest of the Fleet app continues to run on mock data via FleetProvider.
 *
 * Firestore collections used (shared with HQ / VelozOS platform):
 *   - conversations
 *   - conversationParticipants
 *   - messages
 *
 * No new collections are created by this module — it only opens handles to the
 * platform-shared collections listed above.
 */
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? "",
};

let app: FirebaseApp | null = null;
let db: Firestore | null = null;

/**
 * Lazily initialize Firebase once. Returns a null Firestore handle when the
 * required environment variables are absent so the rest of the app remains
 * fully functional in mock/preview builds. `messagingService.ts` guards every
 * call site against a null db.
 */
function ensureFirebase(): Firestore | null {
  if (db) return db;
  if (!firebaseConfig.projectId || !firebaseConfig.apiKey) return null;
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  db = getFirestore(app);
  return db;
}

/** Firestore handle, or null when Firebase is not configured in this env. */
export function getFleetDb(): Firestore | null {
  return ensureFirebase();
}

export { app as fleetFirebaseApp };
