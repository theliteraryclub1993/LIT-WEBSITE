import { useState } from 'react'
import { motion } from 'framer-motion'
import { Image as ImageIcon } from 'lucide-react'
import { usePublicGallery, useGalleryAlbums } from '@/hooks/useGalleryImages'
import { useUIStore } from '@/store'
import { Button, PageLoader, EmptyState, Badge } from '@/components/ui'

export function GalleryPage() {
    const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null)
    const { data: albums } = useGalleryAlbums()
    const { data: images, isLoading } = usePublicGallery(selectedAlbum ? { album: selectedAlbum } : undefined)

    const openLightbox = useUIStore(s => s.openLightbox)

    const lightboxImages = images?.map(img => ({ url: img.url, caption: img.caption })) || []

    return (
        <div className="bg-black min-h-screen">
            <section className="relative pt-40 pb-12 overflow-hidden">
                {/* Cinematic background logo */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
                    animate={{ 
                        opacity: 0.08, 
                        scale: 1,
                        rotate: 0,
                        y: [0, 8, 0]
                    }}
                    transition={{ 
                        opacity: { duration: 1.2 },
                        scale: { duration: 1.5, ease: "easeOut" },
                        y: {
                            repeat: Infinity,
                            duration: 7,
                            ease: "easeInOut"
                        }
                    }}
                    className="absolute right-[2%] top-[10%] w-[30%] max-w-[300px] aspect-square pointer-events-none select-none z-0 hidden sm:block"
                    style={{
                        maskImage: 'linear-gradient(to left, black 30%, transparent 95%)',
                        WebkitMaskImage: 'linear-gradient(to left, black 30%, transparent 95%)'
                    }}
                >
                    <img 
                        src="/favicon.svg" 
                        alt="" 
                        className="w-full h-full object-contain filter drop-shadow-[0_0_80px_rgba(255,107,0,0.2)]"
                    />
                </motion.div>

                <div className="container-editorial relative z-10">
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-overline text-orange-primary tracking-mega block mb-4">Visual Stories</motion.span>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-display text-white mb-8">GALLERY</motion.h1>

                    {/* Album Filters */}
                    {albums && albums.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-wrap gap-2">
                            <Button
                                variant={!selectedAlbum ? 'primary' : 'outline'}
                                size="sm"
                                onClick={() => setSelectedAlbum(null)}
                            >
                                All
                            </Button>
                            {albums.map(album => (
                                <Button
                                    key={album}
                                    variant={selectedAlbum === album ? 'primary' : 'outline'}
                                    size="sm"
                                    onClick={() => setSelectedAlbum(album === selectedAlbum ? null : album)}
                                >
                                    {album}
                                </Button>
                            ))}
                        </motion.div>
                    )}
                </div>
            </section>

            <section className="pb-24">
                <div className="container-editorial">
                    {isLoading ? <PageLoader /> : !images?.length ? (
                        <EmptyState icon={<ImageIcon size={48} strokeWidth={1.5} />} title="No images found" />
                    ) : (
                        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                            {images.map((img, i) => (
                                <motion.div
                                    key={img.id}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: i * 0.03 }}
                                    className="break-inside-avoid group cursor-pointer relative overflow-hidden rounded-lg bg-dark-900 border border-dark-800 hover:border-dark-600 transition-colors"
                                    onClick={() => openLightbox(lightboxImages, i)}
                                >
                                    <img
                                        src={img.thumbnail_url || img.url}
                                        alt={img.caption || 'Gallery image'}
                                        className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                        {img.caption && <p className="text-caption text-white truncate">{img.caption}</p>}
                                        {img.album && <Badge variant="outline" size="sm" className="mt-1">{img.album}</Badge>}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}