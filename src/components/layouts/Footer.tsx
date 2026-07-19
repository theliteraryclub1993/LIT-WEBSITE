import { useEffect, useState } from 'react'
import { getSettingsByCategory } from '@/services/settingsService'
import { brand } from '@/config/brandConfig'
import { BrandIcons } from '@/components/ui'

/**
 * Minimized editorial footer showing only copyright, socials, and founded year.
 */
export function Footer() {
    const [instagramUrl, setInstagramUrl] = useState<string>('https://linktr.ee/lit1993?utm_source=qr_code')
    const [youtubeUrl, setYoutubeUrl] = useState<string>('https://www.youtube.com/@theliteraryclub1971')

    useEffect(() => {
        // Load social links from settings
        getSettingsByCategory('social')
            .then(data => {
                if (data?.instagram) setInstagramUrl(String(data.instagram))
                if (data?.youtube) setYoutubeUrl(String(data.youtube))
            })
            .catch(err => {
                console.error('Failed to load social settings for footer:', err)
            })
    }, [])

    return (
        <footer className="bg-dark border-t border-dark-700 relative overflow-hidden">
            {/* Subtle top gradient line */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-primary/40 to-transparent" />

            <div className="container-editorial py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-caption text-dark-500">
                    {brand.footer.copyright}
                </p>

                <div className="flex items-center gap-6">
                    <a
                        key="instagram"
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dark-500 hover:text-orange-primary transition-colors duration-200"
                        aria-label="Instagram"
                    >
                        <BrandIcons.Instagram size={20} />
                    </a>
                    <a
                        key="youtube"
                        href={youtubeUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-dark-500 hover:text-orange-primary transition-colors duration-200"
                        aria-label="YouTube"
                    >
                        <BrandIcons.Youtube size={20} />
                    </a>
                    <span className="text-overline text-dark-600">
                        Est. {brand.founded}
                    </span>
                </div>
            </div>
        </footer>
    )
}