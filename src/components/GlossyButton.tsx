import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface GlossyButtonProps {
    children: ReactNode;
    onClick: () => void;
    className?: string;
    disabled?: boolean;
}

export function GlossyButton({
    children,
    onClick,
    className = '',
    disabled = false
}: GlossyButtonProps) {
    return (
        <motion.button
            className={`glossy-button ${className}`}
            onClick={onClick}
            disabled={disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{
                type: 'spring',
                stiffness: 400,
                damping: 17,
            }}
        >
            {children}
        </motion.button>
    );
}
