import { useEffect, useState } from 'react'
import { getSettingsByCategory } from '@/services/settingsService'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { brand } from '@/config/brandConfig'
import { Divider, BrandIcons } from '@/components/ui'
import logo from '@/assets/logo.png'

const socialIcons: Record<string, React.ReactNode> = {
    instagram: <BrandIcons.Instagram size={18} />,
    youtube: <BrandIcons.Youtube size={18} />,
    twitter: <BrandIcons.Twitter size={18} />,
    linkedin: <BrandIcons.Linkedin size={18} />,
}

/**
 * Premium editorial footer with multi-column links and social icons.
 */
export function Footer() {
    const [footerLogoUrl, setFooterLogoUrl] = useState<string>('')
    const [tagline, setTagline] = useState<string>(brand.footer.tagline)
    const [socials, setSocials] = useState<Array<{ name: string; url: string; icon: string }>>([])
    const [exploreLinks, setExploreLinks] = useState<Array<{ label: string; path: string }>>([])

    useEffect(() => {
        // Load footer logo & tagline
        getSettingsByCategory('homepage')
            .then(data => {
                if (data?.footerLogoUrl) setFooterLogoUrl(String(data.footerLogoUrl))
            })
            .catch(err => console.error('Failed to load footer logo:', err))

        getSettingsByCategory('general')
            .then(data => {
                if (data?.appTagline) setTagline(String(data.appTagline))
            })
            .catch(err => console.error('Failed to load general settings for footer:', err))

        // Load social settings
        getSettingsByCategory('social')
            .then(data => {
                const loadedSocials: Array<{ name: string; url: string; icon: string }> = []
                if (data?.instagram) loadedSocials.push({ name: 'Instagram', url: String(data.instagram), icon: 'instagram' })
                if (data?.youtube) loadedSocials.push({ name: 'YouTube', url: String(data.youtube), icon: 'youtube' })
                if (data?.twitter) loadedSocials.push({ name: 'Twitter', url: String(data.twitter), icon: 'twitter' })
                if (data?.linkedin) loadedSocials.push({ name: 'LinkedIn', url: String(data.linkedin), icon: 'linkedin' })

                if (loadedSocials.length > 0) {
                    setSocials(loadedSocials)
                } else {
                    // Fallback
                    const fallback = brand.social.map(s => ({ name: s.name, url: s.url, icon: s.icon }))
                    setSocials(fallback)
                }
            })
            .catch(err => {
                console.error('Failed to load social settings for footer:', err)
                const fallback = brand.social.map(s => ({ name: s.name, url: s.url, icon: s.icon }))
                setSocials(fallback)
            })

        // Load navigation settings
        getSettingsByCategory('navigation')
            .then(data => {
                if (data?.navigation_items) {
                    try {
                        const parsed = JSON.parse(String(data.navigation_items))
                        const visibleLinks = parsed.filter((item: any) => item.visible !== false)
                        if (visibleLinks.length > 0) {
                            setExploreLinks(visibleLinks)
                            return
                        }
                    } catch (e) {
                        console.error('Failed to parse navigation items in footer:', e)
                    }
                }
                setExploreLinks([...brand.footer.sections[0].links])
            })
            .catch(err => {
                console.error('Failed to load navigation settings in footer:', err)
                setExploreLinks([...brand.footer.sections[0].links])
            })
    }, [])

    return (
        <footer className="bg-dark border-t border-dark-700 relative overflow-hidden">
            {/* Subtle top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-primary/40 to-transparent" />

            <div className="container-editorial py-16 lg:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8">
                    {/* Brand Column */}
                    <div className="lg:col-span-2 space-y-5">
                        <Link to="/" className="inline-block group">
                            <img src={footerLogoUrl || logo} alt="Branding" className="h-16 object-contain" />
                        </Link>

                        <p className="text-body-sm text-dark-400 max-w-sm leading-relaxed">
                            {tagline}
                        </p>

                        {/* Social Icons */}
                        <div className="flex items-center gap-3 pt-2">
                            {socials.map((item) => (
                                <a
                                    key={item.name}
                                    href={item.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-lg bg-dark-800 border border-dark-700 flex items-center justify-center text-dark-400 hover:text-orange-primary hover:border-orange-border hover:bg-orange-subtle transition-all duration-200"
                                    aria-label={item.name}
                                >
                                    {socialIcons[item.icon]}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Link Columns */}
                    <div>
                        <h4 className="text-label text-dark-200 mb-5 uppercase tracking-widest">
                            Explore
                        </h4>
                        <ul className="space-y-3">
                            {exploreLinks.map((link) => (
                                <li key={link.label}>
                                    <Link
                                        to={link.path}
                                        className="group inline-flex items-center gap-1 text-body-sm text-dark-400 hover:text-white transition-colors duration-200"
                                    >
                                        {link.label}
                                        <ArrowUpRight
                                            size={12}
                                            className="opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
                                        />
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {brand.footer.sections.slice(1).map((section) => (
                        <div key={section.title}>
                            <h4 className="text-label text-dark-200 mb-5 uppercase tracking-widest">
                                {section.title}
                            </h4>

                            <ul className="space-y-3">
                                {section.links.map((link) => (
                                    <li key={link.label}>
                                        <Link
                                            to={link.path}
                                            className="group inline-flex items-center gap-1 text-body-sm text-dark-400 hover:text-white transition-colors duration-200"
                                        >
                                            {link.label}
                                            <ArrowUpRight
                                                size={12}
                                                className="opacity-0 -translate-y-0.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200"
                                            />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Bar */}
            <Divider variant="orange" />

            <div className="container-editorial py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-caption text-dark-500">
                    {brand.footer.copyright}
                </p>

                <div className="flex items-center gap-6">
                    <Link
                        to="/privacy"
                        className="text-caption text-dark-500 hover:text-dark-300 transition-colors"
                    >
                        Privacy
                    </Link>
                    <Link
                        to="/terms"
                        className="text-caption text-dark-500 hover:text-dark-300 transition-colors"
                    >
                        Terms
                    </Link>
                    <span className="text-overline text-dark-600">
                        Est. {brand.founded}
                    </span>
                </div>
            </div>
        </footer>
    )
}