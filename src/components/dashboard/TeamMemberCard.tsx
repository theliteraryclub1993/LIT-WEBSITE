import { Pencil, Trash2, Globe } from 'lucide-react'
import { motion } from 'framer-motion'
import { Badge, Button, BrandIcons } from '@/components/ui'
import type { TeamMember } from '@/types'

interface TeamMemberCardProps {
    member: TeamMember
    onEdit: (member: TeamMember) => void
    onDelete: (member: TeamMember) => void
    index?: number
}

const socialIcons: Record<string, React.ReactNode> = {
    instagram: <BrandIcons.Instagram size={14} />,
    twitter: <BrandIcons.Twitter size={14} />,
    linkedin: <BrandIcons.Linkedin size={14} />,
    youtube: <BrandIcons.Youtube size={14} />,
    website: <Globe size={14} />,
    github: <BrandIcons.Github size={14} />,
}

/**
 * Admin card for managing a team member.
 * Shows avatar, info, socials, and action buttons with hover reveal.
 */
export function TeamMemberCard({ member, onEdit, onDelete, index = 0 }: TeamMemberCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05, duration: 0.3 }}
            className="group relative bg-dark-900 border border-dark-800 rounded-xl overflow-hidden hover:border-dark-600 transition-all duration-300"
        >
            {/* Department Tag */}
            {member.department && (
                <div className="absolute top-0 left-0 right-0">
                    <div className="h-0.5 bg-gradient-to-r from-orange-primary via-orange-dark to-transparent" />
                </div>
            )}

            <div className="p-5">
                <div className="flex items-start gap-4">
                    {/* 3:4 Portrait Avatar */}
                    <div className="w-16 aspect-[3/4] rounded-lg overflow-hidden border border-dark-700 bg-dark-900 shrink-0 group-hover:border-orange-primary/40 transition-all duration-300">
                        {member.avatar_url ? (
                            <img
                                src={member.avatar_url}
                                alt={member.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-dark-500 font-bold text-xs bg-dark-850">
                                3:4
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                                <h3 className="text-h5 text-white truncate group-hover:text-orange-primary transition-colors">
                                    {member.name}
                                </h3>
                                <p className="text-caption text-orange-primary font-semibold truncate">{member.role}</p>
                            </div>

                            {/* Status + Actions — shown on hover */}
                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0">
                                {!member.is_active && (
                                    <Badge variant="default" size="sm" className="bg-dark-800 text-dark-400 border-dark-700">
                                        Inactive
                                    </Badge>
                                )}
                                <Button variant="ghost" size="xs" onClick={() => onEdit(member)} className="p-1.5">
                                    <Pencil size={13} />
                                </Button>
                                <Button variant="ghost" size="xs" onClick={() => onDelete(member)} className="p-1.5 text-dark-500 hover:text-error">
                                    <Trash2 size={13} />
                                </Button>
                            </div>
                        </div>

                        {member.department && (
                            <p className="text-caption text-dark-500 mt-1">{member.department}</p>
                        )}

                        {member.bio && (
                            <p className="text-body-sm text-dark-400 line-clamp-2 mt-2">{member.bio}</p>
                        )}

                        {/* Social Icons */}
                        {member.social_links && Object.entries(member.social_links).some(([, val]) => val) && (
                            <div className="flex items-center gap-1.5 mt-3">
                                {Object.entries(member.social_links).map(([key, url]) =>
                                    url ? (
                                        <a
                                            key={key}
                                            href={url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1 rounded text-dark-500 hover:text-orange-primary hover:bg-dark-800 transition-colors"
                                            aria-label={key}
                                        >
                                            {socialIcons[key]}
                                        </a>
                                    ) : null
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}