import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Settings, Globe, Shield, Home, Info, Edit2, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { getSettingsByCategory, setSetting } from '@/services/settingsService'
import { uploadFile } from '@/lib/supabase'
import { uploadBatchImages } from '@/lib/imageUploader'
import { Button, Input, Select, PageLoader, Switch } from '@/components/ui'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store'
import { logActivity, LOG_ACTIONS, ENTITY_TYPES } from '@/services/activityLogService'

type SettingsTab = 'general' | 'social' | 'security' | 'homepage' | 'about' | 'navigation'

export function SettingsPage() {
    const queryClient = useQueryClient()
    const user = useAuthStore(s => s.user)
    const [activeTab, setActiveTab] = useState<SettingsTab>('general')

    // Form fields - General
    const [appName, setAppName] = useState('The Literary Club')
    const [appTagline, setAppTagline] = useState('Where Words Come Alive')
    const [contactEmail, setContactEmail] = useState('info@litlife.club')
    const [allowRegistrations, setAllowRegistrations] = useState(true)

    // Form fields - Socials
    const [instagram, setInstagram] = useState('')
    const [twitter, setTwitter] = useState('')
    const [linkedin, setLinkedin] = useState('')
    const [youtube, setYoutube] = useState('')

    // Form fields - Security
    const [auditLogRetention, setAuditLogRetention] = useState('30')
    const [requireMfa, setRequireMfa] = useState(false)

    // Form fields - Homepage CMS
    const [homepageHeroTitle, setHomepageHeroTitle] = useState('Where Words Come Alive')
    const [logoFile, setLogoFile] = useState<File | null>(null)
    const [backgroundFile, setBackgroundFile] = useState<File | null>(null)
    const [logoPreview, setLogoPreview] = useState<string>('')
    const [backgroundPreview, setBackgroundPreview] = useState<string>('')
    const [homepageHeroSubtext, setHomepageHeroSubtext] = useState('Celebrating the interests and creative talents of each and every person.')
    const [statYears, setStatYears] = useState('30+')
    const [statEvents, setStatEvents] = useState('500+')
    const [statMembers, setStatMembers] = useState('2000+')

    // Additional Branding / Media Files
    const [mobileLogoFile, setMobileLogoFile] = useState<File | null>(null)
    const [mobileLogoPreview, setMobileLogoPreview] = useState<string>('')
    const [footerLogoFile, setFooterLogoFile] = useState<File | null>(null)
    const [footerLogoPreview, setFooterLogoPreview] = useState<string>('')
    const [heroBannerFile, setHeroBannerFile] = useState<File | null>(null)
    const [heroBannerPreview, setHeroBannerPreview] = useState<string>('')
    const [aboutSectionImageFile, setAboutSectionImageFile] = useState<File | null>(null)
    const [aboutSectionImagePreview, setAboutSectionImagePreview] = useState<string>('')
    const [welcomeSectionImageFile, setWelcomeSectionImageFile] = useState<File | null>(null)
    const [welcomeSectionImagePreview, setWelcomeSectionImagePreview] = useState<string>('')
    const [slideshowImages, setSlideshowImages] = useState<string[]>([])
    const [isUploadingSlideshow, setIsUploadingSlideshow] = useState(false)

    // Form fields - About Page CMS
    const [aboutEstablished, setAboutEstablished] = useState('Established 1993')
    const [aboutTitle, setAboutTitle] = useState('THE LITERARY CLUB')
    const [aboutDescription, setAboutDescription] = useState('One of the oldest and most pivotal clubs at Malnad College of Engineering (MCE). Comprising students from all years, we carry forward a glorious heritage of expression.')
    const [aboutMotto, setAboutMotto] = useState('To foster the talents and assorted interests of blooming engineers with creative skills and a penchant for literature.')
    const [aboutVision, setAboutVision] = useState('To guide the creative power of thoughts and expressions to build positive change.')
    const [aboutMission, setAboutMission] = useState('To continuously host enriching poetry sessions, workshops, debates, and public speaking programs.')
    const [aboutObjectives, setAboutObjectives] = useState('Build public speaking confidence; Create high quality publication editions; Organise intercollegiate fests.')

    // Form fields - Navigation Menu Configuration
    const [navigationItems, setNavigationItems] = useState<Array<{ label: string; path: string; visible: boolean }>>([
        { label: 'Home', path: '/', visible: true },
        { label: 'About', path: '/about', visible: true },
        { label: 'Events', path: '/events', visible: true },
        { label: 'Team', path: '/team', visible: true },
        { label: 'Gallery', path: '/gallery', visible: true },
        { label: 'Auditions', path: '/auditions', visible: true }
    ])

    // Fetch settings
    const { isLoading, refetch } = useQuery({
        queryKey: ['admin-settings'],
        queryFn: async () => {
            const [general, social, security, homepage, about, navData] = await Promise.all([
                getSettingsByCategory('general'),
                getSettingsByCategory('social'),
                getSettingsByCategory('security'),
                getSettingsByCategory('homepage'),
                getSettingsByCategory('about'),
                getSettingsByCategory('navigation'),
            ])

            // General
            if (general.appName) setAppName(String(general.appName))
            if (general.appTagline) setAppTagline(String(general.appTagline))
            if (general.contactEmail) setContactEmail(String(general.contactEmail))
            if (general.allowRegistrations !== undefined) setAllowRegistrations(Boolean(general.allowRegistrations))

            // Socials
            if (social.instagram) setInstagram(String(social.instagram))
            if (social.twitter) setTwitter(String(social.twitter))
            if (social.linkedin) setLinkedin(String(social.linkedin))
            if (social.youtube) setYoutube(String(social.youtube))

            // Security
            if (security.auditLogRetention) setAuditLogRetention(String(security.auditLogRetention))
            if (security.requireMfa !== undefined) setRequireMfa(Boolean(security.requireMfa))

            // Homepage
            if (homepage.heroTitle) setHomepageHeroTitle(String(homepage.heroTitle))
            setHomepageHeroSubtext(String(homepage.heroSubtext))
            setStatYears(String(homepage.statYears))
            setStatEvents(String(homepage.statEvents))
            setStatMembers(String(homepage.statMembers))
            if (homepage.slideshowImages) {
                try {
                    const parsed = typeof homepage.slideshowImages === 'string'
                        ? JSON.parse(homepage.slideshowImages)
                        : homepage.slideshowImages
                    if (Array.isArray(parsed)) {
                        setSlideshowImages(parsed.map(String))
                    }
                } catch (e) {
                    console.error('Failed to parse slideshow images settings:', e)
                }
            }
            // Set previews if URLs exist
            if (homepage.logoUrl) setLogoPreview(String(homepage.logoUrl))
            if (homepage.backgroundUrl) setBackgroundPreview(String(homepage.backgroundUrl))
            if (homepage.mobileLogoUrl) setMobileLogoPreview(String(homepage.mobileLogoUrl))
            if (homepage.footerLogoUrl) setFooterLogoPreview(String(homepage.footerLogoUrl))
            if (homepage.heroBannerUrl) setHeroBannerPreview(String(homepage.heroBannerUrl))
            if (homepage.aboutSectionImageUrl) setAboutSectionImagePreview(String(homepage.aboutSectionImageUrl))
            if (homepage.welcomeSectionImageUrl) setWelcomeSectionImagePreview(String(homepage.welcomeSectionImageUrl))

            // About
            if (about.established) setAboutEstablished(String(about.established))
            if (about.title) setAboutTitle(String(about.title))
            if (about.description) setAboutDescription(String(about.description))
            if (about.motto) setAboutMotto(String(about.motto))
            if (about.vision) setAboutVision(String(about.vision))
            if (about.mission) setAboutMission(String(about.mission))
            if (about.objectives) setAboutObjectives(String(about.objectives))

            // Navigation Items
            if (navData.navigation_items) {
                try {
                    setNavigationItems(JSON.parse(String(navData.navigation_items)))
                } catch {
                    // Fallback to default
                }
            }

            return { general, social, security, homepage, about, navData }
        },
    })

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (activeTab === 'general') {
                await Promise.all([
                    setSetting('appName', appName, 'general', user?.id),
                    setSetting('appTagline', appTagline, 'general', user?.id),
                    setSetting('contactEmail', contactEmail, 'general', user?.id),
                    setSetting('allowRegistrations', allowRegistrations, 'general', user?.id),
                ])
            } else if (activeTab === 'social') {
                await Promise.all([
                    setSetting('instagram', instagram, 'social', user?.id),
                    setSetting('twitter', twitter, 'social', user?.id),
                    setSetting('linkedin', linkedin, 'social', user?.id),
                    setSetting('youtube', youtube, 'social', user?.id),
                ])
            } else if (activeTab === 'security') {
                await Promise.all([
                    setSetting('auditLogRetention', auditLogRetention, 'security', user?.id),
                    setSetting('requireMfa', requireMfa, 'security', user?.id),
                ])
            } else if (activeTab === 'homepage') {
                let finalLogoUrl = null;
                let finalBgUrl = null;
                let finalMobileLogoUrl = null;
                let finalFooterLogoUrl = null;
                let finalHeroBannerUrl = null;
                let finalAboutImgUrl = null;
                let finalWelcomeImgUrl = null;

                if (logoFile) {
                    const uploaded = await uploadFile('settings', `logo/${Date.now()}_${logoFile.name}`, logoFile, { upsert: true });
                    if (uploaded) finalLogoUrl = uploaded;
                }
                if (backgroundFile) {
                    const uploaded = await uploadFile('settings', `background/${Date.now()}_${backgroundFile.name}`, backgroundFile, { upsert: true });
                    if (uploaded) finalBgUrl = uploaded;
                }
                if (mobileLogoFile) {
                    const uploaded = await uploadFile('settings', `logo/mobile_${Date.now()}_${mobileLogoFile.name}`, mobileLogoFile, { upsert: true });
                    if (uploaded) finalMobileLogoUrl = uploaded;
                }
                if (footerLogoFile) {
                    const uploaded = await uploadFile('settings', `logo/footer_${Date.now()}_${footerLogoFile.name}`, footerLogoFile, { upsert: true });
                    if (uploaded) finalFooterLogoUrl = uploaded;
                }
                if (heroBannerFile) {
                    const uploaded = await uploadFile('settings', `banners/hero_${Date.now()}_${heroBannerFile.name}`, heroBannerFile, { upsert: true });
                    if (uploaded) finalHeroBannerUrl = uploaded;
                }
                if (aboutSectionImageFile) {
                    const uploaded = await uploadFile('settings', `about/about_${Date.now()}_${aboutSectionImageFile.name}`, aboutSectionImageFile, { upsert: true });
                    if (uploaded) finalAboutImgUrl = uploaded;
                }
                if (welcomeSectionImageFile) {
                    const uploaded = await uploadFile('settings', `welcome/welcome_${Date.now()}_${welcomeSectionImageFile.name}`, welcomeSectionImageFile, { upsert: true });
                    if (uploaded) finalWelcomeImgUrl = uploaded;
                }

                await Promise.all([
                      setSetting('heroTitle', homepageHeroTitle, 'homepage', user?.id),
                      setSetting('heroSubtext', homepageHeroSubtext, 'homepage', user?.id),
                      setSetting('statYears', statYears, 'homepage', user?.id),
                      setSetting('statEvents', statEvents, 'homepage', user?.id),
                      setSetting('statMembers', statMembers, 'homepage', user?.id),
                      setSetting('slideshowImages', JSON.stringify(slideshowImages), 'homepage', user?.id),
                      ...(finalLogoUrl ? [setSetting('logoUrl', finalLogoUrl, 'homepage', user?.id)] : []),
                      ...(finalBgUrl ? [setSetting('backgroundUrl', finalBgUrl, 'homepage', user?.id)] : []),
                      ...(finalMobileLogoUrl ? [setSetting('mobileLogoUrl', finalMobileLogoUrl, 'homepage', user?.id)] : []),
                      ...(finalFooterLogoUrl ? [setSetting('footerLogoUrl', finalFooterLogoUrl, 'homepage', user?.id)] : []),
                      ...(finalHeroBannerUrl ? [setSetting('heroBannerUrl', finalHeroBannerUrl, 'homepage', user?.id)] : []),
                      ...(finalAboutImgUrl ? [setSetting('aboutSectionImageUrl', finalAboutImgUrl, 'homepage', user?.id)] : []),
                      ...(finalWelcomeImgUrl ? [setSetting('welcomeSectionImageUrl', finalWelcomeImgUrl, 'homepage', user?.id)] : [])
                 ])
            } else if (activeTab === 'about') {
                await Promise.all([
                    setSetting('established', aboutEstablished, 'about', user?.id),
                    setSetting('title', aboutTitle, 'about', user?.id),
                    setSetting('description', aboutDescription, 'about', user?.id),
                    setSetting('motto', aboutMotto, 'about', user?.id),
                    setSetting('vision', aboutVision, 'about', user?.id),
                    setSetting('mission', aboutMission, 'about', user?.id),
                    setSetting('objectives', aboutObjectives, 'about', user?.id),
                ])
            } else if (activeTab === 'navigation') {
                await setSetting('navigation_items', JSON.stringify(navigationItems), 'navigation', user?.id)
            }

            // Log activity
            await logActivity({
                userId: user?.id,
                action: LOG_ACTIONS.SETTINGS_UPDATE,
                entityType: ENTITY_TYPES.SETTINGS,
                details: { title: `Updated ${activeTab} settings` },
            })
        },
        onSuccess: () => {
            toast.success('Settings updated successfully!')
            queryClient.invalidateQueries({ queryKey: ['admin-settings'] })
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to save settings')
        }
    })

    if (isLoading) {
        return <PageLoader label="Loading configuration settings..." />
    }

    const tabsList: Array<{ id: SettingsTab; label: string }> = [
        { id: 'general', label: 'General' },
        { id: 'social', label: 'Social Networks' },
        { id: 'homepage', label: 'Homepage CMS' },
        { id: 'about', label: 'About Page CMS' },
        { id: 'navigation', label: 'Navigation Configuration' },
        { id: 'security', label: 'System & Security' },
    ]

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-h2 text-white font-semibold">Global Settings</h1>
                <p className="text-body-sm text-dark-400 mt-1">Configure global application variables, branding, and parameters.</p>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-dark-800">
                {tabsList.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`px-5 py-3 text-body-sm font-semibold uppercase tracking-wider transition-colors cursor-pointer ${
                            activeTab === tab.id
                                ? 'text-orange-primary border-b-2 border-orange-primary'
                                : 'text-dark-500 hover:text-dark-300'
                        }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Form Box */}
            <div className="bg-dark-900 border border-dark-800 rounded-xl p-6">
                <form
                    onSubmit={(e) => {
                        e.preventDefault()
                        saveMutation.mutate()
                    }}
                    className="space-y-6"
                >
                    {activeTab === 'general' && (
                        <div className="space-y-4">
                            <h3 className="text-h5 text-white flex items-center gap-2 mb-2">
                                <Settings size={18} className="text-orange-primary" /> General Configurations
                            </h3>
                            <Input
                                label="App Name"
                                value={appName}
                                onChange={(e) => setAppName(e.target.value)}
                            />
                            <Input
                                label="Tagline"
                                value={appTagline}
                                onChange={(e) => setAppTagline(e.target.value)}
                            />
                            <Input
                                label="Contact / Admin Email"
                                type="email"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                            />
                            <div className="pt-2">
                                <Switch
                                    label="Allow New Registrations"
                                    description="Enable/Disable registrations for upcoming public events"
                                    checked={allowRegistrations}
                                    onChange={(checked) => setAllowRegistrations(checked)}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'social' && (
                        <div className="space-y-4">
                            <h3 className="text-h5 text-white flex items-center gap-2 mb-2">
                                <Globe size={18} className="text-orange-primary" /> Social Networks
                            </h3>
                            <Input
                                label="Instagram Link"
                                placeholder="https://instagram.com/club"
                                value={instagram}
                                onChange={(e) => setInstagram(e.target.value)}
                            />
                            <Input
                                label="Twitter / X Link"
                                placeholder="https://twitter.com/club"
                                value={twitter}
                                onChange={(e) => setTwitter(e.target.value)}
                            />
                            <Input
                                label="LinkedIn Link"
                                placeholder="https://linkedin.com/company/club"
                                value={linkedin}
                                onChange={(e) => setLinkedin(e.target.value)}
                            />
                            <Input
                                label="YouTube Link"
                                placeholder="https://youtube.com/@club"
                                value={youtube}
                                onChange={(e) => setYoutube(e.target.value)}
                            />
                        </div>
                    )}

                    {activeTab === 'homepage' && (
                        <div className="space-y-4">
                            <h3 className="text-h5 text-white flex items-center gap-2 mb-2">
                                <Home size={18} className="text-orange-primary" /> Homepage CMS Content
                            </h3>
                            <Input
                                label="Hero Section Title"
                                value={homepageHeroTitle}
                                onChange={(e) => setHomepageHeroTitle(e.target.value)}
                            />
                            <Input
                                 label="Hero Subtext"
                                 value={homepageHeroSubtext}
                                 onChange={(e) => setHomepageHeroSubtext(e.target.value)}
                             />
                             {/* Logo Upload */}
                             <div className="flex flex-col space-y-2">
                                 <label className="block text-body-sm font-medium text-dark-200">Logo Image</label>
                                 <input
                                     type="file"
                                     accept="image/*"
                                     onChange={e => {
                                      const file = e.target.files?.[0] ?? null;
                                      setLogoFile(file);
                                      setLogoPreview(file ? URL.createObjectURL(file) : '');
                                  }}
                                     className="text-dark-400"
                                 />
                                 {logoPreview && (
                                     <img src={logoPreview} alt="Logo preview" className="h-16 object-contain" />
                                 )}
                             </div>
                             {/* Background Upload */}
                             <div className="flex flex-col space-y-2">
                                 <label className="block text-body-sm font-medium text-dark-200">Background Image</label>
                                 <input
                                     type="file"
                                     accept="image/*"
                                     onChange={e => {
                                      const file = e.target.files?.[0] ?? null;
                                      setBackgroundFile(file);
                                      setBackgroundPreview(file ? URL.createObjectURL(file) : '');
                                  }}
                                     className="text-dark-400"
                                 />
                                 {backgroundPreview && (
                                     <img src={backgroundPreview} alt="Background preview" className="h-24 object-cover" />
                                 )}
                             </div>
                             {/* Mobile Logo Upload */}
                             <div className="flex flex-col space-y-2">
                                 <label className="block text-body-sm font-medium text-dark-200">Mobile Navbar Logo Image</label>
                                 <input
                                     type="file"
                                     accept="image/*"
                                     onChange={e => {
                                      const file = e.target.files?.[0] ?? null;
                                      setMobileLogoFile(file);
                                      setMobileLogoPreview(file ? URL.createObjectURL(file) : '');
                                  }}
                                     className="text-dark-400"
                                 />
                                 {mobileLogoPreview && (
                                     <img src={mobileLogoPreview} alt="Mobile logo preview" className="h-12 object-contain" />
                                 )}
                             </div>
                             {/* Footer Logo Upload */}
                             <div className="flex flex-col space-y-2">
                                 <label className="block text-body-sm font-medium text-dark-200">Footer Logo Image</label>
                                 <input
                                     type="file"
                                     accept="image/*"
                                     onChange={e => {
                                      const file = e.target.files?.[0] ?? null;
                                      setFooterLogoFile(file);
                                      setFooterLogoPreview(file ? URL.createObjectURL(file) : '');
                                  }}
                                     className="text-dark-400"
                                 />
                                 {footerLogoPreview && (
                                     <img src={footerLogoPreview} alt="Footer logo preview" className="h-12 object-contain" />
                                 )}
                             </div>
                             {/* Hero Banner Upload */}
                             <div className="flex flex-col space-y-2">
                                 <label className="block text-body-sm font-medium text-dark-200">Hero Banner / Foreground Image</label>
                                 <input
                                     type="file"
                                     accept="image/*"
                                     onChange={e => {
                                      const file = e.target.files?.[0] ?? null;
                                      setHeroBannerFile(file);
                                      setHeroBannerPreview(file ? URL.createObjectURL(file) : '');
                                  }}
                                     className="text-dark-400"
                                 />
                                 {heroBannerPreview && (
                                     <img src={heroBannerPreview} alt="Hero banner preview" className="h-20 object-contain" />
                                 )}
                             </div>
                             {/* About Image Upload */}
                             <div className="flex flex-col space-y-2">
                                 <label className="block text-body-sm font-medium text-dark-200">About Section Content Image</label>
                                 <input
                                     type="file"
                                     accept="image/*"
                                     onChange={e => {
                                      const file = e.target.files?.[0] ?? null;
                                      setAboutSectionImageFile(file);
                                      setAboutSectionImagePreview(file ? URL.createObjectURL(file) : '');
                                  }}
                                     className="text-dark-400"
                                 />
                                 {aboutSectionImagePreview && (
                                     <img src={aboutSectionImagePreview} alt="About image preview" className="h-20 object-contain" />
                                 )}
                             </div>
                             {/* Welcome Image Upload */}
                             <div className="flex flex-col space-y-2">
                                 <label className="block text-body-sm font-medium text-dark-200">Welcome Section Image</label>
                                 <input
                                     type="file"
                                     accept="image/*"
                                     onChange={e => {
                                      const file = e.target.files?.[0] ?? null;
                                      setWelcomeSectionImageFile(file);
                                      setWelcomeSectionImagePreview(file ? URL.createObjectURL(file) : '');
                                  }}
                                     className="text-dark-400"
                                 />
                                 {welcomeSectionImagePreview && (
                                     <img src={welcomeSectionImagePreview} alt="Welcome image preview" className="h-20 object-contain" />
                                 )}
                             </div>
                            <div>
                                <label className="block text-body-sm font-medium text-dark-200 mb-1">Hero Subtext</label>
                                <textarea
                                    value={homepageHeroSubtext}
                                    onChange={(e) => setHomepageHeroSubtext(e.target.value)}
                                    className="w-full bg-dark-900 border border-dark-750 focus:border-orange-primary focus:ring-1 focus:ring-orange-primary rounded-lg p-3 text-body-sm text-white placeholder-dark-600 focus:outline-none min-h-[80px]"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <Input
                                    label="Stat: Years Active"
                                    value={statYears}
                                    onChange={(e) => setStatYears(e.target.value)}
                                />
                                <Input
                                    label="Stat: Events Hosted"
                                    value={statEvents}
                                    onChange={(e) => setStatEvents(e.target.value)}
                                />
                                <Input
                                    label="Stat: Members"
                                    value={statMembers}
                                    onChange={(e) => setStatMembers(e.target.value)}
                                />
                            </div>

                            {/* Slideshow Manager */}
                            <div className="border-t border-dark-800 pt-6 mt-6 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-body-md font-semibold text-white uppercase tracking-wider mb-1">
                                            Homepage Slideshow Banners
                                        </h4>
                                        <p className="text-caption text-dark-400 mb-3">
                                            Upload and manage images displayed in the Home Page hero slideshow section.
                                        </p>
                                    </div>
                                    <Link
                                        to="/admin/slideshow"
                                        className="px-3 py-1.5 bg-orange-primary/10 hover:bg-orange-primary/20 text-orange-primary text-caption rounded-lg border border-orange-primary/20 font-medium transition-colors"
                                    >
                                        Open Full Slideshow CMS &rarr;
                                    </Link>
                                </div>

                                <div className="bg-dark-900 border border-dark-800 rounded-xl p-4 space-y-2">
                                    <label className="block text-body-sm font-semibold text-white mb-1">
                                        {isUploadingSlideshow ? 'Compressing & Uploading Images...' : 'Upload Slideshow Images (Multiple Selection Supported)'}
                                    </label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={async (e) => {
                                            const files = Array.from(e.target.files || [])
                                            e.target.value = ''
                                            if (files.length === 0) return

                                            const tid = toast.loading(`Preparing ${files.length} slideshow image(s)...`)
                                            try {
                                                setIsUploadingSlideshow(true)
                                                const urls = await uploadBatchImages('settings', 'homepage_slideshow', files, (completed, total, name) => {
                                                    toast.loading(`Uploaded ${completed} of ${total}: ${name}`, { id: tid })
                                                })
                                                if (urls && urls.length > 0) {
                                                    setSlideshowImages(prev => [...prev, ...urls])
                                                    toast.success(`${urls.length} image(s) processed & added to slideshow!`, { id: tid })
                                                } else {
                                                    toast.error('No valid images were uploaded', { id: tid })
                                                }
                                            } catch (err: any) {
                                                console.error('[SettingsPage] Upload exception:', err)
                                                toast.error(`Upload error: ${err?.message || 'Failed'}`, { id: tid })
                                            } finally {
                                                setIsUploadingSlideshow(false)
                                            }
                                        }}
                                        className="block w-full text-body-sm text-dark-300 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-body-sm file:font-semibold file:bg-orange-primary file:text-black hover:file:bg-orange-dark cursor-pointer bg-dark-950 border border-dark-700 rounded-lg p-2"
                                    />
                                    <p className="text-[11px] text-dark-400">Hold Ctrl or Shift to select multiple images at once (JPG, PNG, WebP, GIF).</p>
                                </div>

                                {/* Slides grid */}
                                {slideshowImages.length > 0 ? (
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-dark-900/40 rounded-xl border border-dark-800">
                                        {slideshowImages.map((url, index) => (
                                            <div key={`${url}-${index}`} className="relative group rounded-lg overflow-hidden border border-dark-700 bg-dark-950 aspect-video">
                                                <img src={url} alt={`Slide ${index + 1}`} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
                                                    {index > 0 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSlideshowImages(prev => {
                                                                if (index <= 0) return prev
                                                                const next = [...prev]
                                                                const item = next[index]
                                                                const prevItem = next[index - 1]
                                                                if (item !== undefined && prevItem !== undefined) {
                                                                    next[index] = prevItem
                                                                    next[index - 1] = item
                                                                }
                                                                return next
                                                            })}
                                                            className="p-1.5 bg-dark-800 hover:bg-dark-700 text-white rounded-full transition-colors cursor-pointer"
                                                            title="Move Left"
                                                        >
                                                            <ChevronLeft size={14} />
                                                        </button>
                                                    )}

                                                    <label className="p-1.5 bg-dark-800 hover:bg-dark-700 text-white rounded-full transition-colors cursor-pointer" title="Replace Image">
                                                        <Edit2 size={14} />
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={async (e) => {
                                                                const file = e.target.files?.[0]
                                                                if (file) {
                                                                    const tid = toast.loading('Replacing image...')
                                                                    try {
                                                                        const urls = await uploadBatchImages('settings', 'homepage_slideshow', [file])
                                                                        if (urls && urls.length > 0 && urls[0]) {
                                                                            const replacementUrl = urls[0]
                                                                            setSlideshowImages(prev => {
                                                                                const next = [...prev]
                                                                                next[index] = replacementUrl
                                                                                return next
                                                                            })
                                                                            toast.success('Image replaced!', { id: tid })
                                                                        } else {
                                                                            toast.error('Failed to replace image', { id: tid })
                                                                        }
                                                                    } catch (err) {
                                                                        toast.error('Error replacing image', { id: tid })
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    </label>

                                                    {index < slideshowImages.length - 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setSlideshowImages(prev => {
                                                                if (index >= prev.length - 1) return prev
                                                                const next = [...prev]
                                                                const item = next[index]
                                                                const nextItem = next[index + 1]
                                                                if (item !== undefined && nextItem !== undefined) {
                                                                    next[index] = nextItem
                                                                    next[index + 1] = item
                                                                }
                                                                return next
                                                            })}
                                                            className="p-1.5 bg-dark-800 hover:bg-dark-700 text-white rounded-full transition-colors cursor-pointer"
                                                            title="Move Right"
                                                        >
                                                            <ChevronRight size={14} />
                                                        </button>
                                                    )}

                                                    <button
                                                        type="button"
                                                        onClick={() => setSlideshowImages(prev => prev.filter((_, i) => i !== index))}
                                                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full transition-colors cursor-pointer"
                                                        title="Remove Image"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/70 rounded text-[10px] text-white font-mono">
                                                    Slide {index + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 rounded-lg border border-dashed border-dark-800 bg-dark-950 text-body-sm text-dark-500">
                                        No slideshow images configured. Default system images will be displayed on the Home Page.
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {activeTab === 'about' && (
                        <div className="space-y-4">
                            <h3 className="text-h5 text-white flex items-center gap-2 mb-2">
                                <Info size={18} className="text-orange-primary" /> About Page CMS Content
                            </h3>
                            <Input
                                label="Established Subheading"
                                value={aboutEstablished}
                                onChange={(e) => setAboutEstablished(e.target.value)}
                            />
                            <Input
                                label="About Section Title"
                                value={aboutTitle}
                                onChange={(e) => setAboutTitle(e.target.value)}
                            />
                            <div>
                                <label className="block text-body-sm font-medium text-dark-200 mb-1">About Page Description</label>
                                <textarea
                                    value={aboutDescription}
                                    onChange={(e) => setAboutDescription(e.target.value)}
                                    className="w-full bg-dark-900 border border-dark-750 focus:border-orange-primary focus:ring-1 focus:ring-orange-primary rounded-lg p-3 text-body-sm text-white placeholder-dark-600 focus:outline-none min-h-[100px]"
                                />
                            </div>
                            <div>
                                <label className="block text-body-sm font-medium text-dark-200 mb-1">Club Motto</label>
                                <textarea
                                    value={aboutMotto}
                                    onChange={(e) => setAboutMotto(e.target.value)}
                                    className="w-full bg-dark-900 border border-dark-750 focus:border-orange-primary focus:ring-1 focus:ring-orange-primary rounded-lg p-3 text-body-sm text-white placeholder-dark-600 focus:outline-none min-h-[60px]"
                                />
                            </div>
                            <div>
                                <label className="block text-body-sm font-medium text-dark-200 mb-1">Vision</label>
                                <textarea
                                    value={aboutVision}
                                    onChange={(e) => setAboutVision(e.target.value)}
                                    className="w-full bg-dark-900 border border-dark-750 focus:border-orange-primary focus:ring-1 focus:ring-orange-primary rounded-lg p-3 text-body-sm text-white placeholder-dark-600 focus:outline-none min-h-[60px]"
                                />
                            </div>
                            <div>
                                <label className="block text-body-sm font-medium text-dark-200 mb-1">Mission</label>
                                <textarea
                                    value={aboutMission}
                                    onChange={(e) => setAboutMission(e.target.value)}
                                    className="w-full bg-dark-900 border border-dark-750 focus:border-orange-primary focus:ring-1 focus:ring-orange-primary rounded-lg p-3 text-body-sm text-white placeholder-dark-600 focus:outline-none min-h-[60px]"
                                />
                            </div>
                            <div>
                                <label className="block text-body-sm font-medium text-dark-200 mb-1">Objectives</label>
                                <textarea
                                    value={aboutObjectives}
                                    onChange={(e) => setAboutObjectives(e.target.value)}
                                    className="w-full bg-dark-900 border border-dark-750 focus:border-orange-primary focus:ring-1 focus:ring-orange-primary rounded-lg p-3 text-body-sm text-white placeholder-dark-600 focus:outline-none min-h-[60px]"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'navigation' && (
                        <div className="space-y-6">
                            <div>
                                <h3 className="text-h5 text-white flex items-center gap-2 mb-1">
                                    <Globe size={18} className="text-orange-primary" /> Navigation Configuration
                                </h3>
                                <p className="text-body-sm text-dark-400">Manage site-wide navigation links. You can add new links, rename existing ones, change paths, toggle visibility, and reorder them.</p>
                            </div>

                            <div className="space-y-4">
                                {navigationItems.map((item, idx) => (
                                    <div key={idx} className="flex flex-wrap items-center gap-4 bg-dark-950 p-4 rounded-xl border border-dark-800">
                                        <div className="flex-1 min-w-[200px] grid grid-cols-2 gap-3">
                                            <Input
                                                label="Menu Label"
                                                value={item.label}
                                                onChange={(e) => {
                                                    const updated = [...navigationItems]
                                                    updated[idx] = { ...item, label: e.target.value }
                                                    setNavigationItems(updated)
                                                }}
                                            />
                                            <Input
                                                label="Link Path"
                                                value={item.path}
                                                onChange={(e) => {
                                                    const updated = [...navigationItems]
                                                    updated[idx] = { ...item, path: e.target.value }
                                                    setNavigationItems(updated)
                                                }}
                                            />
                                        </div>

                                        <div className="flex items-center gap-4 pt-5">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    label="Visible"
                                                    checked={item.visible}
                                                    onChange={(checked) => {
                                                        const updated = [...navigationItems]
                                                        updated[idx] = { ...item, visible: checked }
                                                        setNavigationItems(updated)
                                                    }}
                                                />
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={idx === 0}
                                                    onClick={() => {
                                                        const updated = [...navigationItems]
                                                        const temp = updated[idx]
                                                        const prev = updated[idx - 1]
                                                        if (temp && prev) {
                                                            updated[idx] = prev
                                                            updated[idx - 1] = temp
                                                            setNavigationItems(updated)
                                                        }
                                                    }}
                                                    className="px-2"
                                                >
                                                    ↑
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={idx === navigationItems.length - 1}
                                                    onClick={() => {
                                                        const updated = [...navigationItems]
                                                        const temp = updated[idx]
                                                        const next = updated[idx + 1]
                                                        if (temp && next) {
                                                            updated[idx] = next
                                                            updated[idx + 1] = temp
                                                            setNavigationItems(updated)
                                                        }
                                                    }}
                                                    className="px-2"
                                                >
                                                    ↓
                                                </Button>
                                            </div>

                                            <Button
                                                type="button"
                                                variant="danger"
                                                size="sm"
                                                onClick={() => {
                                                    const updated = navigationItems.filter((_, i) => i !== idx)
                                                    setNavigationItems(updated)
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="pt-4 border-t border-dark-800 flex justify-between items-center">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => {
                                        setNavigationItems([...navigationItems, { label: 'New Link', path: '/new-link', visible: true }])
                                    }}
                                >
                                    + Add Custom Link
                                </Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-4">
                            <h3 className="text-h5 text-white flex items-center gap-2 mb-2">
                                <Shield size={18} className="text-orange-primary" /> System Security
                            </h3>
                            <Select
                                label="Activity Logs Retention Period"
                                value={auditLogRetention}
                                onChange={(e) => setAuditLogRetention(e.target.value)}
                                options={[
                                    { label: '30 Days', value: '30' },
                                    { label: '90 Days', value: '90' },
                                    { label: '1 Year', value: '365' },
                                    { label: 'Indefinite', value: '0' },
                                ]}
                            />
                            <div className="pt-2">
                                <Switch
                                    label="Require Multi-Factor Authentication (MFA)"
                                    description="Force all administrators to verify device at login"
                                    checked={requireMfa}
                                    onChange={(checked) => setRequireMfa(checked)}
                                />
                            </div>
                        </div>
                    )}

                    {/* Submit */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-dark-800">
                        <Button type="button" variant="outline" onClick={() => refetch()} className="cursor-pointer">
                            Reset
                        </Button>
                        <Button type="submit" variant="primary" isLoading={saveMutation.isPending} className="cursor-pointer">
                            Save Settings
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
