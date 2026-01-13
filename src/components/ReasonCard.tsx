import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Reason } from '../types/reason';
import { SpotifyEmbed } from './SpotifyEmbed';
import { ImageLightbox } from './ImageLightbox';

interface ReasonCardProps {
    reason: Reason | null;
}

export function ReasonCard({ reason }: ReasonCardProps) {
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);

    if (!reason) {
        return (
            <div className="text-center text-gray-500 py-12">
                <p>Cargando razones...</p>
            </div>
        );
    }

    const handleImageClick = () => {
        setIsLightboxOpen(true);
    };

    const handleLightboxClose = () => {
        setIsLightboxOpen(false);
    };

    return (
        <>
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
                            className="photo-frame photo-frame-clickable mx-auto max-w-sm mt-6"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            onClick={handleImageClick}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    handleImageClick();
                                }
                            }}
                            aria-label="Ampliar imagen"
                        >
                            <img
                                src={reason.imageUrl}
                                alt="Momento especial"
                                className="w-full h-auto object-cover"
                                loading="lazy"
                            />
                        </motion.div>
                    )}

                    {/* Spotify Embed (if spotifyUrl exists) */}
                    {reason.spotifyUrl && (
                        <div className="max-w-md mx-auto">
                            <SpotifyEmbed url={reason.spotifyUrl} />
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>

            {/* Lightbox for full-screen image viewing */}
            {reason.type === 'image' && reason.imageUrl && (
                <ImageLightbox
                    src={reason.imageUrl}
                    alt="Momento especial"
                    isOpen={isLightboxOpen}
                    onClose={handleLightboxClose}
                />
            )}
        </>
    );
}

