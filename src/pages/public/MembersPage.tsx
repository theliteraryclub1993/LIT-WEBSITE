import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import { usePublicTeamMembers } from '@/hooks/useTeamMembers'
import { PageLoader, EmptyState, BrandIcons } from '@/components/ui'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.05, duration: 0.5 },
    }),
}

const ROLE_ORDER = [
    'Student President',
    'Student Vice President',
    'Joint Secretaries',
    'Creative Director',
    'Event Director',
    'Designer in Chief',
    'Treasurer',
    'Co-treasurer and Social media manager',
    'Editorial Heads',
    'Event Manager',
    'Event Manager and Co-editorial Head',
    'Creative Heads',
    'Digital Head',
    'Database Manager',
    'Photography Head',
    'Assistant Coordinator',
    'Junior Wing'
]

const getRolePriority = (role: string | null | undefined): number => {
    if (!role) return 999
    const trimmed = role.toLowerCase().trim()
    const idx = ROLE_ORDER.findIndex(r => r.toLowerCase().trim() === trimmed)
    return idx === -1 ? 999 : idx
}

const sortMembersByRole = (a: any, b: any) => {
    const priorityA = getRolePriority(a.role)
    const priorityB = getRolePriority(b.role)
    if (priorityA !== priorityB) {
        return priorityA - priorityB
    }
    return (a.name || '').localeCompare(b.name || '')
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

    const sortedMembers = useMemo(() => {
        if (!members) return []
        return [...members].sort(sortMembersByRole)
    }, [members])

    return (
        <div className="bg-black min-h-screen">
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

                <div className="container-editorial relative z-10 text-center max-w-3xl mx-auto">
                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-overline text-orange-primary tracking-mega block mb-4">The People</motion.span>
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-display text-white mb-6">OUR TEAM</motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-body text-dark-400">
                        The passionate individuals who drive The Literary Club forward.
                    </motion.p>
                </div>
            </section>

            <section className="pb-24">
                <div className="container-editorial">
                    {isLoading ? (
                        <PageLoader />
                    ) : !sortedMembers.length ? (
                        <EmptyState title="No team members found" />
                    ) : (
                        <div className="space-y-12">
                            <motion.div
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: '-50px' }}
                            >
                                <motion.div variants={fadeUp} custom={0} className="flex items-center gap-4 mb-8">
                                    <h2 className="text-h2 text-white">THE TEAM</h2>
                                    <div className="flex-1 h-px bg-dark-700" />
                                    <span className="text-caption text-dark-500">{sortedMembers.length} members</span>
                                </motion.div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                                    {sortedMembers.map((member, mIdx) => (
                                        <motion.div
                                            key={member.id}
                                            variants={fadeUp}
                                            custom={mIdx + 1}
                                            className="relative w-full rounded-2xl overflow-hidden border border-dark-800 bg-dark-950 shadow-2xl flex flex-col h-full"
                                        >
                                            {/* Full-bleed background avatar (above the name) */}
                                            {member.avatar_url ? (
                                                <div className="relative flex-grow min-h-[220px] w-full overflow-hidden border-b border-dark-850">
                                                    <img
                                                        src={member.avatar_url}
                                                        alt={member.name}
                                                        className="w-full h-full object-cover"
                                                        loading="lazy"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="relative flex-grow min-h-[220px] w-full bg-dark-900 border-b border-dark-800 flex items-center justify-center overflow-hidden">
                                                    <span className="absolute text-[72px] font-heading font-bold text-dark-800/20 select-none tracking-tighter">
                                                        {getInitials(member.name)}
                                                    </span>
                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-orange-primary/5 via-transparent to-transparent opacity-30" />
                                                </div>
                                            )}

                                            {/* Card Content - with static textured background behind the name */}
                                            <div className="relative p-5 flex flex-col justify-between shrink-0 bg-dark-950 bg-gradient-noise">
                                                <div className="relative z-10">
                                                    {/* Role */}
                                                    <div className="flex items-center gap-1.5 mb-1.5 shrink-0">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-orange-primary" />
                                                        <span className="text-[9px] text-orange-primary font-bold uppercase tracking-ultra">
                                                            {member.role}
                                                        </span>
                                                    </div>

                                                    {/* Aesthetic Bold Name */}
                                                    <h3 className="font-heading text-h3 text-white uppercase tracking-wide leading-none mb-3">
                                                        {member.name}
                                                    </h3>

                                                    {/* Bio */}
                                                    {member.bio && (
                                                        <p className="text-caption text-dark-300 leading-relaxed line-clamp-3 mb-4">
                                                            {member.bio}
                                                        </p>
                                                    )}
                                                </div>

                                                {/* Social Links */}
                                                {member.social_links && Object.values(member.social_links).some(Boolean) && (
                                                    <div className="relative z-10 flex items-center gap-2 pt-3 border-t border-dark-850 mt-auto">
                                                        {Object.entries(member.social_links).map(([platform, url]) => (
                                                            url ? (
                                                                <a
                                                                    key={platform}
                                                                    href={url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="w-7 h-7 rounded-full bg-dark-900 border border-dark-800 text-dark-400 hover:text-orange-primary hover:border-orange-primary/30 hover:bg-orange-primary/10 flex items-center justify-center transition-all duration-300"
                                                                    title={platform.charAt(0).toUpperCase() + platform.slice(1)}
                                                                >
                                                                    <SocialIcon platform={platform} />
                                                                </a>
                                                            ) : null
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </motion.div>
                        </div>
                    )}
                </div>
            </section>
        </div>
    )
}