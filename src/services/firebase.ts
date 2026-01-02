import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import type { Reason } from '../types/reason';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// Firestore
export const db = getFirestore(app);

// Fetch reasons from Firestore
export async function fetchReasons(): Promise<Reason[]> {
    try {
        const reasonsCollection = collection(db, 'reasons');
        const snapshot = await getDocs(reasonsCollection);

        return snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Reason[];
    } catch (error) {
        console.error('Error fetching reasons from Firestore:', error);
        return [];
    }
}
