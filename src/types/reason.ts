export type ContentType = 'text' | 'image';

export interface Reason {
    id: string;
    content: string;
    type: ContentType;
    imageUrl?: string;
    theme?: 'day' | 'night';
}
