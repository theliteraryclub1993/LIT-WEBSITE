import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Globe, Award, GraduationCap, Search, ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { usePublicTeamMembers } from '@/hooks/useTeamMembers'
import { PageLoader, EmptyState, BrandIcons, Input, Button } from '@/components/ui'
import { sortMembersByRole, isAlumniMember, getAlumniBatchYear } from '@/utils/teamSorter'

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

export function AlumniPage() {
    const { data: members, isLoading } = usePublicTeamMembers()
    const [search, setSearch] = useState('')

    const alumniMembers = useMemo(() => {
        if (!members) return []
        const sorted = [...members].sort(sortMembersByRole)
        const alumniOnly = sorted.filter(m => isAlumniMember(m))
        if (!search.trim()) return alumniOnly

        const q = search.toLowerCase().trim()
        return alumniOnly.filter(m =>
            (m.name || '').toLowerCase().includes(q) ||
            (m.role || '').toLowerCase().includes(q) ||
            (m.bio || '').toLowerCase().includes(q) ||
            (m.department || '').toLowerCase().includes(q)
        )
    }, [members, search])

    const groupedAlumni = useMemo(() => {
        const groups: Record<string, typeof alumniMembers> = {}
        
        alumniMembers.forEach(m => {
            const year = getAlumniBatchYear(m.department)
            const groupKey = year ? `Batch of ${year}` : 'Legacy Alumni'
            if (!groups[groupKey]) {
                groups[groupKey] = []
            }
            groups[groupKey].push(m)
        })

        // Sort keys: numeric batch years ascending (e.g., 2024 -> 2025 -> 2026), and Legacy Alumni at the end
        const sortedKeys = Object.keys(groups).sort((a, b) => {
            const yearA = parseInt(a.replace(/\D/g, ''), 10) || 9999
            const yearB = parseInt(b.replace(/\D/g, ''), 10) || 9999
            return yearA - yearB
        })

        return {
            groups,
            keys: sortedKeys
        }
    }, [alumniMembers])

    return (
        <div className="bg-black min-h-screen text-white">
            {/* Background cinematic glow */}
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full filter blur-[140px] pointer-events-none" />

            {/* Hero Section */}
            <section className="relative pt-40 pb-16 overflow-hidden">
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
                        className="w-full h-full object-contain filter drop-shadow-[0_0_80px_rgba(245,158,11,0.3)]"
                    />
                </motion.div>

                <div className="container-editorial relative z-10 text-center max-w-3xl mx-auto px-4">
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-caption font-semibold uppercase tracking-widest mb-4">
                        <GraduationCap size={16} /> Hall of Fame
                    </motion.div>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-display text-white mb-6 uppercase tracking-wider">OUR ALUMNI NETWORK</motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-body text-dark-300 leading-relaxed max-w-2xl mx-auto">
                        Honoring the leaders, creators, and visionaries who built and shaped the legacy of The Literary Club across generations.
                    </motion.p>

                    {/* Search Bar */}
                    <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="max-w-md mx-auto mt-10">
                        <Input
                            placeholder="Search alumni by name, role, or batch..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            leftIcon={<Search size={16} className="text-amber-500/70" />}
                            size="md"
                            className="bg-dark-900/80 border-dark-700 focus:border-amber-500 focus:ring-amber-500/30"
                        />
                    </motion.div>
                </div>
            </section>

            {/* Grid Section */}
            <section className="pb-28">
                <div className="container-editorial px-4">
                    {isLoading ? (
                        <PageLoader />
                    ) : alumniMembers.length === 0 ? (
                        <div className="py-16 text-center space-y-4 max-w-md mx-auto">
                            <EmptyState
                                icon={<GraduationCap size={48} className="text-amber-500/40" />}
                                title={search ? "No alumni matching your search" : "Alumni Records Archive"}
                                description={search ? "Try searching for a different name or batch year." : "Our team is actively archiving alumni profiles."}
                            />
                            {search && (
                                <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                                    Clear Search
                                </Button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-16">
                            {groupedAlumni.keys.map((groupKey) => {
                                const membersInGroup = groupedAlumni.groups[groupKey] || []
                                return (
                                    <div key={groupKey} className="space-y-8">
                                        <div className="flex items-center justify-between border-b border-dark-800 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                                                    <Award size={18} />
                                                </div>
                                                <h2 className="text-h3 text-white font-bold tracking-wide uppercase">{groupKey}</h2>
                                            </div>
                                            <span className="text-caption text-amber-400/80 font-medium">{membersInGroup.length} alumni</span>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                            {membersInGroup.map((member, mIdx) => (
                                                <motion.div
                                                    key={member.id}
                                                    variants={fadeUp}
                                                    initial="hidden"
                                                    whileInView="visible"
                                                    viewport={{ once: true, margin: '-50px' }}
                                                    custom={mIdx + 1}
                                                    className="group relative rounded-2xl overflow-hidden border border-amber-500/20 bg-dark-950/90 hover:border-amber-500/60 hover:shadow-2xl hover:shadow-amber-500/10 transition-all duration-500 flex flex-col"
                                                >
                                                    {/* Alumni Badge */}
                                                    <div className="absolute top-3 right-3 z-20 px-2.5 py-1 rounded-full bg-black/80 border border-amber-500/40 backdrop-blur-md flex items-center gap-1.5 text-[10px] text-amber-400 font-semibold tracking-wider uppercase">
                                                        <GraduationCap size={12} /> Alumni
                                                    </div>

                                                    <div className="aspect-[3/4] w-full relative overflow-hidden bg-dark-900">
                                                        {member.avatar_url ? (
                                                            <img
                                                                src={member.avatar_url}
                                                                alt={member.name}
                                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
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
                                                                {getAlumniBatchYear(member.department) ? ` • ${getAlumniBatchYear(member.department)}` : ''}
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
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    {/* Bottom CTA to active team */}
                    <div className="mt-20 p-8 rounded-2xl border border-dark-800 bg-dark-900/60 backdrop-blur-md flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
                        <div>
                            <h3 className="text-h4 text-white font-bold mb-1">Meet the Current Team</h3>
                            <p className="text-body-sm text-dark-400">Discover the student leaders actively driving the club forward today.</p>
                        </div>
                        <Button variant="primary" rightIcon={<ArrowRight size={16} />}>
                            <Link to="/team">View Active Team</Link>
                        </Button>
                    </div>
                </div>
            </section>
        </div>
    )
}
