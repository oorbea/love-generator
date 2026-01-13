import { useCallback, useState } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';
import { useAuth } from './hooks/useAuth';
import { useAuthorization } from './hooks/useAuthorization';
import { useAdmin } from './hooks/useAdmin';
import { useReasons } from './hooks/useReasons';
import { LoginPage } from './components/LoginPage';
import { UnauthorizedPage } from './components/UnauthorizedPage';
import { GlassCard } from './components/GlassCard';
import { GlossyButton } from './components/GlossyButton';
import { ReasonCard } from './components/ReasonCard';
import { CounterWidget } from './components/CounterWidget';
import { AdminPage } from './pages/AdminPage';

interface MainContentProps {
    onAdminClick: () => void;
    isAdmin: boolean;
}

function MainContent({ onAdminClick, isAdmin }: MainContentProps) {
    const { signOut, user } = useAuth();
    const { currentReason, getRandomReason, viewedCount, loading } = useReasons(user?.uid || null);

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

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-3"
                >
                    {isAdmin && (
                        <motion.button
                            className="text-white/80 hover:text-white text-sm px-3 py-1 rounded-full bg-purple-500/50 hover:bg-purple-500/70 transition-colors"
                            onClick={onAdminClick}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            ⚙️ Admin
                        </motion.button>
                    )}
                    {user?.photoURL && (
                        <img
                            src={user.photoURL}
                            alt={user.displayName || 'Usuario'}
                            className="w-8 h-8 rounded-full border-2 border-white/50 shadow-md"
                            referrerPolicy="no-referrer"
                        />
                    )}
                    <span className="hidden sm:inline text-white/90 text-sm font-medium">
                        {user?.displayName || 'Usuario'}
                    </span>
                    <motion.button
                        className="text-white/80 hover:text-white text-sm px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        onClick={handleSignOut}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Salir
                    </motion.button>
                </motion.div>
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
    const { user, loading: authLoading } = useAuth();
    const { isAuthorized, isChecking } = useAuthorization(user?.email);
    const { isAdmin } = useAdmin(user?.email);
    const [showAdmin, setShowAdmin] = useState(false);

    // Show loading state
    if (authLoading || (user && isChecking)) {
        return (
            <div className="aero-background flex items-center justify-center min-h-screen">
                <GlassCard>
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4 floating">💕</div>
                        <p className="text-gray-600">Verificando acceso...</p>
                    </div>
                </GlassCard>
            </div>
        );
    }

    // Show login if not authenticated
    if (!user) {
        return <LoginPage />;
    }

    // Check if user email is in the whitelist
    if (!isAuthorized) {
        return <UnauthorizedPage email={user.email || 'desconocido'} />;
    }

    // Show admin page if selected
    if (showAdmin && isAdmin) {
        return <AdminPage onBack={() => setShowAdmin(false)} />;
    }

    // Show main content if authenticated and authorized
    return (
        <MainContent
            onAdminClick={() => setShowAdmin(true)}
            isAdmin={isAdmin}
        />
    );
}

export default App;
