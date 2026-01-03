import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

interface UseAdminResult {
    isAdmin: boolean;
    isChecking: boolean;
}

export function useAdmin(email: string | null | undefined): UseAdminResult {
    const [isAdmin, setIsAdmin] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        async function checkAdmin() {
            if (!email) {
                setIsAdmin(false);
                setIsChecking(false);
                return;
            }

            setIsChecking(true);
            try {
                const configDoc = await getDoc(doc(db, 'config', 'admins'));

                if (configDoc.exists()) {
                    const data = configDoc.data();
                    const adminEmails: string[] = (data.emails || []).map((e: string) => e.toLowerCase());
                    setIsAdmin(adminEmails.includes(email.toLowerCase()));
                } else {
                    setIsAdmin(false);
                }
            } catch (error) {
                console.error('Error checking admin status:', error);
                setIsAdmin(false);
            } finally {
                setIsChecking(false);
            }
        }

        checkAdmin();
    }, [email]);

    return { isAdmin, isChecking };
}
