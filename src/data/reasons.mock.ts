import type { Reason } from '../types/reason';

export const mockReasons: Reason[] = [
    {
        id: '1',
        content: 'Porque tu sonrisa ilumina hasta los días más grises 🌤️',
        type: 'text',
        theme: 'day',
    },
    {
        id: '2',
        content: 'Porque me haces reír hasta que me duele la barriga 😂',
        type: 'text',
        theme: 'day',
    },
    {
        id: '3',
        content: 'Porque cada momento contigo es una nueva aventura ✨',
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400&h=300&fit=crop',
        theme: 'day',
    },
    {
        id: '4',
        content: 'Porque eres mi persona favorita en todo el universo 💫',
        type: 'text',
        theme: 'night',
    },
    {
        id: '5',
        content: 'Porque juntos somos invencibles 💪💕',
        type: 'image',
        imageUrl: 'https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=400&h=300&fit=crop',
        theme: 'day',
    },
    {
        id: '6',
        content: 'Porque esta canción me recuerda a ti 🎵',
        type: 'text',
        spotifyUrl: 'https://open.spotify.com/embed/track/3n3Ppam7vgaVa1iaRUc9Lp',
        theme: 'night',
    },
];
