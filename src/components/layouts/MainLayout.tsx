import { Outlet } from 'react-router-dom'
import { Navbar } from './Navbar'
import { Footer } from './Footer'
import { ScrollToTop } from './ScrollToTop'

/**
 * Main public layout wrapping all non-admin pages.
 * Structure: Fixed Navbar -> Scrollable Content -> Footer.
 */
export function MainLayout() {
    return (
        <div className="min-h-screen flex flex-col bg-black">
            <ScrollToTop />
            <Navbar />

            {/* Spacer for fixed navbar height (h-16 lg:h-20) */}
            <div className="h-16 lg:h-20 shrink-0" />

            {/* Main content area — grows to fill space, pushing footer down */}
            <main className="flex-1">
                <Outlet />
            </main>

            <Footer />
        </div>
    )
}