import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, collection, getDocs, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import type { Reason } from '../types/reason';

// Type for user view history
export interface ViewCounts {
    [reasonId: string]: number;
}

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

// Storage
export const storage = getStorage(app);

// Upload image to Firebase Storage
export async function uploadImage(file: File): Promise<string> {
    const filename = `reasons/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, filename);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
}

// Fetch reasons from Firestore
export async function fetchReasons(): Promise<Reason[]> {
    try {
        const reasonsCollection = collection(db, 'reasons');
        const snapshot = await getDocs(reasonsCollection);

        return snapshot.docs.map((docSnapshot) => ({
            id: docSnapshot.id,
            ...docSnapshot.data(),
        })) as Reason[];
    } catch (error) {
        console.error('Error fetching reasons from Firestore:', error);
        return [];
    }
}

// Get view history for a user
export async function getUserViewHistory(userId: string): Promise<ViewCounts> {
    try {
        const userViewDoc = doc(db, 'userViewHistory', userId);
        const snapshot = await getDoc(userViewDoc);

        if (snapshot.exists()) {
            return snapshot.data() as ViewCounts;
        }
        return {};
    } catch (error) {
        console.error('Error fetching user view history:', error);
        return {};
    }
}

// Increment view count for a specific reason
export async function incrementViewCount(userId: string, reasonId: string): Promise<void> {
    try {
        const userViewDoc = doc(db, 'userViewHistory', userId);
        const snapshot = await getDoc(userViewDoc);

        if (snapshot.exists()) {
            // Document exists, update the specific reasonId count
            const currentData = snapshot.data() as ViewCounts;
            const currentCount = currentData[reasonId] || 0;
            await updateDoc(userViewDoc, {
                [reasonId]: currentCount + 1
            });
        } else {
            // Document doesn't exist, create it with initial count
            await setDoc(userViewDoc, {
                [reasonId]: 1
            });
        }
    } catch (error) {
        console.error('Error incrementing view count:', error);
    }
}
