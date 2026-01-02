import { motion, AnimatePresence } from 'framer-motion';
import type { Reason } from '../types/reason';

interface ReasonCardProps {
    reason: Reason | null;
}

export function ReasonCard({ reason }: ReasonCardProps) {
    if (!reason) {
        return (
            <div className="text-center text-gray-500 py-12">
                <p>Cargando razones...</p>
            </div>
        );
    }

    return (
        <AnimatePresence mode="wait">
            <motion.div
                key={reason.id}
                initial={{ opacity: 0, y: 20, rotateX: -10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                exit={{ opacity: 0, y: -20, rotateX: 10 }}
                transition={{
                    type: 'spring',
                    stiffness: 300,
                    damping: 25,
                }}
                className="text-center"
            >
                {/* Heart Icon */}
                <div className="heart-3d text-5xl mb-6 floating">
                    💕
                </div>

                {/* Main Content */}
                <p className="text-2xl md:text-3xl font-medium text-gray-800 leading-relaxed mb-6">
                    {reason.content}
                </p>

                {/* Image (if type is 'image') */}
                {reason.type === 'image' && reason.imageUrl && (
                    <motion.div
                        className="photo-frame mx-auto max-w-sm mt-6"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <img
                            src={reason.imageUrl}
                            alt="Momento especial"
                            className="w-full h-auto object-cover"
                            loading="lazy"
                        />
                    </motion.div>
                )}
            </motion.div>
        </AnimatePresence>
    );
}
