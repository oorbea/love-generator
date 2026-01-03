import { motion } from 'framer-motion';
import { GlassCard } from './GlassCard';
import { useAuth } from '../hooks/useAuth';

interface UnauthorizedPageProps {
    email: string;
}

export function UnauthorizedPage({ email }: UnauthorizedPageProps) {
    const { signOut } = useAuth();

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    return (
        <div className="aero-background login-container">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <GlassCard className="max-w-md w-full text-center">
                    {/* Warning Icon */}
                    <motion.div
                        className="text-6xl mb-4"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                            type: 'spring',
                            stiffness: 260,
                            damping: 20,
                            delay: 0.2
                        }}
                    >
                        🚫
                    </motion.div>

                    <h1 className="text-2xl font-bold text-gray-800 mb-2">
                        Acceso no autorizado
                    </h1>

                    <p className="text-gray-600 mb-4">
                        Lo siento, la cuenta <strong>{email}</strong> no tiene permiso para acceder a esta aplicación.
                    </p>

                    <p className="text-gray-500 text-sm mb-6">
                        Esta es una aplicación privada. Si crees que deberías tener acceso, contacta con el administrador.
                    </p>

                    {/* Sign Out Button */}
                    <motion.button
                        className="google-button mx-auto"
                        onClick={handleSignOut}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <span className="relative z-10">
                            Cerrar sesión
                        </span>
                    </motion.button>
                </GlassCard>
            </motion.div>
        </div>
    );
}
