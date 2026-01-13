import { useState, useEffect } from 'react';
import type { Reason } from '../types/reason';
import { mockReasons } from '../data/reasons.mock';
import { fetchReasons } from '../services/firebase';
import { useReasonSelection } from './useReasonSelection';

interface UseReasonsReturn {
    reasons: Reason[];
    currentReason: Reason | null;
    loading: boolean;
    error: string | null;
    getRandomReason: () => void;
    viewedCount: number;
}

export function useReasons(userId: string | null): UseReasonsReturn {
    const [reasons, setReasons] = useState<Reason[]>([]);
    const [reasonsLoading, setReasonsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load reasons on mount - always try Firestore first
    useEffect(() => {
        async function loadReasons() {
            setReasonsLoading(true);
            setError(null);

            try {
                const fetchedReasons = await fetchReasons();
                if (fetchedReasons.length > 0) {
                    setReasons(fetchedReasons);
                    console.log(`Loaded ${fetchedReasons.length} reasons from Firestore`);
                } else {
                    // Fallback to mock if Firestore is empty
                    console.log('Firestore empty, using mock data');
                    setReasons(mockReasons);
                }
            } catch (err) {
                setError('Error loading reasons');
                console.error('Error fetching from Firestore, using mock:', err);
                // Fallback to mock on error
                setReasons(mockReasons);
            } finally {
                setReasonsLoading(false);
            }
        }

        loadReasons();
    }, []);

    // Use the smart reason selection hook
    const {
        currentReason,
        selectNextReason,
        loading: selectionLoading,
        viewedCount,
    } = useReasonSelection(reasons, userId);

    // Combined loading state
    const loading = reasonsLoading || selectionLoading;

    // Auto-select first reason when reasons are loaded and selection is ready
    useEffect(() => {
        if (reasons.length > 0 && !currentReason && !loading && userId) {
            selectNextReason();
        }
    }, [reasons, currentReason, loading, userId, selectNextReason]);

    return {
        reasons,
        currentReason,
        loading,
        error,
        getRandomReason: selectNextReason,
        viewedCount,
    };
}

