import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { normalizeSlideItems, type SlideItem } from '@/lib/imageUploader'

export type CarouselAnimation = 'simple' | 'cinematic' | 'zoom' | 'slide' | 'fade' | 'cube'

export interface SlideshowCarouselProps {
    slides: (string | SlideItem)[]
    defaultSlides?: string[]
    autoRotateIntervalMs?: number
    className?: string
    aspectRatioClass?: string
    showControls?: boolean
    showIndicators?: boolean
    showProgressBar?: boolean
    animationStyle?: CarouselAnimation
}

const animationVariants = {
    simple: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.4 },
    },
    cinematic: {
        initial: { opacity: 0, scale: 1.08, filter: 'blur(6px)' },
        animate: { opacity: 1, scale: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, scale: 0.96, filter: 'blur(6px)' },
        transition: { duration: 0.85, ease: [0.22, 1, 0.36, 1] },
    },
    zoom: {
        initial: { opacity: 0, scale: 1.25 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 },
        transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    slide: (direction: number) => ({
        initial: { x: direction > 0 ? '100%' : '-100%', opacity: 1 },
        animate: { x: '0%', opacity: 1 },
        exit: { x: direction > 0 ? '-100%' : '100%', opacity: 1 },
        transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
    }),
    fade: {
        initial: { opacity: 0, filter: 'blur(16px)' },
        animate: { opacity: 1, filter: 'blur(0px)' },
        exit: { opacity: 0, filter: 'blur(16px)' },
        transition: { duration: 0.6 },
    },
    cube: (direction: number) => ({
        initial: { opacity: 0, rotateY: direction > 0 ? 60 : -60, scale: 0.85 },
        animate: { opacity: 1, rotateY: 0, scale: 1 },
        exit: { opacity: 0, rotateY: direction > 0 ? -60 : 60, scale: 0.85 },
        transition: { duration: 0.7, ease: [0.34, 1.56, 0.64, 1] },
    }),
}

export function SlideshowCarousel({
    slides,
    defaultSlides = [],
    autoRotateIntervalMs = 4000,
    className = '',
    aspectRatioClass = 'aspect-video',
    showControls = true,
    showIndicators = true,
    showProgressBar = true,
    animationStyle = 'simple',
}: SlideshowCarouselProps) {
    const [currentIdx, setCurrentIdx] = useState(0)
    const [direction, setDirection] = useState<number>(1)
    const [isPaused, setIsPaused] = useState(false)
    const [failedUrls, setFailedUrls] = useState<Set<string>>(new Set())

    // 1. Normalize and filter active slides sorted by display_order
    const activeSlides: SlideItem[] = useMemo(() => {
        const normalized = normalizeSlideItems(slides)
        const active = normalized
            .filter(item => item.is_active && !failedUrls.has(item.url))
            .sort((a, b) => a.display_order - b.display_order)

        if (active.length > 0) {
            return active
        }

        // Fallback to default slides if provided
        return defaultSlides
            .filter(url => !failedUrls.has(url))
            .map((url, idx) => ({
                id: `default_${idx}`,
                url,
                title: '',
                display_order: idx,
                is_active: true,
                created_at: new Date().toISOString(),
            }))
    }, [slides, defaultSlides, failedUrls])

    // Reset index if slides list changes and index out of bounds
    useEffect(() => {
        if (currentIdx >= activeSlides.length && activeSlides.length > 0) {
            setCurrentIdx(0)
        }
    }, [activeSlides.length, currentIdx])

    // 2. Auto rotate timer (pauses on hover)
    useEffect(() => {
        if (activeSlides.length <= 1 || isPaused) return

        const timer = setInterval(() => {
            setDirection(1)
            setCurrentIdx(prev => (prev + 1) % activeSlides.length)
        }, autoRotateIntervalMs)

        return () => clearInterval(timer)
    }, [activeSlides.length, autoRotateIntervalMs, isPaused])

    const handleNext = () => {
        if (activeSlides.length <= 1) return
        setDirection(1)
        setCurrentIdx(prev => (prev + 1) % activeSlides.length)
    }

    const handlePrev = () => {
        if (activeSlides.length <= 1) return
        setDirection(-1)
        setCurrentIdx(prev => (prev - 1 + activeSlides.length) % activeSlides.length)
    }

    const handleImageError = (url: string) => {
        console.warn(`[SlideshowCarousel] Image failed to load: ${url}. Excluding slide.`)
        setFailedUrls(prev => new Set(prev).add(url))
    }

    if (activeSlides.length === 0) {
        return (
            <div className={`w-full ${aspectRatioClass} rounded-2xl bg-dark-900 border border-dark-800 flex items-center justify-center text-dark-500 text-body-sm ${className}`}>
                No slideshow images available
            </div>
        )
    }

    const currentSlide = activeSlides[currentIdx] || activeSlides[0]
    if (!currentSlide) return null

    const variantConfig = animationVariants[animationStyle] || animationVariants.simple
    const isDynamicVariant = typeof variantConfig === 'function'
    const currentVariant: any = isDynamicVariant ? variantConfig(direction) : variantConfig

    return (
        <div
            className={`relative w-full ${aspectRatioClass} rounded-2xl overflow-hidden border border-dark-800 bg-dark-950 group shadow-2xl ${className}`}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            style={{ perspective: '1000px' }}
        >
            {/* Top Auto-Play Progress Bar */}
            {showProgressBar && !isPaused && activeSlides.length > 1 && (
                <motion.div
                    key={`progress_${currentIdx}_${activeSlides.length}_${animationStyle}`}
                    initial={{ width: '0%' }}
                    animate={{ width: '100%' }}
                    transition={{ duration: autoRotateIntervalMs / 1000, ease: 'linear' }}
                    className="absolute top-0 left-0 h-1 bg-gradient-to-r from-orange-primary via-orange-light to-orange-primary z-30 opacity-90 shadow-glow"
                />
            )}

            {/* Image Slide Container */}
            <div className="w-full h-full relative overflow-hidden">
                <AnimatePresence initial={false} mode="wait" custom={direction}>
                    <motion.div
                        key={`${currentSlide.id || currentIdx}_${animationStyle}`}
                        custom={direction}
                        initial={currentVariant.initial}
                        animate={currentVariant.animate}
                        exit={currentVariant.exit}
                        transition={currentVariant.transition}
                        className="absolute inset-0 w-full h-full"
                    >
                        {animationStyle === 'cinematic' ? (
                            <motion.img
                                src={currentSlide.url}
                                alt={currentSlide.title || `Slide ${currentIdx + 1}`}
                                loading="lazy"
                                onError={() => handleImageError(currentSlide.url)}
                                animate={{ scale: [1.06, 1] }}
                                transition={{ duration: 4.5, ease: [0.16, 1, 0.3, 1] }}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <img
                                src={currentSlide.url}
                                alt={currentSlide.title || `Slide ${currentIdx + 1}`}
                                loading="lazy"
                                onError={() => handleImageError(currentSlide.url)}
                                className="w-full h-full object-cover"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent pointer-events-none" />

                        {/* Optional Title Caption */}
                        {currentSlide.title && (
                            <motion.div
                                initial={{ opacity: 0, y: 14 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4, delay: 0.15 }}
                                className="absolute bottom-6 left-6 right-6 z-10"
                            >
                                <span className="inline-block px-3 py-1 bg-black/60 backdrop-blur-md border border-white/10 rounded-full text-caption text-orange-primary uppercase tracking-wider mb-2">
                                    Slide {currentIdx + 1} of {activeSlides.length}
                                </span>
                                <h3 className="text-h3 text-white font-bold drop-shadow-md">
                                    {currentSlide.title}
                                </h3>
                            </motion.div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Next / Prev Chevrons */}
            {showControls && activeSlides.length > 1 && (
                <>
                    <button
                        type="button"
                        onClick={handlePrev}
                        aria-label="Previous Slide"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-orange-primary text-white hover:text-black border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-md hover:scale-110 active:scale-95"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        type="button"
                        onClick={handleNext}
                        aria-label="Next Slide"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 hover:bg-orange-primary text-white hover:text-black border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer backdrop-blur-md hover:scale-110 active:scale-95"
                    >
                        <ChevronRight size={20} />
                    </button>
                </>
            )}

            {/* Pagination Indicators */}
            {showIndicators && activeSlides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 max-w-[80%] overflow-x-auto p-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                    {activeSlides.map((_, idx) => (
                        <button
                            key={idx}
                            type="button"
                            onClick={() => {
                                setDirection(idx > currentIdx ? 1 : -1)
                                setCurrentIdx(idx)
                            }}
                            aria-label={`Go to slide ${idx + 1}`}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                                idx === currentIdx
                                    ? 'w-7 bg-orange-primary shadow-glow'
                                    : 'w-2 bg-white/40 hover:bg-white/70'
                            }`}
                        />
                    ))}
                </div>
            )}
        </div>
    )
}
