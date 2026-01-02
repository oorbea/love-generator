import type { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface GlassCardProps {
    children: ReactNode;
    className?: string;
}

export function GlassCard({ children, className = '' }: GlassCardProps) {
    return (
        <motion.div
            className={`glass-card p-8 ${className}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                type: 'spring',
                stiffness: 260,
                damping: 20
            }}
        >
            {children}
        </motion.div>
    );
}
