export const brand = {
    name: 'The Literary Club',
    tagline: 'Where Words Come Alive',
    description:
        'The Literary Club (LIT) was established in 1993 and is one of the oldest and most pivotal clubs at Malnad College of Engineering. Comprising students from all years, the club focuses on celebrating the interests and creative talents of each and every person.',
    founded: '1993',
    location: 'India',

    contact: {
        email: 'contact@literaryclub.in',
        youtube: 'https://www.youtube.com/@theliteraryclub1971',
    },

    social: [
        { name: 'Instagram', url: 'https://linktr.ee/lit1993?utm_source=qr_code', icon: 'instagram' as const },
        { name: 'YouTube', url: 'https://www.youtube.com/@theliteraryclub1971', icon: 'youtube' as const },
    ],

    colors: {
        black: '#000000',
        dark: '#0a0a0a',
        dark900: '#111111',
        dark800: '#1a1a1a',
        dark700: '#222222',
        dark600: '#333333',
        dark500: '#444444',
        dark400: '#666666',
        dark300: '#888888',
        dark200: '#aaaaaa',
        dark100: '#cccccc',
        orange: '#FF6B00',
        orangeLight: '#FF8C33',
        orangeDark: '#CC5500',
        silver: '#C0C0C0',
        silverLight: '#D4D4D4',
        silverDark: '#969696',
    },

    fonts: {
        heading: "'Bebas Neue', 'Anton', 'Oswald', sans-serif",
        subheading: "'Oswald', 'Bebas Neue', sans-serif",
        body: "'Inter', system-ui, -apple-system, sans-serif",
        mono: "'JetBrains Mono', 'Fira Code', monospace",
    },

    stats: [
        { label: 'Years Active', value: '34+' },
        { label: 'Events Hosted', value: '40+' },
        { label: 'Members', value: '40+' },
        { label: 'Stories Told', value: '∞' },
    ],

    navigation: {
        public: [
            { label: 'Home', path: '/' },
            { label: 'About', path: '/about' },
            { label: 'Events', path: '/events' },
            { label: 'Team', path: '/team' },
            { label: 'Gallery', path: '/gallery' },
            { label: 'Auditions', path: '/auditions' },
        ],
        admin: [
            { label: 'Dashboard', path: '/admin', icon: 'layoutDashboard' as const },
            { label: 'Events', path: '/admin/events', icon: 'calendar' as const },
            { label: 'Malnad Fest', path: '/admin/malnad-fest', icon: 'award' as const },
            { label: 'Noesis', path: '/admin/noesis', icon: 'bookOpen' as const },
            { label: 'Spark', path: '/admin/spark', icon: 'mic' as const },

            { label: 'Auditions', path: '/admin/auditions', icon: 'mic' as const },
            { label: 'Team', path: '/admin/team', icon: 'userCog' as const },
            { label: 'Gallery', path: '/admin/gallery', icon: 'image' as const },
            { label: 'Media Library', path: '/admin/media', icon: 'image' as const },
            { label: 'Attendance', path: '/admin/attendance', icon: 'scanLine' as const },
            { label: 'Certificates', path: '/admin/certificates', icon: 'award' as const },
            { label: 'Analytics', path: '/admin/analytics', icon: 'barChart3' as const },
            { label: 'Settings', path: '/admin/settings', icon: 'settings' as const },
        ],
    },

    footer: {
        tagline: 'Crafting literary experiences since 1993.',
        copyright: `© ${new Date().getFullYear()} The Literary Club. All rights reserved.`,
        sections: [
            {
                title: 'Explore',
                links: [
                    { label: 'Events', path: '/events' },
                    { label: 'Gallery', path: '/gallery' },
                    { label: 'Team', path: '/team' },
                ],
            },
            {
                title: 'Join',
                links: [
                    { label: 'Auditions', path: '/auditions' },
                    { label: 'Volunteer', path: '/volunteer' },
                    { label: 'Collaborate', path: '/collaborate' },
                ],
            },
            {
                title: 'Legal',
                links: [
                    { label: 'Privacy Policy', path: '/privacy' },
                    { label: 'Terms of Use', path: '/terms' },
                    { label: 'Code of Conduct', path: '/conduct' },
                ],
            },
        ],
    },
} as const

export type BrandConfig = typeof brand