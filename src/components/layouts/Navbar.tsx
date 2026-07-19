import { useState, useEffect, useCallback } from 'react'
import { getSettingsByCategory } from '@/services/settingsService'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { cn } from '@/utils/cn'
import { brand } from '@/config/brandConfig'
import { Button } from '@/components/ui'
import logo from '@/assets/logo.png'

/**
 * Premium editorial navbar with glassmorphism on scroll and mobile slide-out.
 */
export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false)
    const [isMobileOpen, setIsMobileOpen] = useState(false)
    const location = useLocation()
    const [logoUrl, setLogoUrl] = useState<string>('')
    const [mobileLogoUrl, setMobileLogoUrl] = useState<string>('')
    const [navLinks, setNavLinks] = useState<Array<{ label: string; path: string; visible: boolean }>>([])

    const isActive = useCallback(
        (path: string) => {
            if (path === '/') return location.pathname === '/'
            return location.pathname.startsWith(path)
        },
        [location.pathname]
    )

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20)
        }
        window.addEventListener('scroll', handleScroll, { passive: true })
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    // Fetch logo URL from homepage settings & navigation links
    useEffect(() => {
        getSettingsByCategory('homepage').then(data => {
            if (data?.logoUrl) setLogoUrl(String(data.logoUrl))
            if (data?.mobileLogoUrl) setMobileLogoUrl(String(data.mobileLogoUrl))
        }).catch(err => console.error('Failed to load logo URL:', err))

        getSettingsByCategory('navigation').then(data => {
            if (data?.navigation_items) {
                try {
                    const parsed = JSON.parse(String(data.navigation_items))
                    const visibleLinks = parsed.filter((item: any) => item.visible !== false)
                    if (visibleLinks.length > 0) {
                        setNavLinks(visibleLinks)
                        return
                    }
                } catch (e) {
                    console.error('Failed to parse navigation items:', e)
                }
            }
            setNavLinks(brand.navigation.public.map(item => ({ ...item, visible: true })))
        }).catch(err => {
            console.error('Failed to load navigation settings:', err)
            setNavLinks(brand.navigation.public.map(item => ({ ...item, visible: true })))
        })
    }, [])

    // Close mobile menu on route change
    useEffect(() => {
        setIsMobileOpen(false)
    }, [location.pathname])

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => {
            document.body.style.overflow = ''
        }
    }, [isMobileOpen])

    return (
        <>
            <header
                className={cn(
                    'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
                    isScrolled ? 'glass-darker shadow-lg' : 'bg-transparent'
                )}
            >
                <nav className="container-editorial flex items-center justify-between h-16 lg:h-20">
                    {/* Logo */}
                    <Link
                        to="/"
                        className="flex items-center gap-2 group shrink-0"
                    >
                        <img src={logoUrl || logo} alt="Logo" className="h-12 lg:h-14 object-contain" />
                        <div className="hidden sm:block h-5 w-px bg-dark-600" />
                        <span className="hidden sm:block text-caption text-dark-300 uppercase tracking-mega">
                            The Literary Club
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-1">
                        {navLinks.map((link) => (
                            <Link
                                key={link.path}
                                to={link.path}
                                className={cn(
                                    'relative px-4 py-2 text-label uppercase tracking-widest transition-colors duration-200',
                                    isActive(link.path)
                                        ? 'text-white'
                                        : 'text-dark-300 hover:text-white'
                                )}
                            >
                                {link.label}
                                {isActive(link.path) && (
                                    <motion.div
                                        layoutId="navbar-active-indicator"
                                        className="absolute bottom-0 left-2 right-2 h-0.5 bg-orange-primary"
                                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden lg:flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                const followLink = brand.social.find(s => s.name === 'Instagram')?.url || 'https://linktr.ee/lit1993?utm_source=qr_code';
                                window.open(followLink, '_blank');
                            }}
                        >
                            Follow Us
                        </Button>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="lg:hidden p-2 text-dark-200 hover:text-white transition-colors"
                        onClick={() => setIsMobileOpen(!isMobileOpen)}
                        aria-label="Toggle menu"
                    >
                        {isMobileOpen ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </nav>
            </header>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                            onClick={() => setIsMobileOpen(false)}
                        />

                        {/* Menu Panel */}
                        <motion.div
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="absolute top-0 right-0 bottom-0 w-full max-w-sm bg-dark-900 border-l border-dark-700 flex flex-col"
                        >
                            {/* Mobile Header */}
                            <div className="flex items-center justify-between p-5 border-b border-dark-700">
                                <img src={mobileLogoUrl || logo} alt="Logo" className="h-12 object-contain" />
                                <button
                                    onClick={() => setIsMobileOpen(false)}
                                    className="p-2 text-dark-400 hover:text-white transition-colors"
                                    aria-label="Close menu"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Mobile Links */}
                            <div className="flex-1 overflow-y-auto py-4">
                                {navLinks.map((link, index) => (
                                    <motion.div
                                        key={link.path}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Link
                                            to={link.path}
                                            className={cn(
                                                'flex items-center px-6 py-4 text-h6 transition-colors duration-200 border-l-2',
                                                isActive(link.path)
                                                    ? 'text-orange-primary border-orange-primary bg-orange-subtle'
                                                     : 'text-dark-300 border-transparent hover:text-white hover:bg-dark-800'
                                            )}
                                        >
                                            {link.label}
                                        </Link>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Mobile Footer */}
                            <div className="p-5 border-t border-dark-700 space-y-3">
                                <p className="text-caption text-dark-500 text-center">
                                    {brand.tagline}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}