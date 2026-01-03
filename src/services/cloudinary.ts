/**
 * Cloudinary image upload service
 * Uses unsigned uploads with an upload preset
 */

const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export interface CloudinaryUploadResult {
    success: boolean;
    url?: string;
    error?: string;
}

/**
 * Upload an image to Cloudinary
 * Images are stored securely in your Cloudinary account
 */
export async function uploadToCloudinary(file: File): Promise<CloudinaryUploadResult> {
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_UPLOAD_PRESET) {
        console.error('Cloudinary is not configured');
        return { success: false, error: 'Cloudinary no está configurado' };
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    try {
        const response = await fetch(
            `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
                method: 'POST',
                body: formData,
            }
        );

        const data = await response.json();

        if (data.secure_url) {
            return {
                success: true,
                url: data.secure_url,
            };
        } else {
            return {
                success: false,
                error: data.error?.message || 'Error al subir imagen',
            };
        }
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return {
            success: false,
            error: 'Error de conexión con Cloudinary',
        };
    }
}
