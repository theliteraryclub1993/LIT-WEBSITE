import { useEffect, useState } from 'react'
import { getSettingsByCategory } from '@/services/settingsService'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Calendar,
    Users,
    Mic,
    UserCog,
    PenTool,
    Image,
    ScanLine,
    Award,
    BarChart3,
    Settings,
    ChevronLeft,
    LogOut,
    Home,
    BookOpen,
    GraduationCap,
    X,
} from 'lucide-react'
import { cn } from '@/utils/cn'
import { brand } from '@/config/brandConfig'
import { Tooltip } from '@/components/ui'
import { useAuthStore } from '@/store'
import type { UserRole } from '@/types'

const iconMap: Record<string, React.ReactNode> = {
    layoutDashboard: <LayoutDashboard size={20} />,
    calendar: <Calendar size={20} />,
    users: <Users size={20} />,
    mic: <Mic size={20} />,
    userCog: <UserCog size={20} />,
    penTool: <PenTool size={20} />,
    image: <Image size={20} />,
    scanLine: <ScanLine size={20} />,
    award: <Award size={20} />,
    barChart3: <BarChart3 size={20} />,
    settings: <Settings size={20} />,
    bookOpen: <BookOpen size={20} />,
    graduationCap: <GraduationCap size={20} />,
}

interface SidebarProps {
    isCollapsed: boolean
    onToggleCollapse: () => void
    isMobileOpen: boolean
    onMobileClose: () => void
    userRole?: UserRole
}

/**
 * Admin sidebar with collapsible desktop mode and slide-out mobile mode.
 * Role-based link filtering will be fully wired in Phase 9.
 */
export function Sidebar({
    isCollapsed,
    onToggleCollapse,
    isMobileOpen,
    onMobileClose,
}: SidebarProps) {
    const location = useLocation()
    const [logoUrl, setLogoUrl] = useState<string>('')

    // Fetch dynamic logo from settings
    useEffect(() => {
        getSettingsByCategory('homepage')
            .then((data: any) => {
                if (data?.logoUrl) setLogoUrl(String(data.logoUrl))
            })
            .catch((err: any) => console.error('Failed to load logo in Sidebar:', err))
    }, [])

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className={cn(
                'flex items-center h-16 border-b border-dark-700 shrink-0',
                isCollapsed ? 'justify-center px-2' : 'justify-between px-4'
            )}>
                {!isCollapsed && (
                    <Link to="/admin" className="flex items-center gap-2 group shrink-0">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="h-6 object-contain" />
                        ) : (
                            <span className="text-h5 text-white truncate">
                                ADMIN
                            </span>
                        )}
                    </Link>
                )}

                {/* Desktop Collapse Button */}
                <button
                    onClick={onToggleCollapse}
                    className="hidden lg:flex p-1.5 rounded-md text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                >
                    <ChevronLeft
                        size={18}
                        className={cn(
                            'transition-transform duration-300',
                            isCollapsed && 'rotate-180'
                        )}
                    />
                </button>

                {/* Mobile Close Button */}
                <button
                    onClick={onMobileClose}
                    className="lg:hidden p-1.5 rounded-md text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
                    aria-label="Close sidebar"
                >
                    <X size={18} />
                </button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 overflow-y-auto py-4 scrollbar-hide">
                <ul className="space-y-1 px-3">
                    {brand.navigation.admin.map((item) => {
                         const isActive = location.pathname === item.path
                         const Icon = iconMap[item.icon] || <LayoutDashboard size={20} />

                         const linkContent = (
                             <Link
                                 to={item.path}
                                 onClick={onMobileClose}
                                 className={cn(
                                    'relative flex items-center gap-3 rounded-lg transition-all duration-200 group',
                                    isCollapsed ? 'justify-center p-2.5' : 'px-3 py-2.5',
                                    isActive
                                        ? 'text-white bg-orange-subtle'
                                        : 'text-dark-400 hover:text-white hover:bg-dark-800'
                                )}
                            >
                                {/* Active Indicator Bar */}
                                {isActive && (
                                    <motion.div
                                        layoutId="admin-sidebar-active"
                                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-primary rounded-r-full"
                                        transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                                    />
                                )}

                                <span className={cn(
                                    'shrink-0 transition-colors duration-200',
                                    isActive ? 'text-orange-primary' : 'text-dark-500 group-hover:text-dark-200'
                                )}>
                                    {Icon}
                                </span>

                                {!isCollapsed && (
                                    <span className="text-body-sm font-medium truncate">
                                        {item.label}
                                    </span>
                                )}
                            </Link>
                        )

                        // Show tooltip when collapsed and hovered
                        if (isCollapsed) {
                            return (
                                <li key={item.path}>
                                    <Tooltip
                                        content={item.label}
                                        position="right"
                                    >
                                        {linkContent}
                                    </Tooltip>
                                </li>
                            )
                        }

                        return <li key={item.path}>{linkContent}</li>
                    })}
                </ul>
            </nav>

            {/* Footer / User Area */}
            <div className="border-t border-dark-700 p-3 shrink-0 space-y-1">
                {isCollapsed ? (
                    <>
                        <Tooltip content="Back to Site" position="right">
                            <Link
                                to="/"
                                className="flex items-center justify-center gap-3 rounded-lg p-2.5 text-dark-400 hover:text-white hover:bg-dark-800 transition-colors duration-200"
                            >
                                <Home size={20} className="shrink-0" />
                            </Link>
                        </Tooltip>
                        <Tooltip content="Log Out" position="right">
                            <button
                                onClick={() => useAuthStore.getState().logout()}
                                className="w-full flex items-center justify-center gap-3 rounded-lg p-2.5 text-red-500 hover:text-red-400 hover:bg-red-950/20 transition-colors duration-200 cursor-pointer"
                            >
                                <LogOut size={20} className="shrink-0" />
                            </button>
                        </Tooltip>
                    </>
                ) : (
                    <>
                        <Link
                            to="/"
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-dark-400 hover:text-white hover:bg-dark-800 transition-colors duration-200"
                        >
                            <Home size={20} className="shrink-0" />
                            <span className="text-body-sm font-medium">Back to Site</span>
                        </Link>
                        <button
                            onClick={() => useAuthStore.getState().logout()}
                            className="w-full flex items-center gap-3 rounded-lg px-3 py-2 text-red-500 hover:text-red-400 hover:bg-red-950/20 transition-colors duration-200 cursor-pointer"
                        >
                            <LogOut size={20} className="shrink-0" />
                            <span className="text-body-sm font-medium">Log Out</span>
                        </button>
                    </>
                )}
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={cn(
                    'hidden lg:flex flex-col fixed top-0 left-0 bottom-0 z-30 bg-dark-950 border-r border-dark-800 transition-all duration-300',
                    isCollapsed ? 'w-[68px]' : 'w-64'
                )}
            >
                {sidebarContent}
            </aside>

            {/* Mobile Sidebar Overlay */}
            <AnimatePresence>
                {isMobileOpen && (
                    <div className="fixed inset-0 z-40 lg:hidden">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={onMobileClose}
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="relative w-64 h-full bg-dark-950 border-r border-dark-800 shadow-2xl"
                        >
                            {sidebarContent}
                        </motion.aside>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}