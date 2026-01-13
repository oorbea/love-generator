import { motion, AnimatePresence } from 'framer-motion';
import { useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ImageLightboxProps {
    src: string;
    alt: string;
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Full-screen image lightbox with support for mobile rotation.
 * Uses a React Portal to render directly in document.body,
 * escaping any parent containers with backdrop-filter or transform.
 */
export function ImageLightbox({ src, alt, isOpen, onClose }: ImageLightboxProps) {
    // Close on Escape key
    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        },
        [onClose]
    );

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            window.addEventListener('keydown', handleKeyDown);
        } else {
            document.body.style.overflow = '';
        }

        return () => {
            document.body.style.overflow = '';
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, handleKeyDown]);

    const lightboxContent = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="lightbox-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    onClick={onClose}
                >
                    {/* Close button */}
                    <motion.button
                        className="lightbox-close"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ delay: 0.1 }}
                        onClick={onClose}
                        aria-label="Cerrar imagen"
                    >
                        ✕
                    </motion.button>

                    {/* Image container */}
                    <motion.div
                        className="lightbox-content"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={src}
                            alt={alt}
                            className="lightbox-image"
                        />
                    </motion.div>

                    {/* Hint text */}
                    <motion.p
                        className="lightbox-hint"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        Toca para cerrar
                    </motion.p>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Use createPortal to render directly in document.body
    return createPortal(lightboxContent, document.body);
}

