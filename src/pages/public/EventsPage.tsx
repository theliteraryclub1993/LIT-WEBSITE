import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Download, MapPin, Phone, Award, Mic, Play, Calendar } from 'lucide-react'
import { Button, Card, Badge, EmptyState, PageLoader } from '@/components/ui'
import { formatDate } from '@/utils/formatDate'
import { cn } from '@/utils/cn'
import { noesisService } from '@/services/noesisService'
import { malnadFestService } from '@/services/malnadFestService'
import { sponsorService } from '@/services/sponsorService'
import { sparkService } from '@/services/sparkService'
import { supabase } from '@/lib/supabase'
import type { NoesisEdition, MalnadFest, Sponsor, GalleryImage, SparkSpeaker } from '@/types'
import malnadFestBg from '@/assets/malnad-fest-bg.png'

const parseBannerUrls = (banner: any): string[] => {
    if (!banner) return []
    let list: any[] = []
    if (Array.isArray(banner)) {
        list = banner
    } else if (typeof banner === 'string') {
        try {
            const parsed = JSON.parse(banner)
            if (Array.isArray(parsed)) {
                list = parsed
            } else {
                list = [parsed]
            }
        } catch (e) {
            list = [banner]
        }
    }
    return list
        .map(item => String(item).trim())
        .filter(item => item && item !== 'null' && item !== 'undefined')
}

export function EventsPage() {
    // Tab State: 'spark' | 'malnad' | 'noesis'
    const [activeTab, setActiveTab] = useState<'spark' | 'malnad' | 'noesis'>('spark')
    
    // Spark state
    const [sparkSpeakers, setSparkSpeakers] = useState<SparkSpeaker[]>([])
    const [sparkSearch, setSparkSearch] = useState('')
    const [sparkLoading, setSparkLoading] = useState(false)

    // Noesis state
    const [noesisLoading, setNoesisLoading] = useState(false)
    const [currentEdition, setCurrentEdition] = useState<NoesisEdition | null>(null)
    const [archiveEditions, setArchiveEditions] = useState<NoesisEdition[]>([])
    const [noesisPage, setNoesisPage] = useState(1)
    const [noesisTotalCount, setNoesisTotalCount] = useState(0)
    const noesisPageSize = 6

    // Malnad Fest state
    const [festLoading, setFestLoading] = useState(false)
    const [festInfo, setFestInfo] = useState<MalnadFest | null>(null)
    const [sponsors, setSponsors] = useState<Sponsor[]>([])
    const [festGallery, setFestGallery] = useState<GalleryImage[]>([])
    const [activeBannerIdx, setActiveBannerIdx] = useState(0)

    const bannerUrls = parseBannerUrls(festInfo?.banner)
    const displayBanners = bannerUrls.length > 0 ? bannerUrls : [malnadFestBg]

    const handleBannerScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const container = e.currentTarget
        const scrollLeft = container.scrollLeft
        const width = container.clientWidth
        if (width > 0) {
            const idx = Math.round(scrollLeft / width)
            setActiveBannerIdx(idx)
        }
    }

    // Load Spark data
    useEffect(() => {
        if (activeTab === 'spark') {
            setSparkLoading(true)
            sparkService.getSpeakers({ search: sparkSearch })
                .then(res => setSparkSpeakers(res.data || []))
                .finally(() => setSparkLoading(false))
        }
    }, [activeTab, sparkSearch])

    // Load Noesis data
    useEffect(() => {
        if (activeTab === 'noesis') {
            setNoesisLoading(true)
            Promise.all([
                noesisService.getCurrentEdition(),
                noesisService.getEditions({ page: noesisPage, pageSize: noesisPageSize })
            ]).then(([currentRes, listRes]) => {
                setCurrentEdition(currentRes.data)
                const filteredArchive = listRes.data.filter(e => e.id !== currentRes.data?.id)
                setArchiveEditions(filteredArchive)
                setNoesisTotalCount(listRes.count ? listRes.count - (currentRes.data ? 1 : 0) : 0)
            }).finally(() => {
                setNoesisLoading(false)
            })
        }
    }, [activeTab, noesisPage])

    // Load Malnad Fest data
    useEffect(() => {
        if (activeTab === 'malnad') {
            setFestLoading(true)
            Promise.all([
                malnadFestService.getFestInfo(),
                sponsorService.getSponsors(),
                supabase.from('gallery_images').select('*').eq('category', 'Malnad Fest').limit(8)
            ]).then(([festRes, sponsorRes, galleryRes]) => {
                setFestInfo(festRes.data)
                setSponsors(sponsorRes.data || [])
                setFestGallery((galleryRes.data as GalleryImage[]) || [])
            }).finally(() => {
                setFestLoading(false)
            })
        }
    }, [activeTab])

    return (
        <div className="bg-black min-h-screen">
            {/* Hero Header */}
            <section className="relative pt-36 pb-6 border-b border-dark-800 overflow-hidden">
                {/* Cinematic background logo */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
                    animate={{ 
                        opacity: 0.08, 
                        scale: 1,
                        rotate: 0,
                        y: [0, -10, 0]
                    }}
                    transition={{ 
                        opacity: { duration: 1 },
                        scale: { duration: 1.5, ease: "easeOut" },
                        y: {
                            repeat: Infinity,
                            duration: 6,
                            ease: "easeInOut"
                        }
                    }}
                    className="absolute right-[2%] top-1/2 -translate-y-1/2 w-[30%] max-w-[350px] aspect-square pointer-events-none select-none z-0 hidden sm:block"
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
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                        <span className="text-overline text-orange-primary tracking-mega block mb-2">Experiences & Expressions</span>
                        <h1 className="text-display text-white mb-6">EVENTS & SPARK</h1>
                    </motion.div>

                    {/* Tab Navigation */}
                    <div className="flex border-b border-dark-800">
                        <button
                            onClick={() => setActiveTab('spark')}
                            className={cn(
                                'px-6 py-3 text-body-sm font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer',
                                activeTab === 'spark'
                                    ? 'border-orange-primary text-orange-primary bg-orange-primary/5'
                                    : 'border-transparent text-dark-400 hover:text-white'
                            )}
                        >
                            Spark Platform
                        </button>
                        <button
                            onClick={() => setActiveTab('malnad')}
                            className={cn(
                                'px-6 py-3 text-body-sm font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer',
                                activeTab === 'malnad'
                                    ? 'border-orange-primary text-orange-primary bg-orange-primary/5'
                                    : 'border-transparent text-dark-400 hover:text-white'
                            )}
                        >
                            Malnad Fest
                        </button>
                        <button
                            onClick={() => setActiveTab('noesis')}
                            className={cn(
                                'px-6 py-3 text-body-sm font-semibold tracking-wider uppercase border-b-2 transition-all cursor-pointer',
                                activeTab === 'noesis'
                                    ? 'border-orange-primary text-orange-primary bg-orange-primary/5'
                                    : 'border-transparent text-dark-400 hover:text-white'
                            )}
                        >
                            Noesis (E-Magazine)
                        </button>
                    </div>
                </div>
            </section>

            {/* Content Area */}
            <section className="py-12 pb-24">
                <div className="container-editorial">
                    
                    {/* TAB 1: SPARK SPEAKER PLATFORM */}
                    {activeTab === 'spark' && (
                        <div className="space-y-12">
                            {/* Platform Info Hero */}
                            <div className="p-8 border border-dark-800 bg-dark-950/40 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="space-y-2 max-w-2xl">
                                    <div className="flex items-center gap-2 text-orange-primary font-mono text-overline tracking-wider">
                                        <Mic size={16} /> Ignite Your Future!!
                                    </div>
                                    <h2 className="text-h2 text-white">SPARKS</h2>
                                    <p className="text-body text-dark-100 leading-relaxed font-semibold">
                                        Every extraordinary achievement starts with a single spark….. born from curiosity, courage and strong determination.
                                    </p>
                                    <p className="text-body-sm text-dark-400 leading-relaxed">
                                        The path to success is never free of obstacles, but every challenge conquered becomes the fuel that drives you closer to your dreams. SPARKS brings together inspiring minds, powerful stories and transformative experiences that inspire you to dream bigger, think bolder and become the best version of yourself!!!
                                    </p>
                                </div>
                                <div className="w-full md:w-80 shrink-0">
                                    <input
                                        type="text"
                                        placeholder="Search speakers or talks..."
                                        value={sparkSearch}
                                        onChange={(e) => setSparkSearch(e.target.value)}
                                        className="w-full bg-dark-900 border border-dark-750 focus:border-orange-primary focus:ring-1 focus:ring-orange-primary rounded-lg p-3 text-body-sm text-white placeholder-dark-600 focus:outline-none"
                                    />
                                </div>
                            </div>

                            {sparkLoading ? (
                                <PageLoader label="Loading speakers..." />
                            ) : sparkSpeakers.length === 0 ? (
                                <EmptyState
                                    icon={<Mic size={48} strokeWidth={1.5} />}
                                    title={sparkSearch ? "No speakers found" : "No speakers listed yet"}
                                    description={sparkSearch ? "Try a different search term." : "Sessions will be listed here soon."}
                                />
                            ) : (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {sparkSpeakers.map((speaker, i) => (
                                        <motion.div
                                            key={speaker.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                        >
                                            <Card variant="bordered" padding="none" className="overflow-hidden bg-dark-950/20 h-full flex flex-col justify-between">
                                                <div className="p-6 md:p-8 space-y-4">
                                                    <div className="flex gap-4 items-center">
                                                        <div className="w-16 h-16 rounded-full overflow-hidden bg-dark-800 border border-dark-700 shrink-0">
                                                            {speaker.image_url ? (
                                                                <img src={speaker.image_url} alt={speaker.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-dark-500 bg-dark-850"><Mic size={24} /></div>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-h4 text-white font-semibold">{speaker.name}</h3>
                                                            <p className="text-caption text-dark-400">{speaker.designation}</p>
                                                        </div>
                                                    </div>

                                                    <div className="space-y-2 pt-2 border-t border-dark-850">
                                                        <Badge variant="orange" size="sm" className="font-mono">Talk Topic</Badge>
                                                        <h4 className="text-h5 text-white font-medium">{speaker.topic}</h4>
                                                        <p className="text-[10px] text-dark-500 font-mono">Date: {formatDate(speaker.talk_date, 'MMMM d, yyyy')}</p>
                                                    </div>

                                                    {speaker.description && (
                                                        <p className="text-body-sm text-dark-300 leading-relaxed line-clamp-4">
                                                            {speaker.description}
                                                        </p>
                                                    )}
                                                </div>

                                                {speaker.video_url && (
                                                    <div className="px-6 md:px-8 pb-6 shrink-0">
                                                        <Button
                                                            onClick={() => window.open(speaker.video_url!, '_blank')}
                                                            variant="outline"
                                                            size="sm"
                                                            className="w-full gap-2 text-orange-primary hover:text-white border-dark-700 hover:border-orange-primary cursor-pointer"
                                                        >
                                                            <Play size={14} fill="currentColor" /> Watch Talk Experience
                                                        </Button>
                                                    </div>
                                                )}
                                            </Card>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* TAB 2: MALNAD FEST */}
                    {activeTab === 'malnad' && (
                        <div>
                            {festLoading ? (
                                <PageLoader label="Loading fest details..." />
                            ) : !festInfo ? (
                                <EmptyState
                                    icon={<Calendar size={48} strokeWidth={1.5} />}
                                    title="Malnad Fest configurations missing"
                                    description="Configure the fest details in the Admin Panel to display them here."
                                />
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
                                    {/* Hero / Banner */}
                                    <div className="relative rounded-3xl overflow-hidden border border-dark-800 bg-dark-950/40">
                                        <div 
                                            className="aspect-video md:aspect-[21/9] w-full bg-dark-900 relative flex overflow-x-auto snap-x snap-mandatory scroll-smooth hide-scrollbar"
                                            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                                            onScroll={handleBannerScroll}
                                        >
                                            <style>{`
                                                .hide-scrollbar::-webkit-scrollbar {
                                                    display: none;
                                                }
                                            `}</style>
                                            {displayBanners.map((url, idx) => (
                                                <div key={idx} className="w-full h-full shrink-0 snap-start relative">
                                                    <img
                                                        src={url}
                                                        alt={`${festInfo.fest_name} Banner ${idx + 1}`}
                                                        className="w-full h-full object-cover opacity-80"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-transparent" />
                                                </div>
                                            ))}
                                        </div>
                                        
                                        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 flex flex-col md:flex-row md:items-end justify-between gap-6 pointer-events-none z-10">
                                            <div className="space-y-3 max-w-2xl">
                                                {festInfo.logo && (
                                                    <img src={festInfo.logo} alt="Fest Logo" className="h-16 w-auto mb-2 object-contain" />
                                                )}
                                                <Badge variant="orange" className="tracking-widest uppercase font-semibold">{festInfo.theme || 'Flagship Fest'}</Badge>
                                                <h2 className="text-display-sm text-white font-bold">{festInfo.fest_name}</h2>
                                                <p className="text-h5 text-orange-primary font-normal font-mono italic">{festInfo.tagline}</p>
                                            </div>
                                        </div>

                                        {displayBanners.length > 1 && (
                                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-20 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm pointer-events-none">
                                                {displayBanners.map((_, idx) => (
                                                    <div
                                                        key={idx}
                                                        className={cn(
                                                            "w-1.5 h-1.5 rounded-full transition-all duration-300",
                                                            activeBannerIdx === idx ? "bg-orange-primary w-3" : "bg-white/40"
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>

                                    {/* Description and Details */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                        <div className="lg:col-span-2 space-y-6">
                                            <h3 className="text-h3 text-white border-b border-dark-800 pb-2">About The Fest</h3>
                                            <p className="text-body-lg text-dark-300 leading-relaxed white-space-pre-wrap">
                                                {festInfo.description}
                                            </p>
                                        </div>
                                        
                                        <div className="space-y-8 bg-dark-950/50 border border-dark-800 p-8 rounded-2xl">
                                            <h4 className="text-h4 text-white font-semibold">Fest Details</h4>
                                            
                                            <div className="space-y-6">
                                                {festInfo.date && (
                                                    <div className="flex items-start gap-4">
                                                        <Calendar className="text-orange-primary shrink-0 mt-1" size={20} />
                                                        <div>
                                                            <p className="text-caption text-dark-500 uppercase tracking-wider font-mono">Date</p>
                                                            <p className="text-body text-white font-medium">{festInfo.date}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {festInfo.venue && (
                                                    <div className="flex items-start gap-4">
                                                        <MapPin className="text-orange-primary shrink-0 mt-1" size={20} />
                                                        <div>
                                                            <p className="text-caption text-dark-500 uppercase tracking-wider font-mono">Venue</p>
                                                            <p className="text-body text-white font-medium">{festInfo.venue}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {festInfo.contacts && Array.isArray(festInfo.contacts) && (
                                                    <div className="flex items-start gap-4">
                                                        <Phone className="text-orange-primary shrink-0 mt-1" size={20} />
                                                        <div className="space-y-2 flex-1">
                                                            <p className="text-caption text-dark-500 uppercase tracking-wider font-mono">Contacts</p>
                                                            {festInfo.contacts.map((c: any, idx) => (
                                                                <div key={idx} className="text-body text-white font-medium">
                                                                    <span className="text-dark-400 text-body-sm">{c.name}:</span> {c.contact}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Rulebook Column */}
                                    {(festInfo.rulebook_pdf || festInfo.rulebook_docx) && (
                                        <div className="p-8 border border-dark-800 bg-orange-primary/5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-2 text-orange-primary font-mono text-overline tracking-wider">
                                                    <Award size={16} /> OFFICIAL PUBLICATION
                                                </div>
                                                <h3 className="text-h3 text-white">Fest Rulebook & Guidelines</h3>
                                                <p className="text-body-sm text-dark-400">Download the official rules, eligibility criteria, and format details for all 35+ sub-events.</p>
                                            </div>
                                            <div className="flex flex-wrap gap-4 shrink-0">
                                                {festInfo.rulebook_pdf && (
                                                    <Button 
                                                        onClick={() => window.open(festInfo.rulebook_pdf!, '_blank')}
                                                        variant="primary" 
                                                        className="gap-2 cursor-pointer"
                                                    >
                                                        <BookOpen size={16} /> View PDF Rulebook
                                                    </Button>
                                                )}
                                                {festInfo.rulebook_docx && (
                                                    <Button 
                                                        onClick={() => window.open(festInfo.rulebook_docx!, '_blank')}
                                                        variant="outline" 
                                                        className="gap-2 cursor-pointer"
                                                    >
                                                        <Download size={16} /> Download DOCX
                                                    </Button>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {/* Gallery Section */}
                                    {festGallery.length > 0 && (
                                        <div className="space-y-6">
                                            <h3 className="text-h3 text-white border-b border-dark-800 pb-2">Fest Highlights</h3>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {festGallery.map((img) => (
                                                    <div key={img.id} className="relative aspect-square rounded-xl overflow-hidden group border border-dark-800 bg-dark-950">
                                                        <img src={img.url} alt={img.caption || "Fest Highlight"} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                                        {img.caption && (
                                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4 text-center">
                                                                <p className="text-body-sm text-white font-medium">{img.caption}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Sponsors Section */}
                                    {sponsors.length > 0 && (
                                        <div className="space-y-6 text-center border-t border-dark-800 pt-16">
                                            <span className="text-overline text-dark-500 tracking-mega">PROUDLY SPONSORED BY</span>
                                            <div className="flex flex-wrap items-center justify-center gap-12 mt-6">
                                                {sponsors.map((sp) => (
                                                    <a 
                                                        key={sp.id} 
                                                        href={sp.website || '#'} 
                                                        target="_blank" 
                                                        rel="noopener noreferrer" 
                                                        className="group block transition-opacity hover:opacity-100 opacity-60"
                                                    >
                                                        {sp.logo ? (
                                                            <img src={sp.logo} alt={sp.name} className="h-12 w-auto object-contain filter grayscale invert group-hover:grayscale-0 group-hover:invert-0 transition-all duration-300" />
                                                        ) : (
                                                            <span className="text-h4 text-dark-400 group-hover:text-white transition-colors">{sp.name}</span>
                                                        )}
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    )}

                    {/* TAB 3: NOESIS E-MAGAZINE */}
                    {activeTab === 'noesis' && (
                        <div>
                            {noesisLoading ? (
                                <PageLoader label="Loading magazine issues..." />
                            ) : (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-16">
                                    {/* Current Edition Section */}
                                    {currentEdition && (
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-2 text-orange-primary font-mono text-overline tracking-wider">
                                                <BookOpen size={16} /> LATEST ISSUE
                                            </div>
                                            <Card variant="bordered" padding="none" className="overflow-hidden bg-dark-950/20">
                                                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 p-8 md:p-12 items-center">
                                                    
                                                    {/* Cover Column */}
                                                    <div className="md:col-span-2 flex justify-center">
                                                        <div className="relative aspect-[3/4] w-64 md:w-80 bg-dark-900 rounded-lg overflow-hidden shadow-2xl border border-dark-700 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                                            {currentEdition.cover_image ? (
                                                                <img src={currentEdition.cover_image} alt={currentEdition.title} className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-center text-dark-600 gap-2">
                                                                    <BookOpen size={64} />
                                                                    <span className="text-caption font-mono">NO COVER IMAGE</span>
                                                                </div>
                                                            )}
                                                            <div className="absolute top-3 right-3">
                                                                <Badge variant="orange" size="sm">Current</Badge>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    
                                                    {/* Details Column */}
                                                    <div className="md:col-span-3 space-y-6">
                                                        <div className="space-y-2">
                                                            <span className="text-overline text-orange-primary block font-mono">{currentEdition.edition_number}</span>
                                                            <h2 className="text-h2 text-white font-bold leading-tight">{currentEdition.title}</h2>
                                                            <p className="text-caption text-dark-500">Published on {formatDate(currentEdition.publish_date, 'MMMM d, yyyy')}</p>
                                                        </div>
                                                        
                                                        {currentEdition.description && (
                                                            <p className="text-body-lg text-dark-300 leading-relaxed">
                                                                {currentEdition.description}
                                                            </p>
                                                        )}

                                                        <div className="flex flex-wrap gap-4 pt-2">
                                                            {currentEdition.pdf_file && (
                                                                <>
                                                                    <Button 
                                                                        onClick={() => window.open(currentEdition.pdf_file!, '_blank')}
                                                                        variant="primary" 
                                                                        className="gap-2 cursor-pointer"
                                                                    >
                                                                        <BookOpen size={16} /> Read Online
                                                                    </Button>
                                                                    <Button 
                                                                        onClick={() => {
                                                                            const link = document.createElement('a');
                                                                            link.href = currentEdition.pdf_file!;
                                                                            link.download = `${currentEdition.title}.pdf`;
                                                                            document.body.appendChild(link);
                                                                            link.click();
                                                                            document.body.removeChild(link);
                                                                        }}
                                                                        variant="outline" 
                                                                        className="gap-2 cursor-pointer"
                                                                    >
                                                                        <Download size={16} /> Download PDF
                                                                    </Button>
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </Card>
                                        </div>
                                    )}

                                    {/* Archive Editions Section */}
                                    <div className="space-y-8 border-t border-dark-800 pt-12">
                                        <h3 className="text-h3 text-white border-b border-dark-800 pb-2">Archive Editions</h3>
                                        
                                        {archiveEditions.length === 0 ? (
                                            <EmptyState
                                                icon={<BookOpen size={48} strokeWidth={1.5} />}
                                                title="No archives found"
                                                description="Check back later for past publications."
                                            />
                                        ) : (
                                            <>
                                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                                    {archiveEditions.map((edition) => (
                                                        <Card key={edition.id} variant="bordered" padding="none" className="overflow-hidden flex flex-col h-full bg-dark-950/20">
                                                            <div className="aspect-[4/3] bg-dark-900 relative overflow-hidden flex items-center justify-center border-b border-dark-850">
                                                                {edition.cover_image ? (
                                                                    <img src={edition.cover_image} alt={edition.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                                                                ) : (
                                                                    <BookOpen size={40} className="text-dark-700" />
                                                                )}
                                                                <div className="absolute top-3 left-3">
                                                                    <Badge variant="default" size="sm" className="font-mono">{edition.edition_number}</Badge>
                                                                </div>
                                                            </div>
                                                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                                                <div className="space-y-1">
                                                                    <p className="text-[10px] text-dark-500 font-mono">{formatDate(edition.publish_date, 'MMM d, yyyy')}</p>
                                                                    <h4 className="text-h5 text-white font-semibold line-clamp-1">{edition.title}</h4>
                                                                    {edition.description && <p className="text-body-sm text-dark-400 line-clamp-2">{edition.description}</p>}
                                                                </div>
                                                                
                                                                {edition.pdf_file && (
                                                                    <div className="flex gap-3 pt-2">
                                                                        <button 
                                                                            onClick={() => window.open(edition.pdf_file!, '_blank')}
                                                                            className="flex-1 py-2 text-center text-body-sm font-semibold border border-dark-700 hover:border-white rounded-lg transition-colors text-white cursor-pointer"
                                                                        >
                                                                            View
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => {
                                                                                const link = document.createElement('a');
                                                                                link.href = edition.pdf_file!;
                                                                                link.download = `${edition.title}.pdf`;
                                                                                document.body.appendChild(link);
                                                                                link.click();
                                                                                document.body.removeChild(link);
                                                                            }}
                                                                            className="flex-1 py-2 text-center text-body-sm font-semibold bg-dark-850 hover:bg-dark-700 rounded-lg transition-colors text-dark-200 cursor-pointer"
                                                                        >
                                                                            Download
                                                                        </button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>

                                                {/* Archive Pagination */}
                                                {noesisTotalCount > noesisPageSize && (
                                                    <div className="flex justify-center items-center gap-4 pt-6 border-t border-dark-850">
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={noesisPage === 1}
                                                            onClick={() => setNoesisPage(p => Math.max(1, p - 1))}
                                                            className="cursor-pointer"
                                                        >
                                                            Previous
                                                        </Button>
                                                        <span className="text-body-sm font-mono text-dark-400">
                                                            Page {noesisPage} of {Math.ceil(noesisTotalCount / noesisPageSize)}
                                                        </span>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            disabled={noesisPage >= Math.ceil(noesisTotalCount / noesisPageSize)}
                                                            onClick={() => setNoesisPage(p => p + 1)}
                                                            className="cursor-pointer"
                                                        >
                                                            Next
                                                        </Button>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}