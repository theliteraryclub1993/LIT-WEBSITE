import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useUIStore } from '@/store'

/**
 * Global lightbox component for full-screen image viewing.
 * Controlled entirely by useUIStore lightbox state.
 * Place once in the app root (AdminLayout or MainLayout).
 */
export function Lightbox() {
    const lightbox = useUIStore((s) => s.lightbox)
    const closeLightbox = useUIStore((s) => s.closeLightbox)
    const nextImage = useUIStore((s) => s.nextLightboxImage)
    const prevImage = useUIStore((s) => s.prevLightboxImage)

    const handleKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!lightbox.isOpen) return

            switch (e.key) {
                case 'Escape':
                    closeLightbox()
                    break
                case 'ArrowRight':
                    nextImage()
                    break
                case 'ArrowLeft':
                    prevImage()
                    break
            }
        },
        [lightbox.isOpen, closeLightbox, nextImage, prevImage]
    )

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown)
        if (lightbox.isOpen) {
            document.body.style.overflow = 'hidden'
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown)
            document.body.style.overflow = ''
        }
    }, [handleKeyDown, lightbox.isOpen])

    const currentImage = lightbox.images[lightbox.currentIndex]

    return (
        <AnimatePresence>
            {lightbox.isOpen && currentImage && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/95 backdrop-blur-lg"
                        onClick={closeLightbox}
                    />

                    {/* Close button */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-dark-800/80 text-white hover:bg-dark-700 transition-colors"
                        aria-label="Close lightbox"
                    >
                        <X size={20} />
                    </button>

                    {/* Counter */}
                    {lightbox.images.length > 1 && (
                        <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-full bg-dark-800/80 text-caption text-dark-200">
                            {lightbox.currentIndex + 1} / {lightbox.images.length}
                        </div>
                    )}

                    {/* Previous button */}
                    {lightbox.images.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                prevImage()
                            }}
                            className="absolute left-4 z-10 p-2 rounded-full bg-dark-800/80 text-white hover:bg-dark-700 transition-colors"
                            aria-label="Previous image"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    {/* Next button */}
                    {lightbox.images.length > 1 && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                nextImage()
                            }}
                            className="absolute right-4 z-10 p-2 rounded-full bg-dark-800/80 text-white hover:bg-dark-700 transition-colors"
                            aria-label="Next image"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}

                    {/* Image */}
                    <motion.div
                        key={lightbox.currentIndex}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="relative max-w-[90vw] max-h-[85vh] z-10"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <img
                            src={currentImage.url}
                            alt={currentImage.caption || 'Gallery image'}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg"
                        />

                        {/* Caption */}
                        {currentImage.caption && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent rounded-b-lg">
                                <p className="text-body-sm text-white text-center">
                                    {currentImage.caption}
                                </p>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}