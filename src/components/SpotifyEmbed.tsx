import { motion } from 'framer-motion';

interface SpotifyEmbedProps {
    url: string;
}

/**
 * Normalizes any Spotify URL to embed format
 * Handles:
 * - https://open.spotify.com/track/ID
 * - https://open.spotify.com/intl-es/track/ID?si=xxx
 * - https://open.spotify.com/embed/track/ID
 * - https://open.spotify.com/album/ID
 * - https://open.spotify.com/playlist/ID
 */
function normalizeSpotifyUrl(url: string): string {
    // Already an embed URL
    if (url.includes('/embed/')) {
        return url.split('?')[0]; // Remove query params
    }

    // Extract type (track/album/playlist) and ID from various formats
    const match = url.match(
        /spotify\.com(?:\/intl-[a-z]{2})?\/(track|album|playlist)\/([a-zA-Z0-9]+)/
    );

    if (match) {
        const [, type, id] = match;
        return `https://open.spotify.com/embed/${type}/${id}`;
    }

    // Fallback: return as-is
    return url;
}

export function SpotifyEmbed({ url }: SpotifyEmbedProps) {
    const embedUrl = normalizeSpotifyUrl(url);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-4 rounded-xl overflow-hidden shadow-lg"
        >
            <iframe
                src={embedUrl}
                width="100%"
                height="152"
                frameBorder="0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy"
                className="rounded-xl"
            />
        </motion.div>
    );
}
