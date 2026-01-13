import { useState, useCallback, useEffect, useRef } from 'react';
import type { Reason } from '../types/reason';
import { getUserViewHistory, incrementViewCount, type ViewCounts } from '../services/firebase';

interface UseReasonSelectionReturn {
    currentReason: Reason | null;
    selectNextReason: () => void;
    loading: boolean;
    viewedCount: number;
}

/**
 * Hook that manages smart reason selection based on user's view history.
 * Ensures no reason repeats until all reasons have been seen at least once,
 * then prioritizes least-viewed reasons.
 */
export function useReasonSelection(
    reasons: Reason[],
    userId: string | null
): UseReasonSelectionReturn {
    const [currentReason, setCurrentReason] = useState<Reason | null>(null);
    const [viewHistory, setViewHistory] = useState<ViewCounts>({});
    const [loading, setLoading] = useState(true);
    const previousReasonId = useRef<string | null>(null);

    // Calculate unique reasons seen from view history
    const uniqueReasonsSeen = Object.keys(viewHistory).length;

    // Load view history when userId changes
    useEffect(() => {
        async function loadViewHistory() {
            if (!userId) {
                setViewHistory({});
                setLoading(false);
                return;
            }

            setLoading(true);
            try {
                const history = await getUserViewHistory(userId);
                setViewHistory(history);
            } catch (error) {
                console.error('Error loading view history:', error);
                setViewHistory({});
            } finally {
                setLoading(false);
            }
        }

        loadViewHistory();
    }, [userId]);

    // Select the next reason using smart logic
    const selectNextReason = useCallback(() => {
        if (reasons.length === 0 || !userId) return;

        // Get view counts for all reasons (0 if not viewed)
        const reasonsWithCounts = reasons.map((reason) => ({
            reason,
            count: viewHistory[reason.id] || 0,
        }));

        // Find the minimum view count
        const minCount = Math.min(...reasonsWithCounts.map((r) => r.count));

        // Filter to only include reasons with the minimum count
        let eligibleReasons = reasonsWithCounts
            .filter((r) => r.count === minCount)
            .map((r) => r.reason);

        // Exclude the previous reason to avoid consecutive repeats
        if (previousReasonId.current && eligibleReasons.length > 1) {
            eligibleReasons = eligibleReasons.filter(
                (r) => r.id !== previousReasonId.current
            );
        }

        // Select a random reason from eligible ones
        const randomIndex = Math.floor(Math.random() * eligibleReasons.length);
        const selectedReason = eligibleReasons[randomIndex];

        // Update state
        setCurrentReason(selectedReason);
        previousReasonId.current = selectedReason.id;

        // Update view history locally
        setViewHistory((prev) => ({
            ...prev,
            [selectedReason.id]: (prev[selectedReason.id] || 0) + 1,
        }));

        // Persist to Firebase (fire and forget)
        incrementViewCount(userId, selectedReason.id).catch((error) => {
            console.error('Error persisting view count:', error);
        });
    }, [reasons, userId, viewHistory]);

    return {
        currentReason,
        selectNextReason,
        loading,
        viewedCount: uniqueReasonsSeen,
    };
}
