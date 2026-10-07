import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import { usePublicTeamMembers } from '@/hooks/useTeamMembers'
import { PageLoader, EmptyState, BrandIcons } from '@/components/ui'
import { sortMembersByRole, isAlumniMember, isStaffConvenor } from '@/utils/teamSorter'
import type { TeamMemberPublic } from '@/types'

const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
        opacity: 1, y: 0,
        transition: { delay: i * 0.05, duration: 0.5 },
    }),
}

const DEFAULT_STAFF_CONVENORS: TeamMemberPublic[] = [
    {
        id: 'placeholder-staff-1',
        name: 'Staff Convenor 1',
        role: 'Staff Convenor',
        department: 'Staff Convenors',
        avatar_url: null,
        bio: 'Faculty Mentor & Staff Convenor guiding the literary and cultural initiatives at MCE.',
        social_links: null,
    },
    {
        id: 'placeholder-staff-2',
        name: 'Staff Convenor 2',
        role: 'Staff Convenor',
        department: 'Staff Convenors',
        avatar_url: null,
        bio: 'Faculty Mentor & Staff Convenor guiding the literary and cultural initiatives at MCE.',
        social_links: null,
    },
]

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

function MemberCard({ member, index, isStaff }: { member: any; index: number; isStaff?: boolean }) {
    return (
        <motion.div
            key={member.id}
            variants={fadeUp}
            custom={index + 1}
            className={`group relative rounded-2xl overflow-hidden border ${
                isStaff
                    ? 'border-amber-500/30 bg-gradient-to-b from-dark-900/90 to-dark-950/90 hover:border-amber-500/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.15)]'
                    : 'border-dark-800 bg-dark-950/80 hover:border-orange-primary/40'
            } transition-all duration-500 flex flex-col shadow-xl w-full`}
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
                    <span className={`text-caption ${isStaff ? 'text-amber-400' : 'text-orange-primary'} uppercase tracking-widest font-semibold mb-1 block`}>
                        {member.role}
                    </span>
                    <h3 className={`text-h4 text-white font-bold ${isStaff ? 'group-hover:text-amber-400' : 'group-hover:text-orange-primary'} transition-colors leading-tight mb-1`}>
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
                                        className={`w-7 h-7 rounded-full bg-black/60 border border-dark-700 text-dark-300 ${
                                            isStaff
                                                ? 'hover:text-amber-400 hover:border-amber-400/40 hover:bg-amber-400/10'
                                                : 'hover:text-orange-primary hover:border-orange-primary/30 hover:bg-orange-primary/10'
                                        } flex items-center justify-center transition-all duration-300`}
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
    )
}

export function MembersPage() {
    const { data: members, isLoading } = usePublicTeamMembers()

    const { staffConvenors, coreTeamMembers } = useMemo(() => {
        if (!members) return { staffConvenors: DEFAULT_STAFF_CONVENORS, coreTeamMembers: [] }
        const nonAlumni = members.filter(m => !isAlumniMember(m))
        const sorted = [...nonAlumni].sort(sortMembersByRole)
        const staffFromDb = sorted.filter(isStaffConvenor)
        const core = sorted.filter(m => !isStaffConvenor(m))
        return {
            staffConvenors: staffFromDb.length > 0 ? staffFromDb : DEFAULT_STAFF_CONVENORS,
            coreTeamMembers: core,
        }
    }, [members])

    return (
        <div className="bg-black min-h-screen text-white">
            {/* Hero Section */}
            <section className="relative pt-20 sm:pt-24 pb-16 overflow-hidden">
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
                    <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-display text-white mb-6 uppercase tracking-wider">OUR TEAM</motion.h1>
                    <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-body text-dark-300 leading-relaxed max-w-2xl mx-auto">
                        The faculty convenors and passionate student leaders actively driving events, creative vision, and publications at The Literary Club.
                    </motion.p>
                </div>
            </section>

            {/* Grid Section */}
            <section className="pb-28">
                <div className="container-editorial px-4">
                    {isLoading ? (
                        <PageLoader />
                    ) : (!staffConvenors.length && !coreTeamMembers.length) ? (
                        <EmptyState title="No active team members found" />
                    ) : (
                        <div className="space-y-16">
                            {/* Staff Convenors Section */}
                            {staffConvenors.length > 0 && (
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: '-50px' }}
                                >
                                    <motion.div variants={fadeUp} custom={0} className="flex items-center gap-4 mb-8">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-h2 text-white font-bold tracking-wide">STAFF CONVENORS</h2>
                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30">
                                                Faculty Mentors
                                            </span>
                                        </div>
                                        <div className="flex-1 h-px bg-dark-800" />
                                        <span className="text-caption text-dark-500">
                                            {staffConvenors.length} {staffConvenors.length === 1 ? 'convenor' : 'convenors'}
                                        </span>
                                    </motion.div>

                                    <div className={`grid grid-cols-1 sm:grid-cols-2 ${
                                        staffConvenors.length <= 2
                                            ? 'md:grid-cols-2 max-w-2xl mx-auto'
                                            : staffConvenors.length === 3
                                            ? 'md:grid-cols-3 max-w-4xl mx-auto'
                                            : 'md:grid-cols-3 lg:grid-cols-4'
                                    } gap-8`}>
                                        {staffConvenors.map((member, mIdx) => (
                                            <MemberCard key={member.id} member={member} index={mIdx} isStaff />
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {/* Active Core Team Section */}
                            {coreTeamMembers.length > 0 && (
                                <motion.div
                                    initial="hidden"
                                    whileInView="visible"
                                    viewport={{ once: true, margin: '-50px' }}
                                >
                                    <motion.div variants={fadeUp} custom={0} className="flex items-center gap-4 mb-8">
                                        <div className="flex items-center gap-3">
                                            <h2 className="text-h2 text-white font-bold tracking-wide">ACTIVE CORE TEAM</h2>
                                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium tracking-wider uppercase bg-orange-primary/10 text-orange-primary border border-orange-primary/30">
                                                Student Body
                                            </span>
                                        </div>
                                        <div className="flex-1 h-px bg-dark-800" />
                                        <span className="text-caption text-dark-500">{coreTeamMembers.length} active members</span>
                                    </motion.div>

                                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                                        {coreTeamMembers.map((member, mIdx) => (
                                            <MemberCard key={member.id} member={member} index={mIdx} />
                                        ))}
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