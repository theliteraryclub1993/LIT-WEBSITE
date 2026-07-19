import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon, Upload, Save, Trash2, Edit2, ChevronLeft, ChevronRight, Eye, CheckCircle } from 'lucide-react'
import { getSettingsByCategory, setSetting } from '@/services/settingsService'
import { uploadBatchImages } from '@/lib/imageUploader'
import { SlideshowCarousel, Button, PageLoader, Card } from '@/components/ui'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store'
import { logActivity, LOG_ACTIONS, ENTITY_TYPES } from '@/services/activityLogService'
import heroBg from '@/assets/hero-bg.jpg'
import malnadFestBg from '@/assets/malnad-fest-bg.png'

const DEFAULT_SLIDES = [heroBg, malnadFestBg]

export function SlideshowCMS() {
    const user = useAuthStore((s) => s.user)
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [slideshowImages, setSlideshowImages] = useState<string[]>([])
    const [previewAnimation, setPreviewAnimation] = useState<'simple' | 'cinematic' | 'zoom' | 'slide' | 'fade' | 'cube'>('simple')

    // Load slideshow images from settings DB
    useEffect(() => {
        setIsLoading(true)
        getSettingsByCategory('homepage')
            .then(data => {
                if (data) {
                    if (data.slideshowAnimation) {
                        setPreviewAnimation(String(data.slideshowAnimation) as any)
                    }
                    if (data.slideshowImages) {
                        try {
                            const parsed = typeof data.slideshowImages === 'string'
                                ? JSON.parse(data.slideshowImages)
                                : data.slideshowImages
                            if (Array.isArray(parsed)) {
                                setSlideshowImages(parsed.map(String))
                            }
                        } catch (e) {
                            console.error('[SlideshowCMS] Failed to parse slideshowImages:', e)
                        }
                    }
                }
            })
            .catch(err => {
                console.error('[SlideshowCMS] Error fetching settings:', err)
                toast.error('Failed to load slideshow settings')
            })
            .finally(() => setIsLoading(false))
    }, [])

    const handleSave = async () => {
        setIsSaving(true)
        const tid = toast.loading('Saving Homepage Slideshow settings...')
        try {
            await Promise.all([
                setSetting('slideshowImages', JSON.stringify(slideshowImages), 'homepage', user?.id),
                setSetting('slideshowAnimation', previewAnimation, 'homepage', user?.id)
            ])
            if (user?.id) {
                await logActivity({
                    userId: user.id,
                    action: LOG_ACTIONS.SETTINGS_UPDATE,
                    entityType: ENTITY_TYPES.SETTINGS,
                    entityId: 'homepage_slideshow',
                    details: { count: slideshowImages.length, animation: previewAnimation }
                })
            }
            toast.success('Homepage Slideshow & animation style saved successfully!', { id: tid })
        } catch (err: any) {
            console.error('[SlideshowCMS] Save error:', err)
            toast.error(`Failed to save slideshow: ${err?.message || 'Error'}`, { id: tid })
        } finally {
            setIsSaving(false)
        }
    }

    if (isLoading) {
        return <PageLoader label="Loading Homepage Slideshow CMS..." />
    }

    return (
        <div className="space-y-8 max-w-7xl mx-auto pb-16">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-dark-800 pb-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2.5 rounded-xl bg-orange-primary/10 border border-orange-primary/20 text-orange-primary">
                            <ImageIcon size={24} />
                        </div>
                        <div>
                            <h1 className="text-h2 text-white font-bold tracking-tight">Homepage Slideshow CMS</h1>
                            <p className="text-body-sm text-dark-400">
                                Upload, reorder, preview, and manage slideshow images displayed in the Home Page hero section.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="primary"
                        size="lg"
                        isLoading={isSaving}
                        leftIcon={<Save size={18} />}
                        onClick={handleSave}
                    >
                        Save Slideshow Changes
                    </Button>
                </div>
            </div>

            {/* Live Interactive Preview */}
            <Card className="p-6 space-y-4 bg-dark-900/60 border-dark-800">
                <div className="flex items-center justify-between border-b border-dark-800 pb-4">
                    <div className="flex items-center gap-2">
                        <Eye size={18} className="text-orange-primary" />
                        <h2 className="text-h5 text-white font-semibold">Live Homepage Carousel Preview</h2>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-caption font-medium border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle size={12} /> {slideshowImages.length} Image(s) Active
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <span className="text-caption text-dark-400">Animation Style:</span>
                        <select
                            value={previewAnimation}
                            onChange={(e) => setPreviewAnimation(e.target.value as any)}
                            className="bg-dark-950 border border-dark-700 text-white text-caption rounded-lg px-3 py-1.5 focus:outline-none focus:border-orange-primary"
                        >
                            <option value="simple">Simple Fade</option>
                            <option value="cinematic">Cinematic Soft Zoom</option>
                            <option value="zoom">Dynamic Zoom & Blur</option>
                            <option value="slide">Horizontal Slide</option>
                            <option value="fade">Smooth Blur Crossfade</option>
                            <option value="cube">3D Cube</option>
                        </select>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto py-2">
                    <SlideshowCarousel
                        slides={slideshowImages}
                        defaultSlides={DEFAULT_SLIDES}
                        autoRotateIntervalMs={4000}
                        aspectRatioClass="aspect-video"
                        animationStyle={previewAnimation}
                    />
                </div>
            </Card>

            {/* Multi-Image Upload Area */}
            <Card className="p-6 space-y-4 bg-dark-900/60 border-dark-800">
                <h2 className="text-h5 text-white font-semibold flex items-center gap-2">
                    <Upload size={18} className="text-orange-primary" /> Upload New Slideshow Images
                </h2>
                <p className="text-body-sm text-dark-400">
                    Select multiple images from your computer. Images will be compressed client-side (max 1920px) to ensure blazing fast loading speeds.
                </p>

                <div className="bg-dark-950 border-2 border-dashed border-dark-700 hover:border-orange-primary/50 transition-colors rounded-2xl p-8 text-center space-y-3 relative group">
                    <div className="w-12 h-12 rounded-full bg-dark-900 border border-dark-800 text-orange-primary flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                        <Upload size={22} />
                    </div>
                    <div>
                        <p className="text-body-md font-semibold text-white">
                            {isUploading ? 'Compressing & Uploading Batch...' : 'Click or Drag images here to upload'}
                        </p>
                        <p className="text-caption text-dark-400 mt-1">
                            Hold <kbd className="px-1.5 py-0.5 bg-dark-800 rounded border border-dark-700 text-dark-300">Ctrl</kbd> or <kbd className="px-1.5 py-0.5 bg-dark-800 rounded border border-dark-700 text-dark-300">Shift</kbd> to select multiple files at once.
                        </p>
                        <p className="text-[11px] text-dark-500 mt-1">Supported formats: JPG, PNG, WebP, GIF (Max 10MB per file)</p>
                    </div>

                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={async (e) => {
                            const files = Array.from(e.target.files || [])
                            e.target.value = ''
                            if (files.length === 0) return

                            const tid = toast.loading(`Preparing ${files.length} slideshow image(s)...`)
                            try {
                                setIsUploading(true)
                                const urls = await uploadBatchImages('settings', 'homepage_slideshow', files, (completed, total, name) => {
                                    toast.loading(`Uploaded ${completed} of ${total}: ${name}`, { id: tid })
                                })
                                if (urls && urls.length > 0) {
                                    setSlideshowImages(prev => [...prev, ...urls])
                                    toast.success(`${urls.length} image(s) processed & added to slideshow!`, { id: tid })
                                } else {
                                    toast.error('No valid images were uploaded', { id: tid })
                                }
                            } catch (err: any) {
                                console.error('[SlideshowCMS] Upload error:', err)
                                toast.error(`Upload error: ${err?.message || 'Failed'}`, { id: tid })
                            } finally {
                                setIsUploading(false)
                            }
                        }}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
            </Card>

            {/* Slides Management Grid */}
            <Card className="p-6 space-y-6 bg-dark-900/60 border-dark-800">
                <div className="flex items-center justify-between border-b border-dark-800 pb-4">
                    <div>
                        <h2 className="text-h5 text-white font-semibold">Active Slideshow Items ({slideshowImages.length})</h2>
                        <p className="text-caption text-dark-400">Reorder slides using left/right arrows, replace images, or delete slides.</p>
                    </div>

                    {slideshowImages.length > 0 && (
                        <Button
                            variant="danger"
                            size="sm"
                            leftIcon={<Trash2 size={14} />}
                            onClick={() => {
                                if (window.confirm('Are you sure you want to clear all slideshow images?')) {
                                    setSlideshowImages([])
                                    toast.success('All slides removed from staging')
                                }
                            }}
                        >
                            Clear All Slides
                        </Button>
                    )}
                </div>

                {slideshowImages.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {slideshowImages.map((url, idx) => (
                            <motion.div
                                key={`${url}-${idx}`}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative rounded-2xl overflow-hidden border border-dark-800 bg-dark-950 group shadow-lg flex flex-col"
                            >
                                {/* Slide Image Container */}
                                <div className="relative aspect-video w-full overflow-hidden bg-dark-900">
                                    <img src={url} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute top-2 left-2 px-2.5 py-1 bg-black/75 backdrop-blur-md rounded-full text-caption font-mono text-orange-primary font-bold border border-white/10">
                                        Slide {idx + 1}
                                    </div>

                                    {/* Action Hover Overlay */}
                                    <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2 p-3">
                                        {idx > 0 && (
                                            <button
                                                type="button"
                                                onClick={() => setSlideshowImages(prev => {
                                                    if (idx <= 0) return prev
                                                    const next = [...prev]
                                                    const item = next[idx]
                                                    const prevItem = next[idx - 1]
                                                    if (item !== undefined && prevItem !== undefined) {
                                                        next[idx] = prevItem
                                                        next[idx - 1] = item
                                                    }
                                                    return next
                                                })}
                                                className="p-2 bg-dark-800 hover:bg-orange-primary hover:text-black text-white rounded-full transition-colors cursor-pointer border border-white/10"
                                                title="Move Left"
                                            >
                                                <ChevronLeft size={16} />
                                            </button>
                                        )}

                                        <label className="p-2 bg-dark-800 hover:bg-orange-primary hover:text-black text-white rounded-full transition-colors cursor-pointer border border-white/10" title="Replace Image">
                                            <Edit2 size={16} />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                onChange={async (e) => {
                                                    const file = e.target.files?.[0]
                                                    if (file) {
                                                        const tid = toast.loading('Replacing slide image...')
                                                        try {
                                                            const urls = await uploadBatchImages('settings', 'homepage_slideshow', [file])
                                                            if (urls && urls.length > 0 && urls[0]) {
                                                                const replacementUrl = urls[0]
                                                                setSlideshowImages(prev => {
                                                                    const next = [...prev]
                                                                    next[idx] = replacementUrl
                                                                    return next
                                                                })
                                                                toast.success('Slide image replaced!', { id: tid })
                                                            } else {
                                                                toast.error('Failed to replace image', { id: tid })
                                                            }
                                                        } catch (err) {
                                                            toast.error('Error replacing image', { id: tid })
                                                        }
                                                    }
                                                }}
                                            />
                                        </label>

                                        {idx < slideshowImages.length - 1 && (
                                            <button
                                                type="button"
                                                onClick={() => setSlideshowImages(prev => {
                                                    if (idx >= prev.length - 1) return prev
                                                    const next = [...prev]
                                                    const item = next[idx]
                                                    const nextItem = next[idx + 1]
                                                    if (item !== undefined && nextItem !== undefined) {
                                                        next[idx] = nextItem
                                                        next[idx + 1] = item
                                                    }
                                                    return next
                                                })}
                                                className="p-2 bg-dark-800 hover:bg-orange-primary hover:text-black text-white rounded-full transition-colors cursor-pointer border border-white/10"
                                                title="Move Right"
                                            >
                                                <ChevronRight size={16} />
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => setSlideshowImages(prev => prev.filter((_, i) => i !== idx))}
                                            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors cursor-pointer"
                                            title="Remove Image"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 rounded-2xl border border-dashed border-dark-800 bg-dark-950 text-dark-500 space-y-2">
                        <ImageIcon size={32} className="mx-auto text-dark-600 mb-2" />
                        <p className="text-body-md font-medium text-dark-300">No custom slideshow images added yet</p>
                        <p className="text-caption text-dark-500">
                            The homepage is currently displaying system default hero images. Upload custom images above to personalize your homepage carousel.
                        </p>
                    </div>
                )}
            </Card>
        </div>
    )
}
