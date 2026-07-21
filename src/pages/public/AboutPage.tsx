import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Award } from 'lucide-react'
import { getSettingsByCategory } from '@/services/settingsService'
import noesisCardBg from '@/assets/noesis-card-bg.png'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] as any },
    }),
}

const categories = [
    {
        title: 'BALWAAN',
        subtitle: 'Push. Persevere. Prevail.',
        desc: "Every challenge begins with a choice to step forward. Whether it's Pentathlon, Desafio, Scavenger Hunt, Game On, or Tug of War, Balwaan celebrates resilience, teamwork, and determination, alongside a host of exciting challenges that test both grit and spirit.",
        accent: 'from-orange-600 to-orange-400'
    },
    {
        title: 'BUDDHIMAAN',
        subtitle: 'Where Thinking Makes the Difference.',
        desc: "Not every victory is earned through strength. Some are won through ideas, strategy, and perspective. Featuring Knockout, Literati, and Toastmaster, alongside a diverse lineup of intellectual challenges, Buddhimaan rewards those who think beyond the obvious.",
        accent: 'from-zinc-500 to-zinc-300'
    },
    {
        title: 'DARPAN',
        subtitle: 'Let Your Passion Be Seen.',
        desc: "Some moments deserve more than applause they deserve to be remembered. From Antakshari, Campus Beats, and Naa Kanda Malnad to a variety of crowd-favourite performances, Darpan celebrates creativity, culture, and the joy of expression.",
        accent: 'from-orange-500 to-zinc-400'
    },
    {
        title: 'KALAKRUTHI',
        subtitle: 'Every Creation Has a Story.',
        desc: "Great ideas begin with imagination. Through Art-a-thon and Chitrakatha, plus a collection of creative experiences, Kalakruthi transforms imagination into artistry and celebrates originality in every form.",
        accent: 'from-zinc-700 to-orange-500'
    }
]

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
    const aboutVision = aboutSettings.vision || 'To guide the creative power of thoughts and expressions to build positive change.'
    const aboutMission = aboutSettings.mission || 'To continuously host enriching poetry sessions, workshops, debates, and public speaking programs.'
    const aboutObjectives = aboutSettings.objectives || 'Build public speaking confidence; Create high quality publication editions; Organise intercollegiate fests.'

    return (
        <div className="bg-black min-h-screen">
            {/* Hero Section */}
            <section className="relative pt-40 pb-24 overflow-hidden">
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

                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-12 p-8 border border-dark-800 rounded-2xl bg-dark-900/50 max-w-2xl mx-auto relative overflow-hidden"
                    >
                        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-primary to-transparent" />
                        <span className="text-overline text-dark-500 block mb-2 font-mono">CLUB MOTTO</span>
                        <blockquote className="text-h4 text-white italic font-normal">
                            "{aboutMotto}"
                        </blockquote>
                    </motion.div>
                </div>
            </section>

            {/* Vision, Mission & Objectives Section */}
            <section className="py-20 border-t border-dark-800 bg-dark-950/40">
                <div className="container-editorial max-w-5xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Vision */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            custom={0}
                            className="bg-dark-900 border border-dark-850 p-8 rounded-2xl relative overflow-hidden group hover:border-dark-750 transition-all duration-300"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-primary to-orange-400" />
                            <h3 className="text-h4 text-white mb-4 flex items-center gap-2">
                                <span className="text-orange-primary font-mono text-body">01 /</span> VISION
                            </h3>
                            <p className="text-body-sm text-dark-300 leading-relaxed">
                                {aboutVision}
                            </p>
                        </motion.div>

                        {/* Mission */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            custom={1}
                            className="bg-dark-900 border border-dark-850 p-8 rounded-2xl relative overflow-hidden group hover:border-dark-750 transition-all duration-300"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 to-zinc-400" />
                            <h3 className="text-h4 text-white mb-4 flex items-center gap-2">
                                <span className="text-orange-primary font-mono text-body">02 /</span> MISSION
                            </h3>
                            <p className="text-body-sm text-dark-300 leading-relaxed">
                                {aboutMission}
                            </p>
                        </motion.div>

                        {/* Objectives */}
                        <motion.div
                            initial="hidden"
                            whileInView="visible"
                            viewport={{ once: true }}
                            variants={fadeUp}
                            custom={2}
                            className="bg-dark-900 border border-dark-850 p-8 rounded-2xl relative overflow-hidden group hover:border-dark-750 transition-all duration-300"
                        >
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-zinc-400 to-dark-600" />
                            <h3 className="text-h4 text-white mb-4 flex items-center gap-2">
                                <span className="text-orange-primary font-mono text-body">03 /</span> OBJECTIVES
                            </h3>
                            <ul className="space-y-2">
                                {aboutObjectives.split(';').map((obj: string, i: number) => {
                                    const trimmed = obj.trim();
                                    if (!trimmed) return null;
                                    return (
                                        <li key={i} className="text-body-sm text-dark-100 flex items-start gap-2">
                                            <span className="text-orange-primary mt-1.5 shrink-0 w-1.5 h-1.5 rounded-full" />
                                            <span>{trimmed}</span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* What We Do / Malnad Fest */}
            <section className="py-24 border-t border-dark-800 bg-dark-950/20">
                <div className="container-editorial max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <motion.span variants={fadeUp} custom={0} className="text-overline text-orange-primary tracking-mega block mb-4">The Flagship</motion.span>
                        <motion.h2 variants={fadeUp} custom={1} className="text-h1 text-white mb-6">THE MALNAD FEST</motion.h2>
                        <motion.p variants={fadeUp} custom={2} className="text-h4 text-orange-primary font-semibold tracking-wide mb-4">
                            NOT JUST AN EVENT. A CHAPTER.
                        </motion.p>
                        <motion.p variants={fadeUp} custom={3} className="text-body text-dark-100 leading-relaxed mb-4">
                            Long after the lights dim and the stages empty, the stories remain.
                        </motion.p>
                        <motion.p variants={fadeUp} custom={4} className="text-body text-dark-400 leading-relaxed mb-6">
                            Malnad Fest is a celebration of talent, friendship, and unforgettable experiences that become part of every student's journey. From moments of fierce competition to memories that last a lifetime, it brings the entire campus together in a shared spirit of creativity, ambition, and celebration.
                        </motion.p>
                        <motion.div variants={fadeUp} custom={5} className="flex gap-8 mt-6">
                            <div>
                                <h4 className="text-h2 text-white font-bold">2.5K+</h4>
                                <p className="text-caption text-dark-500">Participants</p>
                            </div>
                            <div className="border-l border-dark-800 pl-8">
                                <h4 className="text-h2 text-white font-bold">40+</h4>
                                <p className="text-caption text-dark-500">Events</p>
                            </div>
                            <div className="border-l border-dark-800 pl-8">
                                <h4 className="text-h2 text-white font-bold">1</h4>
                                <p className="text-caption text-dark-500">Prestigious Sarvottam Title</p>
                            </div>
                        </motion.div>
                    </motion.div>

                    <div className="bg-dark-900 border border-dark-850 rounded-2xl p-6 relative overflow-hidden space-y-6">
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
            </section>

            {/* Categories */}
            <section className="py-24 border-t border-dark-800">
                <div className="container-editorial">
                    <div className="text-center mb-16 max-w-xl mx-auto">
                        <span className="text-overline text-orange-primary tracking-mega block mb-3">Categories</span>
                        <h2 className="text-h1 text-white">THE FOUR PILLARS</h2>
                        <p className="text-body-sm text-dark-400 mt-2">The events are structured across four major areas, offering something for everyone.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                        {categories.map((cat, i) => (
                            <motion.div
                                key={cat.title}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true }}
                                variants={fadeUp}
                                custom={i}
                                className="bg-dark-900 border border-dark-800 rounded-2xl p-6 relative overflow-hidden group hover:border-dark-600 transition-all duration-300"
                            >
                                <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${cat.accent}`} />
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-h3 text-white tracking-wider font-bold">{cat.title}</h3>
                                        <p className="text-overline text-orange-primary font-semibold tracking-widest mt-1">{cat.subtitle}</p>
                                    </div>
                                    <p className="text-body-sm text-dark-100 leading-relaxed">
                                        {cat.desc}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Noesis Magazine Section */}
            <section className="py-24 bg-dark-950 border-t border-dark-800">
                <div className="container-editorial max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="relative aspect-[3/4] bg-dark-900 rounded-2xl border border-dark-800 p-6 flex flex-col justify-between overflow-hidden shadow-2xl group transition-all duration-300 hover:border-dark-700 hover:shadow-orange-primary/10">
                        {/* Background Image */}
                        <img 
                            src={noesisCardBg} 
                            alt="Noesis E-Magazine Cover" 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/60" />

                        <div className="space-y-2 relative z-10">
                            <span className="text-overline text-orange-primary tracking-widest block font-bold">ANNUAL LITERARY MAGAZINE</span>
                            <h2 className="text-display text-white drop-shadow-md">NOESIS</h2>
                        </div>

                        <div className="space-y-4 relative z-10">
                            <p className="text-body-sm text-dark-100 leading-relaxed font-mono drop-shadow uppercase tracking-wider font-medium">
                                CREATIVITY | EDITORIAL | PHOTOGRAPHY
                            </p>
                            <div className="h-px bg-white/20" />
                            <div className="flex justify-between items-center text-caption text-dark-300 font-mono">
                                <span>ISSUE 2026</span>
                                <span>MALNAD COLLEGE OF ENGINEERING</span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <span className="text-overline text-orange-primary tracking-mega block">The E-Magazine</span>
                        <h2 className="text-h1 text-white">NOESIS</h2>
                        <p className="text-body text-dark-100 leading-relaxed">
                            Every story begins with a thought, and every thought deserves a place to be heard.
                        </p>
                        <p className="text-body-sm text-dark-400 leading-relaxed">
                            <strong>Noesis</strong> is the Literary Club's annual magazine that celebrates imagination in all its forms from poetry and prose to artwork and photography. It is a collection of voices, perspectives, and creativity that reflects the spirit of Malnad College of Engineering.
                        </p>
                    </div>
                </div>
            </section>
        </div>
    )
}