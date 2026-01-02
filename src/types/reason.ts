export type ContentType = 'text' | 'image';

export interface Reason {
    id: string;
    content: string;
    type: ContentType;
    imageUrl?: string;
    spotifyUrl?: string; // URL de Spotify embed (ej: https://open.spotify.com/embed/track/...)
    theme?: 'day' | 'night';
}
