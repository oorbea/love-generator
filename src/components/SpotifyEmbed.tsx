import { motion } from 'framer-motion';

interface SpotifyEmbedProps {
    url: string;
}

export function SpotifyEmbed({ url }: SpotifyEmbedProps) {
    // Asegurar que la URL sea de embed
    const embedUrl = url.includes('/embed/') ? url : url.replace('open.spotify.com/', 'open.spotify.com/embed/');

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
