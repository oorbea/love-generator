import { doc, getDoc } from 'firebase/firestore';
import { db } from '../services/firebase';

// Cache para evitar múltiples llamadas a Firestore
let cachedAllowedEmails: string[] | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtiene la lista de emails autorizados desde Firestore
 * Colección: config, Documento: allowedUsers, Campo: emails (array)
 */
export async function fetchAllowedEmails(): Promise<string[]> {
    const now = Date.now();

    // Usar cache si es válido
    if (cachedAllowedEmails && (now - cacheTimestamp) < CACHE_DURATION) {
        return cachedAllowedEmails;
    }

    try {
        const configDoc = await getDoc(doc(db, 'config', 'allowedUsers'));

        if (configDoc.exists()) {
            const data = configDoc.data();
            cachedAllowedEmails = (data.emails || []).map((email: string) => email.toLowerCase());
            cacheTimestamp = now;
            return cachedAllowedEmails ?? [];
        }

        // Si no existe el documento, lista vacía (nadie puede acceder excepto en desarrollo)
        cachedAllowedEmails = [];
        cacheTimestamp = now;
        return [];
    } catch (error) {
        console.error('Error fetching allowed emails:', error);
        // En caso de error, usar cache antiguo si existe, sino lista vacía
        return cachedAllowedEmails || [];
    }
}

/**
 * Verifica si un email está autorizado
 */
export async function isEmailAllowed(email: string | null | undefined): Promise<boolean> {
    if (!email) return false;

    const allowedEmails = await fetchAllowedEmails();

    // Si la lista está vacía y estamos en desarrollo, permitir todos
    if (allowedEmails.length === 0 && import.meta.env.DEV) {
        console.warn('Lista de emails vacía - modo desarrollo, permitiendo acceso');
        return true;
    }

    return allowedEmails.includes(email.toLowerCase());
}

/**
 * Limpia el cache (útil para forzar recarga desde admin)
 */
export function clearAllowedEmailsCache(): void {
    cachedAllowedEmails = null;
    cacheTimestamp = 0;
}
