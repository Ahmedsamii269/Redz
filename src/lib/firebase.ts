import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
console.log("Firebase initialized for project:", firebaseConfig.projectId);

// Initialize Firestore with the specific database ID from config
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
export const auth = getAuth();
export const googleProvider = new GoogleAuthProvider();

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'system', 'connection_test'));
    console.log("Firebase connection established successfully.");
  } catch (error: any) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn("Firebase client in offline cache mode.");
    }
  }
}
testConnection();

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

export const logout = () => signOut(auth);
