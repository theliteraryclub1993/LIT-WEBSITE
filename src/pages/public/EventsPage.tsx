import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { BookOpen, Download, MapPin, Phone, Award, Mic, Play, Calendar } from 'lucide-react'
import { Button, Card, Badge, EmptyState, PageLoader, SlideshowCarousel } from '@/components/ui'
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
            list = Array.isArray(parsed) ? parsed : [parsed]
        } catch {
            list = [banner]
        }
    }
    return list
        .map(item => String(item).trim())
        .filter(item => item && item !== 'null' && item !== 'undefined')
}


import { useSearchParams } from 'react-router-dom'

export function EventsPage() {
    const [searchParams] = useSearchParams()
    const initialTabParam = searchParams.get('tab')
    const defaultTab = (initialTabParam === 'malnad' || initialTabParam === 'noesis' || initialTabParam === 'spark') 
        ? initialTabParam 
        : 'malnad'

    // Tab State: 'malnad' | 'noesis' | 'spark'
    const [activeTab, setActiveTab] = useState<'malnad' | 'noesis' | 'spark'>(defaultTab)

    useEffect(() => {
        const param = searchParams.get('tab')
        if (param === 'malnad' || param === 'noesis' || param === 'spark') {
            setActiveTab(param)
        }
    }, [searchParams])
    
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
    const [failedCoverUrls, setFailedCoverUrls] = useState<Set<string>>(new Set())
    const noesisPageSize = 6

    const handlePdfView = (pdfUrl: string) => {
        if (pdfUrl.includes('drive.google.com')) {
            const fileIdMatch = pdfUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || pdfUrl.match(/id=([a-zA-Z0-9_-]+)/)
            if (fileIdMatch && fileIdMatch[1]) {
                window.open(`https://drive.google.com/file/d/${fileIdMatch[1]}/view`, '_blank', 'noopener,noreferrer')
                return
            }
        }
        window.open(pdfUrl, '_blank', 'noopener,noreferrer')
    }

    const handlePdfDownload = (pdfUrl: string, title: string) => {
        if (pdfUrl.includes('drive.google.com')) {
            const fileIdMatch = pdfUrl.match(/\/d\/([a-zA-Z0-9_-]+)/) || pdfUrl.match(/id=([a-zA-Z0-9_-]+)/)
            if (fileIdMatch && fileIdMatch[1]) {
                window.open(`https://drive.google.com/uc?export=download&id=${fileIdMatch[1]}`, '_blank', 'noopener,noreferrer')
                return
            }
            window.open(pdfUrl, '_blank', 'noopener,noreferrer')
            return
        }

        const link = document.createElement('a')
        link.href = pdfUrl
        link.download = `${title}.pdf`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    // Malnad Fest state
    const [festLoading, setFestLoading] = useState(false)
    const [festInfo, setFestInfo] = useState<MalnadFest | null>(null)
    const [sponsors, setSponsors] = useState<Sponsor[]>([])
    const [festGallery, setFestGallery] = useState<GalleryImage[]>([])

    // Memoize banner URLs so the reference is stable across renders
    const displayBanners = useMemo(() => {
        const parsed = parseBannerUrls(festInfo?.banner)
        console.log('[EventsPage] festInfo.banner raw:', festInfo?.banner)
        console.log('[EventsPage] Parsed banner URLs:', parsed)
        return parsed.length > 0 ? parsed : [malnadFestBg]
    }, [festInfo?.banner])

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
            <section className="relative pt-20 sm:pt-24 pb-6 border-b border-dark-800 overflow-hidden">
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
                                    {/* Malnad Fest Flagship Editorial Intro */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-dark-900/40 border border-dark-800 p-8 sm:p-12 rounded-2xl">
                                        <div>
                                            <span className="text-overline text-orange-primary tracking-mega block mb-3">The Flagship</span>
                                            <h2 className="text-h1 text-white mb-4">THE MALNAD FEST</h2>
                                            <p className="text-h4 text-orange-primary font-semibold tracking-wide mb-4">
                                                NOT JUST AN EVENT. A CHAPTER.
                                            </p>
                                            <p className="text-body text-dark-100 leading-relaxed mb-4">
                                                Long after the lights dim and the stages empty, the stories remain.
                                            </p>
                                            <p className="text-body-sm text-dark-400 leading-relaxed mb-6">
                                                Malnad Fest is a celebration of talent, friendship, and unforgettable experiences that become part of every student's journey. From moments of fierce competition to memories that last a lifetime, it brings the entire campus together in a shared spirit of creativity, ambition, and celebration.
                                            </p>
                                            <div className="flex gap-8 pt-4 border-t border-dark-800">
                                                <div>
                                                    <h4 className="text-h3 text-white font-bold">2.5K+</h4>
                                                    <p className="text-caption text-dark-500">Participants</p>
                                                </div>
                                                <div className="border-l border-dark-800 pl-8">
                                                    <h4 className="text-h3 text-white font-bold">40+</h4>
                                                    <p className="text-caption text-dark-500">Events</p>
                                                </div>
                                                <div className="border-l border-dark-800 pl-8">
                                                    <h4 className="text-h3 text-white font-bold">1</h4>
                                                    <p className="text-caption text-dark-500">Prestigious Sarvottam Title</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-dark-950 border border-dark-800 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-radial-gradient from-orange-primary/5 via-transparent to-transparent pointer-events-none" />
                                            <h3 className="text-h4 text-white">THE QUEST FOR SARVOTTAM</h3>
                                            <p className="text-body-sm text-dark-400 leading-relaxed">
                                                Malnad Fest is where talent meets opportunity and effort meets recognition. Every event becomes a chance to inspire, challenge limits, and leave a lasting impression.
                                            </p>
                                            <p className="text-body-sm text-dark-400 leading-relaxed">
                                                The journey culminates in the pursuit of <strong>"Sarvottam"</strong> the highest accolade awarded to the branch that exemplifies excellence across every dimension.
                                            </p>
                                            <div className="h-0.5 bg-dark-800" />
                                            <div className="flex items-center gap-3">
                                                <Award className="text-orange-primary shrink-0" size={20} />
                                                <span className="text-caption text-white font-semibold tracking-wider uppercase">Championship Title: SARVOTTAM</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* The Four Pillars Categories Grid */}
                                    <div className="space-y-8">
                                        <div className="text-center max-w-xl mx-auto">
                                            <span className="text-overline text-orange-primary tracking-mega block mb-2">Categories</span>
                                            <h2 className="text-h2 text-white">THE FOUR PILLARS</h2>
                                            <p className="text-body-sm text-dark-400 mt-1">The events are structured across four major areas, offering something for everyone.</p>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="bg-dark-900/60 border border-dark-800 rounded-2xl p-6 relative overflow-hidden group hover:border-dark-700 transition-all duration-300">
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-600 to-orange-400" />
                                                <div className="space-y-3">
                                                    <div>
                                                        <h3 className="text-h3 text-white tracking-wider font-bold">BALWAAN</h3>
                                                        <p className="text-overline text-orange-primary font-semibold tracking-widest mt-1">PUSH. PERSEVERE. PREVAIL.</p>
                                                    </div>
                                                    <p className="text-body-sm text-dark-200 leading-relaxed">
                                                        Every challenge begins with a choice to step forward. Whether it's Pentathlon, Desafio, Scavenger Hunt, Game On, or Tug of War, Balwaan celebrates resilience, teamwork, and determination, alongside a host of exciting challenges that test both grit and spirit.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-dark-900/60 border border-dark-800 rounded-2xl p-6 relative overflow-hidden group hover:border-dark-700 transition-all duration-300">
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-500 to-zinc-300" />
                                                <div className="space-y-3">
                                                    <div>
                                                        <h3 className="text-h3 text-white tracking-wider font-bold">BUDDHIMAAN</h3>
                                                        <p className="text-overline text-orange-primary font-semibold tracking-widest mt-1">WHERE THINKING MAKES THE DIFFERENCE.</p>
                                                    </div>
                                                    <p className="text-body-sm text-dark-200 leading-relaxed">
                                                        Not every victory is earned through strength. Some are won through ideas, strategy, and perspective. Featuring Knockout, Literati, and Toastmaster, alongside a diverse lineup of intellectual challenges, Buddhimaan rewards those who think beyond the obvious.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-dark-900/60 border border-dark-800 rounded-2xl p-6 relative overflow-hidden group hover:border-dark-700 transition-all duration-300">
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-zinc-400" />
                                                <div className="space-y-3">
                                                    <div>
                                                        <h3 className="text-h3 text-white tracking-wider font-bold">DARPAN</h3>
                                                        <p className="text-overline text-orange-primary font-semibold tracking-widest mt-1">LET YOUR PASSION BE SEEN.</p>
                                                    </div>
                                                    <p className="text-body-sm text-dark-200 leading-relaxed">
                                                        Some moments deserve more than applause they deserve to be remembered. From Antakshari, Campus Beats, and Naa Kanda Malnad to a variety of crowd-favourite performances, Darpan celebrates creativity, culture, and the joy of expression.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="bg-dark-900/60 border border-dark-800 rounded-2xl p-6 relative overflow-hidden group hover:border-dark-700 transition-all duration-300">
                                                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-700 to-orange-500" />
                                                <div className="space-y-3">
                                                    <div>
                                                        <h3 className="text-h3 text-white tracking-wider font-bold">KALAKRUTHI</h3>
                                                        <p className="text-overline text-orange-primary font-semibold tracking-widest mt-1">EVERY CREATION HAS A STORY.</p>
                                                    </div>
                                                    <p className="text-body-sm text-dark-200 leading-relaxed">
                                                        Great ideas begin with imagination. Through Art-a-thon and Chitrakatha, plus a collection of creative experiences, Kalakruthi transforms imagination into artistry and celebrates originality in every form.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {/* Hero / Banner Slideshow */}
                                    <div className="relative rounded-3xl overflow-hidden border border-dark-800 bg-dark-950/40 group">
                                        <SlideshowCarousel
                                            slides={displayBanners}
                                            defaultSlides={[malnadFestBg]}
                                            autoRotateIntervalMs={4000}
                                            aspectRatioClass="aspect-video md:aspect-[21/9]"
                                        />

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
                                                                <div key={idx} className="text-body text-white font-medium mb-3">
                                                                    <div className="text-dark-400 text-body-sm">{c.name}:</div>
                                                                    <div className="text-white font-semibold font-mono tracking-wide">{c.contact}</div>
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
                                    {/* Editorial Noesis Intro */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-dark-900/40 border border-dark-800 p-8 sm:p-12 rounded-2xl">
                                        <div>
                                            <span className="text-overline text-orange-primary tracking-mega block mb-3">The E-Magazine</span>
                                            <h2 className="text-h1 text-white mb-4">NOESIS</h2>
                                            <p className="text-h4 text-orange-primary font-semibold tracking-wide mb-4">
                                                WORDS · BRUSH STROKES · PIXELS
                                            </p>
                                            <p className="text-body text-dark-100 leading-relaxed mb-4">
                                                Every story begins with a thought, and every thought deserves a place to be heard.
                                            </p>
                                            <p className="text-body-sm text-dark-400 leading-relaxed mb-6">
                                                <strong>Noesis</strong> is the Literary Club's annual magazine that celebrates imagination in all its forms from poetry and prose to artwork and photography. It is a collection of voices, perspectives, and creativity that reflects the spirit of Malnad College of Engineering.
                                            </p>
                                            <div className="flex gap-8 pt-4 border-t border-dark-800">
                                                <div>
                                                    <h4 className="text-h3 text-white font-bold">5th</h4>
                                                    <p className="text-caption text-dark-500">Edition</p>
                                                </div>
                                                <div className="border-l border-dark-800 pl-8">
                                                    <h4 className="text-h3 text-white font-bold">100+</h4>
                                                    <p className="text-caption text-dark-500">Contributions</p>
                                                </div>
                                                <div className="border-l border-dark-800 pl-8">
                                                    <h4 className="text-h3 text-white font-bold">Annual</h4>
                                                    <p className="text-caption text-dark-500">Publication</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-dark-950 border border-dark-800 rounded-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
                                            <div className="absolute inset-0 bg-radial-gradient from-orange-primary/5 via-transparent to-transparent pointer-events-none" />
                                            <h3 className="text-h4 text-white">VOICES OF MALNAD</h3>
                                            <p className="text-body-sm text-dark-400 leading-relaxed">
                                                A platform where budding writers, poets, artists, and thinkers showcase their creative skills and perspectives to the entire campus community.
                                            </p>
                                            <p className="text-body-sm text-dark-400 leading-relaxed">
                                                Published annually by The Literary Club, capturing the essence of student life, culture, and artistic expression at Malnad College of Engineering.
                                            </p>
                                            <div className="h-0.5 bg-dark-800" />
                                            <div className="flex items-center gap-3">
                                                <Award className="text-orange-primary shrink-0" size={20} />
                                                <span className="text-caption text-white font-semibold tracking-wider uppercase">ANNUAL LITERARY MAGAZINE: NOESIS</span>
                                            </div>
                                        </div>
                                    </div>
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
                                                        <div className="relative aspect-[3/4] w-64 md:w-80 bg-gradient-to-br from-dark-900 via-black to-dark-950 rounded-lg overflow-hidden shadow-2xl border border-dark-700 transform rotate-1 hover:rotate-0 transition-transform duration-500">
                                                            {currentEdition.cover_image && !failedCoverUrls.has(currentEdition.cover_image) ? (
                                                                <img
                                                                    src={currentEdition.cover_image}
                                                                    alt={currentEdition.title}
                                                                    onError={() => setFailedCoverUrls(prev => new Set(prev).add(currentEdition.cover_image!))}
                                                                    className="w-full h-full object-contain bg-black/90"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex flex-col items-center justify-between p-6 bg-gradient-to-b from-orange-primary/10 via-black to-dark-950 border border-orange-primary/20 text-center">
                                                                    <span className="text-overline text-orange-primary font-mono tracking-widest">{currentEdition.edition_number}</span>
                                                                    <div className="space-y-3 my-auto">
                                                                        <BookOpen size={48} className="text-orange-primary mx-auto" />
                                                                        <h3 className="text-h3 text-white font-bold leading-tight drop-shadow">{currentEdition.title}</h3>
                                                                        <p className="text-caption text-dark-400">NOESIS E-MAGAZINE</p>
                                                                    </div>
                                                                    <span className="text-caption text-dark-500 font-mono">{formatDate(currentEdition.publish_date, 'MMMM yyyy')}</span>
                                                                </div>
                                                            )}
                                                            <div className="absolute top-3 right-3 z-10">
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
                                                                        onClick={() => handlePdfView(currentEdition.pdf_file!)}
                                                                        variant="primary" 
                                                                        className="gap-2 cursor-pointer"
                                                                    >
                                                                        <BookOpen size={16} /> Read Online
                                                                    </Button>
                                                                    <Button 
                                                                        onClick={() => handlePdfDownload(currentEdition.pdf_file!, currentEdition.title)}
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
                                                        <Card key={edition.id} variant="bordered" padding="none" className="overflow-hidden flex flex-col h-full bg-dark-950/20 border-dark-800">
                                                            <div className="aspect-[3/4] bg-dark-950 relative overflow-hidden flex items-center justify-center border-b border-dark-850 p-2">
                                                                {edition.cover_image && !failedCoverUrls.has(edition.cover_image) ? (
                                                                    <img
                                                                        src={edition.cover_image}
                                                                        alt={edition.title}
                                                                        onError={() => setFailedCoverUrls(prev => new Set(prev).add(edition.cover_image!))}
                                                                        className="w-full h-full object-contain rounded transition-transform duration-500 hover:scale-105"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center bg-gradient-to-b from-orange-primary/10 via-black to-dark-950 rounded">
                                                                        <BookOpen size={36} className="text-orange-primary mb-2" />
                                                                        <span className="text-body-sm text-white font-bold line-clamp-2 mb-1">{edition.title}</span>
                                                                        <span className="text-caption text-dark-500 font-mono">{edition.edition_number}</span>
                                                                    </div>
                                                                )}
                                                                <div className="absolute top-3 left-3 z-10">
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
                                                                            onClick={() => handlePdfView(edition.pdf_file!)}
                                                                            className="flex-1 py-2 text-center text-body-sm font-semibold border border-dark-700 hover:border-white rounded-lg transition-colors text-white cursor-pointer"
                                                                        >
                                                                            View
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handlePdfDownload(edition.pdf_file!, edition.title)}
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