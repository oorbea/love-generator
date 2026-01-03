import { useState, useEffect } from 'react';
import { isEmailAllowed } from '../config/allowedEmails';

interface UseAuthorizationResult {
    isAuthorized: boolean;
    isChecking: boolean;
}

export function useAuthorization(email: string | null | undefined): UseAuthorizationResult {
    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        async function checkAuthorization() {
            if (!email) {
                setIsAuthorized(false);
                setIsChecking(false);
                return;
            }

            setIsChecking(true);
            try {
                const allowed = await isEmailAllowed(email);
                setIsAuthorized(allowed);
            } catch (error) {
                console.error('Error checking authorization:', error);
                setIsAuthorized(false);
            } finally {
                setIsChecking(false);
            }
        }

        checkAuthorization();
    }, [email]);

    return { isAuthorized, isChecking };
}
