import { Routes, Route, Navigate } from 'react-router-dom'
import { MainLayout } from '@/components/layouts/MainLayout'
import { AdminLayout } from '@/components/layouts/AdminLayout'
import { RequireAuth } from '@/components/auth/RequireAuth'
import { RoleGuard } from '@/components/auth/RoleGuard'
import { LoginPage } from '@/pages/auth/LoginPage'
import { HomePage } from '@/pages/public/HomePage'
import { AboutPage } from '@/pages/public/AboutPage'
import { MembersPage } from '@/pages/public/MembersPage'
import { AlumniPage } from '@/pages/public/AlumniPage'
import { EventsPage } from '@/pages/public/EventsPage'
import { AuditionsPage } from '@/pages/public/AuditionsPage'
import { GalleryPage } from '@/pages/public/GalleryPage'
import { EventDetailsPage } from '@/pages/public/EventDetailsPage'
import { ContactPage } from '@/pages/public/ContactPage'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { EventsPage as AdminEventsPage } from '@/pages/admin/EventsPage'
import { AuditionsPage as AdminAuditionsPage } from '@/pages/admin/AuditionsPage'
import { TeamPage } from '@/pages/admin/TeamPage'
import { SparkCMS } from '@/pages/admin/SparkCMS'
import { GalleryPage as AdminGalleryPage } from '@/pages/admin/GalleryPage'
import { AttendancePage } from '@/pages/admin/AttendancePage'
import { CertificatesPage } from '@/pages/admin/CertificatesPage'
import { SettingsPage } from '@/pages/admin/SettingsPage'
import { AnalyticsPage } from '@/pages/admin/AnalyticsPage'
import { NoesisCMS } from '@/pages/admin/NoesisCMS'
import { MalnadFestCMS } from '@/pages/admin/MalnadFestCMS'
import { SlideshowCMS } from '@/pages/admin/SlideshowCMS'
import { MediaLibraryPage } from '@/pages/admin/MediaLibraryPage'
import { useAuthStore } from '@/store'
import { useEffect } from 'react'



export function AppRoutes() {
  const initialize = useAuthStore((s) => s.initialize)
  const isLoading = useAuthStore((s) => s.isLoading)

  useEffect(() => { initialize() }, [initialize])
  console.log('[AppRoutes] isLoading:', isLoading)

  




  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:slug" element={<EventDetailsPage />} />
        <Route path="/team" element={<MembersPage />} />
        <Route path="/alumni" element={<AlumniPage />} />
        <Route path="/gallery" element={<GalleryPage />} />
        <Route path="/auditions" element={<AuditionsPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      <Route path="/admin" element={<RequireAuth />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="events" element={<RoleGuard minRole="eventManager"><AdminEventsPage /></RoleGuard>} />

          <Route path="auditions" element={<RoleGuard minRole="eventManager"><AdminAuditionsPage /></RoleGuard>} />
          <Route path="team" element={<RoleGuard minRole="contentEditor"><TeamPage /></RoleGuard>} />
          <Route path="spark" element={<RoleGuard minRole="contentEditor"><SparkCMS /></RoleGuard>} />
          <Route path="gallery" element={<RoleGuard minRole="contentEditor"><AdminGalleryPage /></RoleGuard>} />
          <Route path="attendance" element={<RoleGuard minRole="eventManager"><AttendancePage /></RoleGuard>} />
          <Route path="certificates" element={<RoleGuard minRole="eventManager"><CertificatesPage /></RoleGuard>} />
          <Route path="settings" element={<RoleGuard minRole="admin"><SettingsPage /></RoleGuard>} />
          <Route path="analytics" element={<RoleGuard minRole="admin"><AnalyticsPage /></RoleGuard>} />
          <Route path="noesis" element={<RoleGuard minRole="contentEditor"><NoesisCMS /></RoleGuard>} />
          <Route path="malnad-fest" element={<RoleGuard minRole="eventManager"><MalnadFestCMS /></RoleGuard>} />
          <Route path="slideshow" element={<RoleGuard minRole="contentEditor"><SlideshowCMS /></RoleGuard>} />
          <Route path="media" element={<RoleGuard minRole="contentEditor"><MediaLibraryPage /></RoleGuard>} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}