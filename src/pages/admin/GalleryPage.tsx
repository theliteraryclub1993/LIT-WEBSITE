import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Upload, Image as ImageIcon, X } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { uploadFile } from '@/lib/supabase'
import { STORAGE_BUCKETS, ALLOWED_IMAGE_TYPES, formatFileSize } from '@/utils/constants'
import { Button, Input, Modal, PageLoader, EmptyState, Badge } from '@/components/ui'
import toast from 'react-hot-toast'
import { useUIStore, useAuthStore } from '@/store'
import { logActivity, LOG_ACTIONS, ENTITY_TYPES } from '@/services/activityLogService'

interface GalleryImage {
    id: string
    url: string
    thumbnail_url: string | null
    caption: string | null
    album: string | null
    category: string | null
    order_index: number
    created_at: string
}

export function GalleryPage() {
    const queryClient = useQueryClient()
    const user = useAuthStore(s => s.user)
    const { showConfirmDialog, hideConfirmDialog } = useUIStore()

    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    
    // Form fields
    const [file, setFile] = useState<File | null>(null)
    const [caption, setCaption] = useState('')
    const [album, setAlbum] = useState('')
    const [category, setCategory] = useState('')
    const [orderIndex, setOrderIndex] = useState(0)

    // Fetch images
    const { data: images, isLoading } = useQuery<GalleryImage[]>({
        queryKey: ['admin-gallery'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('gallery_images')
                .select('*')
                .order('order_index', { ascending: true })
                .order('created_at', { ascending: false })

            if (error) throw error
            return data as GalleryImage[]
        },
    })

    // Upload mutation
    const uploadMutation = useMutation({
        mutationFn: async () => {
            if (!file) throw new Error('File is required')

            setIsUploading(true)
            const path = `${Date.now()}_${file.name}`
            const url = await uploadFile(STORAGE_BUCKETS.GALLERY, path, file, { upsert: true })
            if (!url) throw new Error('Failed to upload image to storage')

            // Insert metadata
            const { data, error } = await supabase
                .from('gallery_images')
                .insert({
                    url,
                    thumbnail_url: url, // Simplify for demo/production fallback
                    caption: caption || null,
                    album: album || null,
                    category: category || null,
                    order_index: orderIndex,
                })
                .select()
                .single()

            if (error) throw error

            // Log activity
            await logActivity({
                userId: user?.id,
                action: LOG_ACTIONS.GALLERY_UPLOAD,
                entityType: ENTITY_TYPES.GALLERY_IMAGE,
                entityId: data.id,
                details: { title: caption || file.name },
            })

            return data
        },
        onSuccess: () => {
            toast.success('Image added to gallery!')
            closeModal()
            queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
            queryClient.invalidateQueries({ queryKey: ['gallery'] })
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to upload image')
        },
        onSettled: () => {
            setIsUploading(false)
        }
    })

    // Delete mutation
    const deleteMutation = useMutation({
        mutationFn: async (img: GalleryImage) => {
            // Delete from database
            const { error } = await supabase
                .from('gallery_images')
                .delete()
                .eq('id', img.id)

            if (error) throw error

            // Log activity
            await logActivity({
                userId: user?.id,
                action: LOG_ACTIONS.GALLERY_DELETE,
                entityType: ENTITY_TYPES.GALLERY_IMAGE,
                entityId: img.id,
                details: { title: img.caption || 'Gallery Image' },
            })
        },
        onSuccess: () => {
            toast.success('Image deleted from gallery.')
            queryClient.invalidateQueries({ queryKey: ['admin-gallery'] })
            queryClient.invalidateQueries({ queryKey: ['gallery'] })
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to delete image')
        }
    })

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0]
        if (!selected) return

        if (!ALLOWED_IMAGE_TYPES.includes(selected.type as typeof ALLOWED_IMAGE_TYPES[number])) {
            alert('Invalid file type. Use JPG, PNG, WebP, or GIF.')
            return
        }

        if (selected.size > 10 * 1024 * 1024) {
            alert(`File too large (${formatFileSize(selected.size)}). Maximum 10MB.`)
            return
        }

        setFile(selected)
    }

    const handleDelete = (img: GalleryImage) => {
        showConfirmDialog({
            isOpen: true,
            title: 'Delete Image',
            message: 'Are you sure you want to delete this image from the gallery? This cannot be undone.',
            variant: 'danger',
            confirmLabel: 'Delete Image',
            onConfirm: () => {
                deleteMutation.mutate(img)
                hideConfirmDialog()
            },
            onCancel: hideConfirmDialog,
        })
    }

    const closeModal = () => {
        setIsModalOpen(false)
        setFile(null)
        setCaption('')
        setAlbum('')
        setCategory('')
        setOrderIndex(0)
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-h2 text-white">Gallery CMS</h1>
                    <p className="text-body-sm text-dark-400 mt-1">Upload and organize images in albums and categories.</p>
                </div>
                <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
                    Add Image
                </Button>
            </div>

            {/* Content */}
            {isLoading ? (
                <PageLoader />
            ) : !images?.length ? (
                <EmptyState
                    icon={<ImageIcon size={48} strokeWidth={1.5} />}
                    title="No images uploaded"
                    description="Upload your first gallery image to get started."
                    action={
                        <Button variant="primary" leftIcon={<Plus size={16} />} onClick={() => setIsModalOpen(true)}>
                            Add Image
                        </Button>
                    }
                />
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((img) => (
                        <div
                            key={img.id}
                            className="group relative bg-dark-900 border border-dark-800 rounded-xl overflow-hidden hover:border-dark-600 transition-all duration-300"
                        >
                            <div className="aspect-video w-full overflow-hidden bg-dark-950">
                                <img src={img.url} alt={img.caption || 'Gallery'} className="w-full h-full object-cover" />
                            </div>

                            <div className="p-4 space-y-2">
                                <p className="text-body-sm text-white font-medium truncate">
                                    {img.caption || <span className="italic text-dark-500">No caption</span>}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {img.album && <Badge variant="outline" size="sm">{img.album}</Badge>}
                                    {img.category && <Badge variant="default" size="sm" className="bg-dark-800 text-dark-300 border-dark-700">{img.category}</Badge>}
                                </div>
                            </div>

                            {/* Hover Overlay */}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleDelete(img)}
                                    className="p-2 rounded-lg bg-black/60 text-dark-400 hover:text-error hover:bg-black/90 transition-colors"
                                >
                                    <Trash2 size={15} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Upload Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={closeModal}
                title="Add Image to Gallery"
                subtitle="Select an image file and configure category metadata."
                size="md"
            >
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        uploadMutation.mutate()
                    }}
                    className="space-y-4"
                >
                    {/* File Upload Zone */}
                    <div className="space-y-2">
                        <label className="text-label text-dark-200">Image File *</label>
                        {file ? (
                            <div className="relative aspect-video rounded-lg overflow-hidden border border-dark-700 bg-dark-850">
                                <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => setFile(null)}
                                    className="absolute top-2 right-2 p-1.5 rounded-md bg-black/60 text-white hover:bg-black/80 transition-colors"
                                >
                                    <X size={14} />
                                </button>
                            </div>
                        ) : (
                            <label className="flex flex-col items-center justify-center w-full aspect-video rounded-xl border-2 border-dashed border-dark-700 hover:border-dark-500 cursor-pointer bg-dark-950 group transition-colors">
                                <Upload size={24} className="text-dark-500 mb-2 group-hover:text-dark-300 transition-colors" />
                                <span className="text-body-sm text-dark-400 group-hover:text-dark-200 transition-colors">Click to choose image</span>
                                <span className="text-caption text-dark-600 mt-1">JPG, PNG, WebP · Max 10MB</span>
                                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                            </label>
                        )}
                    </div>

                    <Input
                        label="Caption / Title"
                        placeholder="Write a brief description..."
                        value={caption}
                        onChange={(e) => setCaption(e.target.value)}
                    />

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Album"
                            placeholder="e.g. Auditions 2026"
                            value={album}
                            onChange={(e) => setAlbum(e.target.value)}
                        />
                        <Input
                            label="Category"
                            placeholder="e.g. Poetry, Stage"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        />
                    </div>

                    <Input
                        label="Display Order (Order Index)"
                        type="number"
                        placeholder="0 = First"
                        value={orderIndex}
                        onChange={(e) => setOrderIndex(Number(e.target.value))}
                    />

                    <div className="flex justify-end gap-3 pt-4 border-t border-dark-800">
                        <Button type="button" variant="outline" onClick={closeModal}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" isLoading={isUploading} disabled={!file}>
                            Upload Image
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    )
}
