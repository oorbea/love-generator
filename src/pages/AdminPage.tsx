import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
    collection,
    getDocs,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    getDoc,
    setDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { uploadToCloudinary } from '../services/cloudinary';
import { useAuth } from '../hooks/useAuth';
import { useAdmin } from '../hooks/useAdmin';
import { GlassCard } from '../components/GlassCard';
import type { Reason } from '../types/reason';

interface AdminPageProps {
    onBack: () => void;
}

export function AdminPage({ onBack }: AdminPageProps) {
    const { user } = useAuth();
    const { isAdmin, isChecking } = useAdmin(user?.email);

    const [reasons, setReasons] = useState<Reason[]>([]);
    const [allowedEmails, setAllowedEmails] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'reasons' | 'emails'>('reasons');

    // Form states
    const [newReason, setNewReason] = useState({ content: '', type: 'text', imageUrl: '', spotifyUrl: '' });
    const [newEmail, setNewEmail] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState({ content: '', type: 'text', imageUrl: '', spotifyUrl: '' });

    // Image upload states
    const [uploading, setUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Load data
    useEffect(() => {
        async function loadData() {
            setLoading(true);
            try {
                const reasonsSnapshot = await getDocs(collection(db, 'reasons'));
                const reasonsData = reasonsSnapshot.docs.map(d => ({
                    id: d.id,
                    ...d.data()
                })) as Reason[];
                setReasons(reasonsData);

                const configDoc = await getDoc(doc(db, 'config', 'allowedUsers'));
                if (configDoc.exists()) {
                    setAllowedEmails(configDoc.data().emails || []);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        }

        if (isAdmin) {
            loadData();
        }
    }, [isAdmin]);

    // Handle image file selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview
        const reader = new FileReader();
        reader.onload = (e) => setImagePreview(e.target?.result as string);
        reader.readAsDataURL(file);

        // Upload to Imgur
        setUploading(true);
        try {
            const result = await uploadToCloudinary(file);
            if (result.success && result.url) {
                if (isEdit) {
                    setEditForm({ ...editForm, imageUrl: result.url, type: 'image' });
                } else {
                    setNewReason({ ...newReason, imageUrl: result.url, type: 'image' });
                }
            } else {
                alert(result.error || 'Error al subir la imagen');
                setImagePreview(null);
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error al subir la imagen');
            setImagePreview(null);
        } finally {
            setUploading(false);
        }
    };

    // Add reason
    const handleAddReason = async () => {
        if (!newReason.content.trim()) return;

        try {
            const reasonData = {
                content: newReason.content,
                type: newReason.type as 'text' | 'image',
                ...(newReason.imageUrl && { imageUrl: newReason.imageUrl }),
                ...(newReason.spotifyUrl && { spotifyUrl: newReason.spotifyUrl }),
            };

            const docRef = await addDoc(collection(db, 'reasons'), reasonData);
            setReasons([...reasons, { id: docRef.id, ...reasonData }]);
            setNewReason({ content: '', type: 'text', imageUrl: '', spotifyUrl: '' });
            setImagePreview(null);
        } catch (error) {
            console.error('Error adding reason:', error);
        }
    };

    // Start editing
    const handleStartEdit = (reason: Reason) => {
        setEditingId(reason.id);
        setEditForm({
            content: reason.content,
            type: reason.type,
            imageUrl: reason.imageUrl || '',
            spotifyUrl: reason.spotifyUrl || ''
        });
    };

    // Save edit
    const handleSaveEdit = async () => {
        if (!editingId || !editForm.content.trim()) return;

        try {
            const reasonData = {
                content: editForm.content,
                type: editForm.type as 'text' | 'image',
                ...(editForm.imageUrl && { imageUrl: editForm.imageUrl }),
                ...(editForm.spotifyUrl && { spotifyUrl: editForm.spotifyUrl }),
            };

            await updateDoc(doc(db, 'reasons', editingId), reasonData);
            setReasons(reasons.map(r => r.id === editingId ? { ...r, ...reasonData } : r));
            setEditingId(null);
            setEditForm({ content: '', type: 'text', imageUrl: '', spotifyUrl: '' });
        } catch (error) {
            console.error('Error updating reason:', error);
        }
    };

    // Cancel edit
    const handleCancelEdit = () => {
        setEditingId(null);
        setEditForm({ content: '', type: 'text', imageUrl: '', spotifyUrl: '' });
    };

    // Delete reason
    const handleDeleteReason = async (id: string) => {
        if (!confirm('¿Eliminar esta razón?')) return;

        try {
            await deleteDoc(doc(db, 'reasons', id));
            setReasons(reasons.filter(r => r.id !== id));
        } catch (error) {
            console.error('Error deleting reason:', error);
        }
    };

    // Add email
    const handleAddEmail = async () => {
        if (!newEmail.trim() || allowedEmails.includes(newEmail.toLowerCase())) return;

        try {
            const updatedEmails = [...allowedEmails, newEmail.toLowerCase()];
            await setDoc(doc(db, 'config', 'allowedUsers'), { emails: updatedEmails });
            setAllowedEmails(updatedEmails);
            setNewEmail('');
        } catch (error) {
            console.error('Error adding email:', error);
        }
    };

    // Remove email
    const handleRemoveEmail = async (email: string) => {
        if (!confirm(`¿Eliminar ${email}?`)) return;

        try {
            const updatedEmails = allowedEmails.filter(e => e !== email);
            await setDoc(doc(db, 'config', 'allowedUsers'), { emails: updatedEmails });
            setAllowedEmails(updatedEmails);
        } catch (error) {
            console.error('Error removing email:', error);
        }
    };

    if (isChecking) {
        return (
            <div className="aero-background min-h-screen flex items-center justify-center">
                <GlassCard>
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">⚙️</div>
                        <p className="text-gray-600">Verificando permisos...</p>
                    </div>
                </GlassCard>
            </div>
        );
    }

    if (!isAdmin) {
        return (
            <div className="aero-background min-h-screen flex items-center justify-center">
                <GlassCard>
                    <div className="text-center py-8">
                        <div className="text-4xl mb-4">🚫</div>
                        <h2 className="text-xl font-bold text-gray-800 mb-2">Acceso denegado</h2>
                        <p className="text-gray-600 mb-4">No tienes permisos de administrador.</p>
                        <button onClick={onBack} className="google-button">Volver</button>
                    </div>
                </GlassCard>
            </div>
        );
    }

    return (
        <div className="aero-background min-h-screen p-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-between items-center mb-6"
                >
                    <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                        ⚙️ Panel de Administración
                    </h1>
                    <button onClick={onBack} className="google-button">
                        ← Volver
                    </button>
                </motion.div>

                {/* Tabs */}
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setActiveTab('reasons')}
                        className={`px-4 py-2 rounded-full transition-colors ${activeTab === 'reasons' ? 'bg-pink-500 text-white' : 'bg-white/30 text-gray-800'
                            }`}
                    >
                        💕 Razones ({reasons.length})
                    </button>
                    <button
                        onClick={() => setActiveTab('emails')}
                        className={`px-4 py-2 rounded-full transition-colors ${activeTab === 'emails' ? 'bg-pink-500 text-white' : 'bg-white/30 text-gray-800'
                            }`}
                    >
                        📧 Emails ({allowedEmails.length})
                    </button>
                </div>

                <GlassCard>
                    {loading ? (
                        <div className="text-center py-8">Cargando...</div>
                    ) : activeTab === 'reasons' ? (
                        <div className="space-y-4">
                            {/* Add Reason Form */}
                            <div className="p-4 bg-white/30 rounded-lg space-y-3">
                                <h3 className="font-bold text-gray-800">➕ Nueva Razón</h3>
                                <textarea
                                    value={newReason.content}
                                    onChange={(e) => setNewReason({ ...newReason, content: e.target.value })}
                                    placeholder="Escribe una razón de amor..."
                                    className="w-full p-3 rounded-lg border border-gray-200 resize-none"
                                    rows={2}
                                />
                                <div className="flex gap-2 flex-wrap items-center">
                                    <select
                                        value={newReason.type}
                                        onChange={(e) => setNewReason({ ...newReason, type: e.target.value })}
                                        className="p-2 rounded-lg border border-gray-200"
                                    >
                                        <option value="text">Solo texto</option>
                                        <option value="image">Con imagen</option>
                                    </select>

                                    {newReason.type === 'image' && (
                                        <>
                                            <input
                                                value={newReason.imageUrl}
                                                onChange={(e) => setNewReason({ ...newReason, imageUrl: e.target.value })}
                                                placeholder="URL de la imagen"
                                                className="flex-1 p-2 rounded-lg border border-gray-200"
                                            />
                                            <span className="text-gray-500">o</span>
                                            <input
                                                ref={fileInputRef}
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleFileSelect(e)}
                                                className="hidden"
                                            />
                                            <button
                                                onClick={() => fileInputRef.current?.click()}
                                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                                disabled={uploading}
                                            >
                                                {uploading ? '📤 Subiendo...' : '📁 Subir imagen'}
                                            </button>
                                        </>
                                    )}
                                </div>

                                {imagePreview && (
                                    <div className="relative w-32 h-32">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                                        <button
                                            onClick={() => {
                                                setImagePreview(null);
                                                setNewReason({ ...newReason, imageUrl: '' });
                                            }}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}

                                <input
                                    value={newReason.spotifyUrl}
                                    onChange={(e) => setNewReason({ ...newReason, spotifyUrl: e.target.value })}
                                    placeholder="URL de Spotify (opcional) - cualquier formato"
                                    className="w-full p-2 rounded-lg border border-gray-200"
                                />
                                <button onClick={handleAddReason} className="glossy-button text-sm py-2" disabled={uploading}>
                                    Añadir Razón
                                </button>
                            </div>

                            {/* Reasons List */}
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {reasons.map((reason) => (
                                    <div key={reason.id} className="p-3 bg-white/50 rounded-lg">
                                        {editingId === reason.id ? (
                                            /* Edit Form */
                                            <div className="space-y-2">
                                                <textarea
                                                    value={editForm.content}
                                                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                                                    className="w-full p-2 rounded-lg border border-gray-200 resize-none"
                                                    rows={2}
                                                />
                                                <div className="flex gap-2 flex-wrap">
                                                    <select
                                                        value={editForm.type}
                                                        onChange={(e) => setEditForm({ ...editForm, type: e.target.value })}
                                                        className="p-2 rounded-lg border border-gray-200 text-sm"
                                                    >
                                                        <option value="text">Texto</option>
                                                        <option value="image">Imagen</option>
                                                    </select>
                                                    {editForm.type === 'image' && (
                                                        <input
                                                            value={editForm.imageUrl}
                                                            onChange={(e) => setEditForm({ ...editForm, imageUrl: e.target.value })}
                                                            placeholder="URL imagen"
                                                            className="flex-1 p-2 rounded-lg border border-gray-200 text-sm"
                                                        />
                                                    )}
                                                </div>
                                                <input
                                                    value={editForm.spotifyUrl}
                                                    onChange={(e) => setEditForm({ ...editForm, spotifyUrl: e.target.value })}
                                                    placeholder="URL Spotify"
                                                    className="w-full p-2 rounded-lg border border-gray-200 text-sm"
                                                />
                                                <div className="flex gap-2">
                                                    <button onClick={handleSaveEdit} className="px-3 py-1 bg-green-500 text-white rounded-lg text-sm">
                                                        ✓ Guardar
                                                    </button>
                                                    <button onClick={handleCancelEdit} className="px-3 py-1 bg-gray-400 text-white rounded-lg text-sm">
                                                        ✕ Cancelar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            /* Display Mode */
                                            <div className="flex justify-between items-start gap-2">
                                                <div className="flex-1">
                                                    <p className="text-gray-800">{reason.content}</p>
                                                    <div className="flex gap-2 mt-1 text-xs text-gray-500">
                                                        <span>📝 {reason.type}</span>
                                                        {reason.imageUrl && <span>🖼️ imagen</span>}
                                                        {reason.spotifyUrl && <span>🎵 spotify</span>}
                                                    </div>
                                                </div>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => handleStartEdit(reason)}
                                                        className="text-blue-500 hover:text-blue-700 px-2"
                                                        title="Editar"
                                                    >
                                                        ✏️
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteReason(reason.id)}
                                                        className="text-red-500 hover:text-red-700 px-2"
                                                        title="Eliminar"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Add Email Form */}
                            <div className="p-4 bg-white/30 rounded-lg">
                                <h3 className="font-bold text-gray-800 mb-3">➕ Nuevo Email Autorizado</h3>
                                <div className="flex gap-2">
                                    <input
                                        value={newEmail}
                                        onChange={(e) => setNewEmail(e.target.value)}
                                        placeholder="email@ejemplo.com"
                                        type="email"
                                        className="flex-1 p-2 rounded-lg border border-gray-200"
                                    />
                                    <button onClick={handleAddEmail} className="glossy-button text-sm py-2">
                                        Añadir
                                    </button>
                                </div>
                            </div>

                            {/* Emails List */}
                            <div className="space-y-2">
                                {allowedEmails.map((email) => (
                                    <div key={email} className="p-3 bg-white/50 rounded-lg flex justify-between items-center">
                                        <span className="text-gray-800">{email}</span>
                                        <button
                                            onClick={() => handleRemoveEmail(email)}
                                            className="text-red-500 hover:text-red-700 px-2"
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </GlassCard>
            </div>
        </div>
    );
}
