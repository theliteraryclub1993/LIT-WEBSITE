import { Outlet, useLocation } from 'react-router-dom'
import { Menu, Bell, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { getSettingsByCategory } from '@/services/settingsService'
import { cn } from '@/utils/cn'
import { Sidebar } from './Sidebar'
import { ScrollToTop } from './ScrollToTop'
import { Lightbox } from './Lightbox'
import { GlobalConfirmDialog } from './GlobalConfirmDialog'
import logo from '@/assets/logo.png'
import { Avatar, Button, Input, Breadcrumbs } from '@/components/ui'
import { useAuthStore, useUIStore } from '@/store'
import type { BreadcrumbItem } from '@/types'

function getPathBreadcrumbs(pathname: string): BreadcrumbItem[] {
    const segments = pathname.split('/').filter(Boolean)
    const filtered = segments.filter((s) => s !== 'admin')

    return filtered.map((segment, index) => {
        const path = '/' + ['admin', ...filtered.slice(0, index + 1)].join('/')
        const label = segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (l) => l.toUpperCase())

        return { label, href: path }
    })
}

export function AdminLayout() {
    const location = useLocation()

    const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed)
    const mobileSidebarOpen = useUIStore((s) => s.mobileSidebarOpen)
    const toggleSidebar = useUIStore((s) => s.toggleSidebar)
    const setMobileSidebarOpen = useUIStore((s) => s.setMobileSidebarOpen)

    const user = useAuthStore((s) => s.user)
    const [fetchedLogo, setFetchedLogo] = useState<string>('')

    // Fetch dynamic logo from settings
    useEffect(() => {
        getSettingsByCategory('homepage')
            .then((data: any) => {
                if (data?.logoUrl) setFetchedLogo(String(data.logoUrl))
            })
            .catch((err: any) => console.error('Failed to load logo in AdminLayout:', err))
    }, [])

    const breadcrumbs = getPathBreadcrumbs(location.pathname)

    return (
        <div className="min-h-screen bg-dark flex">
            <ScrollToTop />

            <Sidebar
                isCollapsed={sidebarCollapsed}
                onToggleCollapse={toggleSidebar}
                isMobileOpen={mobileSidebarOpen}
                onMobileClose={() => setMobileSidebarOpen(false)}
                userRole={user?.role}
            />

            <div
                className={cn(
                    'flex-1 flex flex-col min-h-screen transition-all duration-300',
                    sidebarCollapsed ? 'lg:ml-[68px]' : 'lg:ml-64'
                )}
            >
                <header className="sticky top-0 z-20 h-16 bg-dark-950/80 backdrop-blur-md border-b border-dark-800 flex items-center justify-between px-4 lg:px-6 shrink-0">
                    <div className="flex items-center gap-4">
  <img src={fetchedLogo || logo} alt="Admin logo" className="h-8 w-auto object-contain" />
  <button
    onClick={() => setMobileSidebarOpen(true)}
    className="lg:hidden p-2 rounded-md text-dark-400 hover:text-white hover:bg-dark-800 transition-colors"
    aria-label="Open sidebar"
  >
    <Menu size={20} />
  </button>

                        <div className="hidden md:block">
                            <Breadcrumbs items={breadcrumbs} />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="hidden md:block w-64">
                            <Input
                                placeholder="Search..."
                                size="sm"
                                leftIcon={<Search size={14} />}
                                className="[&_input]:py-1.5"
                            />
                        </div>

                        <Button variant="ghost" size="sm" className="relative p-2">
                            <Bell size={18} />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-orange-primary rounded-full" />
                        </Button>

                        <div className="w-px h-6 bg-dark-700 mx-1 hidden sm:block" />

                        <div className="flex items-center gap-3 cursor-pointer group">
                            <Avatar
                                src={user?.avatar_url}
                                name={user?.full_name || 'Admin'}
                                size="sm"
                                rounded
                                bordered
                            />
                            <div className="hidden sm:block">
                                <p className="text-body-sm text-white font-medium leading-tight group-hover:text-orange-primary transition-colors">
                                    {user?.full_name || 'Admin User'}
                                </p>
                                <p className="text-[10px] text-dark-500 uppercase tracking-widest">
                                    {user?.role || 'admin'}
                                </p>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-6 bg-dark-900/50">
                    <div className="md:hidden mb-4">
                        <Breadcrumbs items={breadcrumbs} />
                    </div>

                    <Outlet />
                </main>
            </div>

            {/* Global overlay components */}
            <Lightbox />
            <GlobalConfirmDialog />
        </div>
    )
}