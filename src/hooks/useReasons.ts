import { useState, useCallback, useEffect } from 'react';
import type { Reason } from '../types/reason';
import { mockReasons } from '../data/reasons.mock';
import { fetchReasons } from '../services/firebase';

interface UseReasonsReturn {
    reasons: Reason[];
    currentReason: Reason | null;
    loading: boolean;
    error: string | null;
    getRandomReason: () => void;
    viewedCount: number;
}

export function useReasons(useMock = true): UseReasonsReturn {
    const [reasons, setReasons] = useState<Reason[]>([]);
    const [currentReason, setCurrentReason] = useState<Reason | null>(null);
    const [previousReasonId, setPreviousReasonId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [viewedCount, setViewedCount] = useState(0);

    // Load reasons on mount
    useEffect(() => {
        async function loadReasons() {
            setLoading(true);
            setError(null);

            try {
                if (useMock) {
                    setReasons(mockReasons);
                } else {
                    const fetchedReasons = await fetchReasons();
                    if (fetchedReasons.length > 0) {
                        setReasons(fetchedReasons);
                    } else {
                        // Fallback to mock if Firestore is empty
                        setReasons(mockReasons);
                    }
                }
            } catch (err) {
                setError('Error loading reasons');
                console.error(err);
                // Fallback to mock on error
                setReasons(mockReasons);
            } finally {
                setLoading(false);
            }
        }

        loadReasons();
    }, [useMock]);

    // Get a random reason that's different from the previous one
    const getRandomReason = useCallback(() => {
        if (reasons.length === 0) return;

        let availableReasons = reasons;

        // Filter out the previous reason to avoid consecutive repeats
        if (previousReasonId && reasons.length > 1) {
            availableReasons = reasons.filter((r) => r.id !== previousReasonId);
        }

        const randomIndex = Math.floor(Math.random() * availableReasons.length);
        const selectedReason = availableReasons[randomIndex];

        setCurrentReason(selectedReason);
        setPreviousReasonId(selectedReason.id);
        setViewedCount((prev) => prev + 1);
    }, [reasons, previousReasonId]);

    // Auto-select first reason when reasons are loaded
    useEffect(() => {
        if (reasons.length > 0 && !currentReason) {
            getRandomReason();
        }
    }, [reasons, currentReason, getRandomReason]);

    return {
        reasons,
        currentReason,
        loading,
        error,
        getRandomReason,
        viewedCount,
    };
}
