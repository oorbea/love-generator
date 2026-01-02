import { useCallback } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { useAuth } from './contexts/AuthContext';
import { useReasons } from './hooks/useReasons';
import { LoginPage } from './components/LoginPage';
import { GlassCard } from './components/GlassCard';
import { GlossyButton } from './components/GlossyButton';
import { ReasonCard } from './components/ReasonCard';
import { CounterWidget } from './components/CounterWidget';

function MainContent() {
    const { signOut, user } = useAuth();
    const { currentReason, getRandomReason, viewedCount, loading } = useReasons(true);

    const handleNextReason = useCallback(() => {
        getRandomReason();

        // Trigger confetti celebration!
        confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
            colors: ['#FF69B4', '#FF1493', '#FF85C0', '#87CEEB', '#B4D455'],
        });
    }, [getRandomReason]);

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    if (loading) {
        return (
            <div className="aero-background flex items-center justify-center min-h-screen">
                <GlassCard>
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4 floating">💕</div>
                        <p className="text-gray-600">Cargando razones de amor...</p>
                    </div>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="aero-background min-h-screen flex flex-col">
            {/* Header */}
            <header className="p-4 flex justify-between items-center">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2"
                >
                    <span className="text-2xl">💕</span>
                    <span className="text-white font-semibold text-shadow">Love Generator</span>
                </motion.div>

                <motion.button
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-white/80 hover:text-white text-sm flex items-center gap-2 transition-colors"
                    onClick={handleSignOut}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <span className="hidden sm:inline">{user?.displayName || 'Usuario'}</span>
                    <span>Salir</span>
                </motion.button>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl">
                    <GlassCard className="min-h-[400px] flex flex-col justify-center">
                        <ReasonCard reason={currentReason} />

                        <div className="mt-8 flex justify-center">
                            <GlossyButton onClick={handleNextReason}>
                                <span className="heart-3d mr-2">💖</span>
                                Dime más
                            </GlossyButton>
                        </div>
                    </GlassCard>
                </div>
            </main>

            {/* Footer */}
            <footer className="p-4 flex justify-center">
                <CounterWidget count={viewedCount} />
            </footer>
        </div>
    );
}

function App() {
    const { user, loading } = useAuth();

    // Show loading state
    if (loading) {
        return (
            <div className="aero-background flex items-center justify-center min-h-screen">
                <div className="text-white text-xl">Cargando...</div>
            </div>
        );
    }

    // Show login if not authenticated
    if (!user) {
        return <LoginPage />;
    }

    // Show main content if authenticated
    return <MainContent />;
}

export default App;
