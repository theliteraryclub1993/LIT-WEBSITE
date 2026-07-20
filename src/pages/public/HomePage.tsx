import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { ArrowRight, Calendar, Users, BookOpen, Mic } from 'lucide-react'
import { usePublicTeamMembers } from '@/hooks'
import { brand } from '@/config/brandConfig'
import { Button, PageLoader, EmptyState, SlideshowCarousel } from '@/components/ui'
import { getSettingsByCategory } from '@/services/settingsService'
import heroBg from '@/assets/hero-bg.jpg'
import malnadFestBg from '@/assets/malnad-fest-bg.png'

const DEFAULT_SLIDES = [heroBg, malnadFestBg]

import { sortMembersByRole, isAlumniMember, getAlumniBatchYear } from '@/utils/teamSorter'

const getCurrentLeaders = (members: any[] | undefined) => {
    if (!members || !members.length) return []
    
    // Filter to only current (non-alumni) members
    const currentMembers = members.filter(m => !isAlumniMember(m))
    const sorted = [...currentMembers].sort(sortMembersByRole)
    
    const president = sorted.find(m => {
        const r = (m.role || '').toLowerCase()
        return r.includes('president') && !r.includes('vice')
    })

    const vicePresident = sorted.find(m => {
        const r = (m.role || '').toLowerCase()
        return r.includes('vice president') || r.includes('vice-president')
    })

    const jointSecretaries = sorted.filter(m => {
        const r = (m.role || '').toLowerCase()
        return r.includes('joint') || r.includes('secretar') || r.includes('secretor')
    }).slice(0, 2)

    const selected: any[] = []
    if (president) selected.push(president)
    if (vicePresident) selected.push(vicePresident)
    jointSecretaries.forEach(js => {
        if (!selected.some(s => s.id === js.id)) {
            selected.push(js)
        }
    })
    return selected
}

const getAlumni2024Leaders = (members: any[] | undefined) => {
    if (!members || !members.length) return []
    
    // Filter to only 2024 batch alumni members
    const alumni2024 = members.filter(m => isAlumniMember(m) && getAlumniBatchYear(m.department) === 2024)
    const sorted = [...alumni2024].sort(sortMembersByRole)
    
    const president = sorted.find(m => {
        const r = (m.role || '').toLowerCase()
        return r.includes('president') && !r.includes('vice')
    })

    const vicePresident = sorted.find(m => {
        const r = (m.role || '').toLowerCase()
        return r.includes('vice president') || r.includes('vice-president')
    })

    const jointSecretaries = sorted.filter(m => {
        const r = (m.role || '').toLowerCase()
        return r.includes('joint') || r.includes('secretar') || r.includes('secretor')
    }).slice(0, 2)

    const selected: any[] = []
    if (president) selected.push(president)
    if (vicePresident) selected.push(vicePresident)
    jointSecretaries.forEach(js => {
        if (!selected.some(s => s.id === js.id)) {
            selected.push(js)
        }
    })
    return selected
}

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as any },
    }),
}

export function HomePage() {
    const navigate = useNavigate()
    const { data: teamMembers, isLoading: teamLoading } = usePublicTeamMembers()

    const [homeSettings, setHomeSettings] = useState<any>({})
    const [slideshowImages, setSlideshowImages] = useState<string[]>([])
    const [slideshowAnimation, setSlideshowAnimation] = useState<any>('simple')

    useEffect(() => {
        getSettingsByCategory('homepage').then(data => {
            if (data) {
                setHomeSettings(data)
                if (data.slideshowAnimation) {
                    setSlideshowAnimation(data.slideshowAnimation)
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
                        console.error('Failed to parse slideshow images settings:', e)
                    }
                }
            }
        }).catch(err => console.error('Failed to load homepage settings:', err))
    }, [])

    const { scrollY } = useScroll()
    const opacity = useTransform(scrollY, [0, 400], [1, 0])
    const y = useTransform(scrollY, [0, 400], [0, -50])

    const heroTitle = homeSettings.heroTitle || 'WHERE WORDS COME ALIVE'
    const heroDescription = homeSettings.heroSubtext || brand.description

    return (
        <div className="bg-black">
            {/* ==================== HERO ==================== */}
            <section className="relative min-h-screen flex items-center overflow-hidden">
                {/* Background layers */}
                <div 
                    className="absolute inset-0 bg-gradient-to-b from-dark via-black to-black bg-cover bg-center" 
                    style={{
                        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.7), rgba(0,0,0,0.95)), url(${homeSettings.backgroundUrl || heroBg})`
                    }}
                />
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-orange-radial opacity-30" />

                <motion.div 
                    style={{ opacity, y }}
                    className="container-editorial relative z-10 py-32 lg:py-40"
                >
                    <div className="max-w-4xl">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="flex items-center gap-3 mb-8"
                        >
                            <div className="editorial-rule" />
                            <span className="text-overline text-orange-primary tracking-mega">
                                EST. {brand.founded}
                            </span>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.7, delay: 0.15 }}
                            className="text-display text-white leading-[0.85] mb-8 uppercase"
                        >
                            {heroTitle.includes('ALIVE') ? (
                                <>
                                    {heroTitle.split('ALIVE')[0]}
                                    <span className="text-gradient-orange">ALIVE</span>
                                    {heroTitle.split('ALIVE')[1]}
                                </>
                            ) : heroTitle}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.3 }}
                            className="text-body-lg text-dark-100 max-w-xl leading-relaxed mb-10"
                        >
                            {heroDescription}
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.45 }}
                            className="flex flex-wrap gap-4 z-20 relative"
                        >
                            <Button
                                variant="primary"
                                size="xl"
                                rightIcon={<ArrowRight size={18} />}
                                onClick={() => navigate('/events')}
                            >
                                Explore Events
                            </Button>
                            <Button
                                variant="outline"
                                size="xl"
                                onClick={() => navigate('/about')}
                            >
                                Our Story
                            </Button>
                        </motion.div>
                    </div>

                </motion.div>
            </section>

            {/* ==================== STATS MARQUEE ==================== */}
            <section className="border-y border-dark-800 bg-dark-950 py-5 overflow-hidden">
                <div className="mask-fade-edges">
                    <div className="marquee-track">
                        {[...brand.stats, ...brand.stats, ...brand.stats, ...brand.stats].map((stat, i) => (
                            <div key={i} className="flex items-center gap-4 mx-12 shrink-0">
                                <span className="text-h3 text-white tabular-nums">{stat.value}</span>
                                <span className="text-label text-dark-500 uppercase tracking-widest">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ==================== ABOUT SNIPPET ==================== */}
            <section className="py-24 lg:py-32 bg-dark-950 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-dark-700 to-transparent" />
                <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-dark-700 to-transparent" />

                <div className="container-editorial">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-100px' }}
                        >
                            <motion.span variants={fadeUp} custom={0} className="text-overline text-orange-primary tracking-mega block mb-4">
                                Who We Are
                            </motion.span>
                            <motion.h2 variants={fadeUp} custom={1} className="text-h1 text-white mb-6">
                                A LEGACY OF<br />
                                <span className="text-gradient-silver">LITERARY EXCELLENCE</span>
                            </motion.h2>
                            <motion.p variants={fadeUp} custom={2} className="text-body text-dark-100 leading-relaxed mb-6">
                                Established in 1993, The Literary Club (LIT) is one of the oldest and most pivotal clubs at Malnad College of Engineering. Comprising students from all years, we foster a rich heritage of creative expression, writing, speaking, and artistic pursuits on campus.
                            </motion.p>
                            <motion.div variants={fadeUp} custom={3}>
                                <Button variant="outline" rightIcon={<ArrowRight size={14} />}>
                                    <Link to="/about">Read Our Story</Link>
                                </Button>
                            </motion.div>
                        </motion.div>

                        {/* Visual Element — Stats Grid */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true, margin: '-100px' }}
                            className="grid grid-cols-2 gap-4"
                        >
                            {[
                                { icon: <Calendar size={24} />, value: '40+', label: 'Events Hosted' },
                                { icon: <Users size={24} />, value: '40+', label: 'Community Members' },
                                { icon: <BookOpen size={24} />, value: '5+', label: 'Noesis Published' },
                                { icon: <Mic size={24} />, value: '34+', label: 'Years of Legacy' },
                            ].map((stat, i) => (
                                <motion.div
                                    key={stat.label}
                                    variants={fadeUp}
                                    custom={i}
                                    className="bg-dark-900 border border-dark-700 rounded-xl p-6 hover:border-dark-500 transition-colors"
                                >
                                    <div className="text-orange-primary mb-4">{stat.icon}</div>
                                    <p className="text-h3 text-white tabular-nums mb-1">{stat.value}</p>
                                    <p className="text-caption text-dark-500 uppercase tracking-widest">{stat.label}</p>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* ==================== SLIDESHOW SECTION ==================== */}
            <section className="py-24 bg-black relative overflow-hidden">
                <div className="container-editorial">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        className="text-center max-w-3xl mx-auto mb-12"
                    >
                        <motion.span variants={fadeUp} custom={0} className="text-overline text-orange-primary tracking-mega block mb-4">
                            Moments
                        </motion.span>
                        <motion.h2 variants={fadeUp} custom={1} className="text-h1 text-white uppercase mb-4">
                            LIT In Pictures
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={2} className="text-body text-dark-300">
                            A visual journey through our workshops, poetry recitals, open mics, and college fests.
                        </motion.p>
                    </motion.div>

                    {/* Slideshow Display */}
                    <div className="max-w-4xl mx-auto">
                        <SlideshowCarousel
                            slides={slideshowImages}
                            defaultSlides={DEFAULT_SLIDES}
                            autoRotateIntervalMs={4000}
                            aspectRatioClass="aspect-video"
                            animationStyle={slideshowAnimation}
                        />
                    </div>
                </div>
            </section>

            {/* ==================== TEAM PREVIEW ==================== */}
            <section className="py-24 lg:py-32">
                <div className="container-editorial">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        className="flex items-end justify-between mb-12"
                    >
                        <div>
                            <motion.span variants={fadeUp} custom={0} className="text-overline text-orange-primary tracking-mega block mb-3">
                                The People
                            </motion.span>
                            <motion.h2 variants={fadeUp} custom={1} className="text-h1 text-white">
                                Meet Our Team
                            </motion.h2>
                        </div>
                        <motion.div variants={fadeUp} custom={2}>
                            <Button variant="ghost" rightIcon={<ArrowRight size={14} />}>
                                <Link to="/team">Full Team</Link>
                            </Button>
                        </motion.div>
                    </motion.div>

                    {teamLoading ? (
                        <PageLoader />
                    ) : !teamMembers?.length ? (
                        <EmptyState title="Team coming soon" />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {getCurrentLeaders(teamMembers).map((member, i) => (
                                <motion.div
                                    key={member.id}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeUp}
                                    custom={i}
                                    className="group relative rounded-2xl overflow-hidden border border-dark-800 bg-dark-950/80 hover:border-orange-primary/40 transition-all duration-500 flex flex-col shadow-xl"
                                >
                                    <div className="aspect-[3/4] w-full relative overflow-hidden bg-dark-900">
                                        {member.avatar_url ? (
                                            <img
                                                src={member.avatar_url}
                                                alt={member.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-dark-600 bg-dark-900 font-display text-h1 uppercase">
                                                {member.name?.[0] || 'L'}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90" />

                                        {/* Content inside overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                                            <span className="text-caption text-orange-primary uppercase tracking-widest font-semibold mb-1 block">
                                                {member.role}
                                            </span>
                                            <h3 className="text-h4 text-white font-bold group-hover:text-orange-primary transition-colors leading-tight">
                                                {member.name}
                                            </h3>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>

            {/* ==================== ALUMNI PREVIEW ==================== */}
            <section className="py-24 lg:py-32 bg-dark-950/40 border-t border-dark-900">
                <div className="container-editorial">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: '-100px' }}
                        className="flex items-end justify-between mb-12"
                    >
                        <div>
                            <motion.span variants={fadeUp} custom={0} className="text-overline text-orange-primary tracking-mega block mb-3">
                                The Legacy
                            </motion.span>
                            <motion.h2 variants={fadeUp} custom={1} className="text-h1 text-white">
                                Meet Our Alumni
                            </motion.h2>
                        </div>
                        <motion.div variants={fadeUp} custom={2}>
                            <Button variant="ghost" rightIcon={<ArrowRight size={14} />}>
                                <Link to="/alumni">Full Network</Link>
                            </Button>
                        </motion.div>
                    </motion.div>

                    {teamLoading ? (
                        <PageLoader />
                    ) : !teamMembers?.length ? (
                        <EmptyState title="Alumni records coming soon" />
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {getAlumni2024Leaders(teamMembers).map((member, i) => (
                                <motion.div
                                    key={member.id}
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true }}
                                    variants={fadeUp}
                                    custom={i}
                                    className="group relative rounded-2xl overflow-hidden border border-dark-800 bg-dark-950/80 hover:border-orange-primary/40 transition-all duration-500 flex flex-col shadow-xl"
                                >
                                    <div className="aspect-[3/4] w-full relative overflow-hidden bg-dark-900">
                                        {member.avatar_url ? (
                                            <img
                                                src={member.avatar_url}
                                                alt={member.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-dark-600 bg-dark-900 font-display text-h1 uppercase">
                                                {member.name?.[0] || 'L'}
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90" />

                                        {/* Content inside overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
                                            <span className="text-caption text-orange-primary uppercase tracking-widest font-semibold mb-1 block">
                                                {member.role} • 2024
                                            </span>
                                            <h3 className="text-h4 text-white font-bold group-hover:text-orange-primary transition-colors leading-tight">
                                                {member.name}
                                            </h3>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>



            {/* ==================== FINAL CTA ==================== */}
            <section className="py-32 lg:py-40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-orange-radial opacity-20" />
                <div className="container-editorial text-center relative z-10">
                    <motion.div
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="max-w-2xl mx-auto"
                    >
                        <motion.div variants={fadeUp} custom={0} className="editorial-rule mx-auto mb-8" />
                        <motion.h2 variants={fadeUp} custom={1} className="text-h1 text-white mb-6">
                            READY TO JOIN THE<br />
                            <span className="text-gradient-orange">CONVERSATION?</span>
                        </motion.h2>
                        <motion.p variants={fadeUp} custom={2} className="text-body text-dark-100 mb-10">
                            Whether you write, read, debate, or simply listen — there is a place for you here.
                        </motion.p>
                        <motion.div variants={fadeUp} custom={3} className="flex flex-wrap justify-center gap-4">
                            <Button variant="primary" size="xl" rightIcon={<ArrowRight size={18} />}>
                                <Link to="/events">Explore Events</Link>
                            </Button>
                            <Button variant="outline" size="xl">
                                <Link to="/auditions">Apply for Auditions</Link>
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>
        </div>
    )
}