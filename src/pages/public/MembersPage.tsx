import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Globe, Award, Users, GraduationCap } from 'lucide-react'
import { usePublicTeamMembers } from '@/hooks/useTeamMembers'
import { PageLoader, EmptyState, BrandIcons } from '@/components/ui'
import { sortMembersByRole, isAlumniMember } from '@/utils/teamSorter'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.05, duration: 0.5 },
    }),
}

function SocialIcon({ platform }: { platform: string }) {
    switch (platform) {
        case 'instagram':
            return <BrandIcons.Instagram size={14} />
        case 'twitter':
        case 'x':
            return <BrandIcons.Twitter size={14} />
        case 'linkedin':
            return <BrandIcons.Linkedin size={14} />
        case 'youtube':
            return <BrandIcons.Youtube size={14} />
        case 'github':
            return <BrandIcons.Github size={14} />
        default:
            return <Globe size={14} />
    }
}

function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean)
    const first = parts[0]
    if (!first) return '?'
    if (parts.length === 1) return first.charAt(0).toUpperCase()
    const last = parts[parts.length - 1]
    if (!last) return first.charAt(0).toUpperCase()
    return (first.charAt(0) + last.charAt(0)).toUpperCase()
}

export function MembersPage() {
    const { data: members, isLoading } = usePublicTeamMembers()
    const [activeTab, setActiveTab] = useState<'all' | 'current' | 'alumni'>('all')

    const { currentMembers, alumniMembers } = useMemo(() => {
        if (!members) return { currentMembers: [], alumniMembers: [] }
        const sorted = [...members].sort(sortMembersByRole)
        const current = sorted.filter(m => !isAlumniMember(m))
        const alumni = sorted.filter(m => isAlumniMember(m))
        return { currentMembers: current, alumniMembers: alumni }
    }, [members])

    const totalCount = currentMembers.length + alumniMembers.length

    return (
        <div className="bg-black min-h-screen text-white">
            {/* Hero Section */}
            <section className="relative pt-40 pb-16 overflow-hidden">
                {/* Cinematic background logo */}
                <motion.div 
                    initial={{ opacity: 0, scale: 0.8, rotate: 10 }}
                    animate={{ 
                        opacity: 0.08, 
                        scale: 1,
                        rotate: 0,
                        y: [0, 10, 0]
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

                <div className="container-editorial relative z-10 text-center max-w-3xl mx-auto px-4">
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-overline text-orange-primary tracking-mega block mb-4">The People</motion.span>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-display text-white mb-6 uppercase">OUR TEAM & ALUMNI</motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-body text-dark-300 leading-relaxed max-w-2xl mx-auto">
                        The passionate leaders and distinguished alumni who shape and carry forward the legacy of The Literary Club.
                    </motion.p>

                    {/* Filter Tabs */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex justify-center items-center gap-2 mt-10">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={`px-5 py-2 rounded-full text-caption font-semibold transition-all duration-300 ${activeTab === 'all'
                                    ? 'bg-orange-primary text-black shadow-lg shadow-orange-primary/20 scale-105'
                                    : 'bg-dark-900 text-dark-400 hover:text-white hover:bg-dark-800 border border-dark-800'
                                }`}
                        >
                            <Users size={14} className="inline mr-1.5 -mt-0.5" /> All ({totalCount})
                        </button>
                        <button
                            onClick={() => setActiveTab('current')}
                            className={`px-5 py-2 rounded-full text-caption font-semibold transition-all duration-300 ${activeTab === 'current'
                                    ? 'bg-orange-primary text-black shadow-lg shadow-orange-primary/20 scale-105'
                                    : 'bg-dark-900 text-dark-400 hover:text-white hover:bg-dark-800 border border-dark-800'
                                }`}
                        >
                            Active Team ({currentMembers.length})
                        </button>
                        <button
                            onClick={() => setActiveTab('alumni')}
                            className={`px-5 py-2 rounded-full text-caption font-semibold transition-all duration-300 ${activeTab === 'alumni'
                                    ? 'bg-gradient-to-r from-amber-400 to-amber-600 text-black shadow-lg shadow-amber-500/20 scale-105'
                                    : 'bg-dark-900 text-amber-400/80 hover:text-amber-300 hover:bg-dark-800 border border-amber-500/20'
                                }`}
                        >
                            <GraduationCap size={15} className="inline mr-1.5 -mt-0.5" /> Alumni ({alumniMembers.length})
                        </button>
                    </motion.div>
                </div>
            </section>

            {/* Grid Section */}
            <section className="pb-28">
                <div className="container-editorial">
                    {isLoading ? (
                        <PageLoader />
                    ) : totalCount === 0 ? (
                        <EmptyState title="No team members found" />
                    ) : (
                        <div className="space-y-20">
                            {/* CURRENT TEAM SECTION */}
                            {(activeTab === 'all' || activeTab === 'current') && currentMembers.length > 0 && (
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: '-50px' }}
                                >
                                    <motion.div variants={fadeUp} custom={0} className="flex items-center gap-4 mb-8">
                                        <h2 className="text-h2 text-white font-bold tracking-wide">CURRENT TEAM</h2>
                                        <div className="flex-1 h-px bg-dark-800" />
                                        <span className="text-caption text-dark-500">{currentMembers.length} active members</span>
                                    </motion.div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                        {currentMembers.map((member, mIdx) => (
                                            <motion.div
                                                key={member.id}
                                                variants={fadeUp}
                                                custom={mIdx + 1}
                                                className="group relative rounded-2xl overflow-hidden border border-dark-800 bg-dark-950/80 hover:border-orange-primary/40 transition-all duration-500 flex flex-col shadow-xl"
                                            >
                                                <div className="aspect-[3/4] w-full relative overflow-hidden bg-dark-900">
                                                    {member.avatar_url ? (
                                                        <img
                                                            src={member.avatar_url}
                                                            alt={member.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                                                            loading="lazy"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-dark-600 bg-dark-900 font-display text-h1 uppercase">
                                                            {getInitials(member.name)}
                                                        </div>
                                                    )}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent opacity-90" />

                                                    {/* Content inside overlay */}
                                                    <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end z-10">
                                                        <span className="text-caption text-orange-primary uppercase tracking-widest font-semibold mb-1 block">
                                                            {member.role}
                                                        </span>
                                                        <h3 className="text-h4 text-white font-bold group-hover:text-orange-primary transition-colors leading-tight mb-1">
                                                            {member.name}
                                                        </h3>
                                                        {member.bio && (
                                                            <p className="text-caption text-dark-300 leading-snug line-clamp-2 mb-2">
                                                                {member.bio}
                                                            </p>
                                                        )}

                                                        {/* Social Links */}
                                                        {member.social_links && Object.values(member.social_links).some(Boolean) && (
                                                            <div className="flex items-center gap-2 pt-2 border-t border-white/10 mt-1">
                                                                {Object.entries(member.social_links).map(([platform, url]) => (
                                                                    url ? (
                                                                        <a
                                                                            key={platform}
                                                                            href={url as string}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="w-7 h-7 rounded-full bg-black/60 border border-dark-700 text-dark-300 hover:text-orange-primary hover:border-orange-primary/30 hover:bg-orange-primary/10 flex items-center justify-center transition-all duration-300"
                                                                            title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                                                                        >
                                                                            <SocialIcon platform={platform} />
                                                                        </a>
                                                                    ) : null
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* ALUMNI SECTION */}
                            {(activeTab === 'all' || activeTab === 'alumni') && (
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: '-50px' }}
                                    className="pt-4"
                                >
                                    <motion.div variants={fadeUp} custom={0} className="flex items-center gap-4 mb-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                                                <Award size={20} />
                                            </div>
                                            <div>
                                                <h2 className="text-h2 text-white font-bold tracking-wide">ALUMNI & LEGACY</h2>
                                            </div>
                                        </div>
                                        <div className="flex-1 h-px bg-gradient-to-r from-amber-500/30 via-dark-800 to-transparent" />
                                        <span className="text-caption text-amber-400/80 font-medium">{alumniMembers.length} alumni members</span>
                                    </motion.div>

                                    {alumniMembers.length === 0 ? (
                                        <div className="p-12 rounded-2xl border border-dark-800 bg-dark-950/40 text-center space-y-3 max-w-xl mx-auto">
                                            <GraduationCap size={40} className="mx-auto text-dark-600 stroke-1" />
                                            <h3 className="text-h4 text-dark-300">Alumni Records Coming Soon</h3>
                                            <p className="text-caption text-dark-500">Our team is archiving alumni profiles from previous batches.</p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                            {alumniMembers.map((member, mIdx) => (
                                                <motion.div
                                                    key={member.id}
                                                    variants={fadeUp}
                                                    custom={mIdx + 1}
                                                    className="group relative rounded-2xl overflow-hidden border border-amber-500/20 bg-dark-950/90 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 flex flex-col"
                                                >
                                                    {/* Badge */}
                                                    <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/70 border border-amber-500/30 backdrop-blur-md flex items-center gap-1.5 text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
                                                        <GraduationCap size={12} /> Alumni
                                                    </div>

                                                    <div className="aspect-[3/4] w-full relative overflow-hidden bg-dark-900">
                                                        {member.avatar_url ? (
                                                            <img
                                                                src={member.avatar_url}
                                                                alt={member.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out filter contrast-[1.02]"
                                                                loading="lazy"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-amber-500/40 bg-dark-900 font-display text-h1 uppercase">
                                                                {getInitials(member.name)}
                                                            </div>
                                                        )}
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-95" />

                                                        {/* Content inside overlay */}
                                                        <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end z-10">
                                                            <span className="text-caption text-amber-400 uppercase tracking-widest font-semibold mb-1 block">
                                                                {member.role || 'Alumni'}
                                                            </span>
                                                            <h3 className="text-h4 text-white font-bold group-hover:text-amber-300 transition-colors leading-tight mb-1">
                                                                {member.name}
                                                            </h3>
                                                            {member.bio && (
                                                                <p className="text-caption text-dark-300 leading-snug line-clamp-2 mb-2">
                                                                    {member.bio}
                                                                </p>
                                                            )}

                                                            {/* Social Links */}
                                                            {member.social_links && Object.values(member.social_links).some(Boolean) && (
                                                                <div className="flex items-center gap-2 pt-2 border-t border-amber-500/20 mt-1">
                                                                    {Object.entries(member.social_links).map(([platform, url]) => (
                                                                        url ? (
                                                                            <a
                                                                                key={platform}
                                                                                href={url as string}
                                                                                target="_blank"
                                                                                rel="noopener noreferrer"
                                                                                className="w-7 h-7 rounded-full bg-black/70 border border-amber-500/30 text-amber-400/80 hover:text-amber-300 hover:border-amber-400 hover:bg-amber-500/20 flex items-center justify-center transition-all duration-300"
                                                                                title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                                                                            >
                                                                                <SocialIcon platform={platform} />
                                                                            </a>
                                                                        ) : null
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}