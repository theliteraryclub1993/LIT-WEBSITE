import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getSettingsByCategory } from '@/services/settingsService'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as any },
    }),
}

export function AboutPage() {
    const [aboutSettings, setAboutSettings] = useState<any>({})

    useEffect(() => {
        getSettingsByCategory('about').then(data => {
            if (data) setAboutSettings(data)
        }).catch(err => console.error('Failed to load about page settings:', err))
    }, [])

    const aboutEstablished = aboutSettings.established || 'Established 1993'
    const aboutTitle = aboutSettings.title || 'THE LITERARY CLUB'
    const aboutDescription = aboutSettings.description || 'Established in 1993, Since then The Literary Club stands as a legacy of imagination at MCE,Empowering students to think creatively, communicate confidently, and leave a lasting mark through the power of literature and expression.'
    const aboutMotto = aboutSettings.motto || 'To foster the talents and assorted interests of blooming engineers with creative skills and a penchant for literature.'
    const aboutVision = aboutSettings.vision || 'Comprising students from all years, we carry forward a glory that transcends generations. We focus on celebrating the unique interests of every individual, creating a community where creativity knows no bounds.'

    return (
        <div className="bg-black min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-20 sm:pt-24 pb-12 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-dark-950 via-black to-black" />
                
                {/* Cinematic background logo */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ 
                        opacity: 0.06, 
                        scale: 1,
                        y: [0, -15, 0]
                    }}
                    transition={{ 
                        opacity: { duration: 1 },
                        scale: { duration: 1.5, ease: "easeOut" },
                        y: {
                            repeat: Infinity,
                            duration: 8,
                            ease: "easeInOut"
                        }
                    }}
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] max-w-[600px] aspect-square pointer-events-none select-none z-0"
                    style={{
                        maskImage: 'radial-gradient(circle, black 40%, transparent 80%)',
                        WebkitMaskImage: 'radial-gradient(circle, black 40%, transparent 80%)'
                    }}
                >
                    <img 
                        src="/favicon.svg" 
                        alt="" 
                        className="w-full h-full object-contain filter drop-shadow-[0_0_100px_rgba(255,107,0,0.15)]"
                    />
                </motion.div>

                <div className="container-editorial relative z-10 text-center max-w-4xl mx-auto">
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-overline text-orange-primary tracking-mega block mb-4">{aboutEstablished}</motion.span>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-display text-white mb-6">{aboutTitle}</motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-body-lg text-dark-100 leading-relaxed max-w-2xl mx-auto">
                        {aboutDescription}
                    </motion.p>

                    {/* Motto & Vision side-by-side */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto text-left"
                    >
                        {/* Motto Card */}
                        <div className="p-8 border border-dark-800 rounded-2xl bg-dark-900/60 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between group hover:border-orange-primary/40 transition-all duration-300 shadow-xl">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-primary to-orange-400" />
                            <div className="space-y-4">
                                <span className="text-overline text-orange-primary block font-mono tracking-widest">CLUB MOTTO</span>
                                <p className="text-body-lg text-dark-100 italic font-normal leading-relaxed">
                                    "{aboutMotto}"
                                </p>
                            </div>
                        </div>

                        {/* Vision Card */}
                        <div className="p-8 border border-dark-800 rounded-2xl bg-dark-900/60 backdrop-blur-sm relative overflow-hidden flex flex-col justify-between group hover:border-orange-primary/40 transition-all duration-300 shadow-xl">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-orange-primary to-zinc-500" />
                            <div className="space-y-4">
                                <span className="text-overline text-orange-primary block font-mono tracking-widest">OUR VISION</span>
                                <p className="text-body-lg text-dark-100 italic font-normal leading-relaxed">
                                    "{aboutVision}"
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* What We Do Section */}
            <section className="py-24 border-t border-dark-800 bg-dark-950/40 relative">
                <div className="container-editorial max-w-6xl mx-auto">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="text-overline text-orange-primary tracking-mega block mb-3">OUR CORE INITIATIVES</span>
                        <h2 className="text-h1 text-white">WHAT WE DO</h2>
                        <p className="text-body-sm text-dark-400 mt-3 leading-relaxed">
                            From intercollegiate cultural fests to annual literary publications and student speaker platforms, we empower creative expression across campus.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* 1. Malnad Fest */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            custom={0}
                            className="bg-dark-900/60 border border-dark-800 hover:border-orange-primary/50 p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between group transition-all duration-300"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-primary to-orange-400" />
                            <div className="space-y-4">
                                <span className="text-overline text-orange-primary font-mono tracking-widest block">FLAGSHIP FEST</span>
                                <h3 className="text-h3 text-white font-bold group-hover:text-orange-primary transition-colors">THE MALNAD FEST</h3>
                                <p className="text-body-sm text-dark-300 leading-relaxed">
                                    The biggest intercollegiate literary & cultural extravaganza at MCE. Featuring 40+ competitive events spanning Balwaan, Buddhimaan, Darpan, and Kalakruthi in the quest for the prestigious <strong>Sarvottam Title</strong>.
                                </p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-dark-800">
                                <Link
                                    to="/events?tab=malnad"
                                    className="inline-flex items-center gap-2 text-body-sm text-orange-primary font-semibold hover:text-white transition-colors group-hover:translate-x-1 transition-transform"
                                >
                                    Explore Malnad Fest <span className="text-lg">→</span>
                                </Link>
                            </div>
                        </motion.div>

                        {/* 2. Noesis E-Magazine */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            custom={1}
                            className="bg-dark-900/60 border border-dark-800 hover:border-orange-primary/50 p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between group transition-all duration-300"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-400 to-orange-primary" />
                            <div className="space-y-4">
                                <span className="text-overline text-orange-primary font-mono tracking-widest block">ANNUAL PUBLICATION</span>
                                <h3 className="text-h3 text-white font-bold group-hover:text-orange-primary transition-colors">NOESIS E-MAGAZINE</h3>
                                <p className="text-body-sm text-dark-300 leading-relaxed">
                                    Our annual flagbearer publication capturing the essence of student life through poetry, prose, artwork, photography, and editorial essays from budding thinkers across all years.
                                </p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-dark-800">
                                <Link
                                    to="/events?tab=noesis"
                                    className="inline-flex items-center gap-2 text-body-sm text-orange-primary font-semibold hover:text-white transition-colors group-hover:translate-x-1 transition-transform"
                                >
                                    Read Noesis Releases <span className="text-lg">→</span>
                                </Link>
                            </div>
                        </motion.div>

                        {/* 3. Spark Platform */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            custom={2}
                            className="bg-dark-900/60 border border-dark-800 hover:border-orange-primary/50 p-8 rounded-2xl relative overflow-hidden flex flex-col justify-between group transition-all duration-300"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-zinc-600" />
                            <div className="space-y-4">
                                <span className="text-overline text-orange-primary font-mono tracking-widest block">SPEAKER PLATFORM</span>
                                <h3 className="text-h3 text-white font-bold group-hover:text-orange-primary transition-colors">SPARK PLATFORM</h3>
                                <p className="text-body-sm text-dark-300 leading-relaxed">
                                    An inspiring stage bringing together keynote speakers, alumni pioneers, and student leaders to share transformative stories, ideas, and life experiences that ignite minds.
                                </p>
                            </div>
                            <div className="pt-6 mt-6 border-t border-dark-800">
                                <Link
                                    to="/events?tab=spark"
                                    className="inline-flex items-center gap-2 text-body-sm text-orange-primary font-semibold hover:text-white transition-colors group-hover:translate-x-1 transition-transform"
                                >
                                    Discover Spark Talks <span className="text-lg">→</span>
                                </Link>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    )
}