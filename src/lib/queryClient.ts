import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,        // 5 minutes
      gcTime: 1000 * 60 * 30,           // 30 minutes (previously cacheTime)
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
    mutations: {
      retry: 0,
    },
  },
})

/**
 * Query key factory for consistent key management.
 * Usage: queryKeyFactory.events.list(), queryKeyFactory.events.detail(id)
 */
export const queryKeyFactory = {
  // Auth
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeyFactory.auth.all, 'session'] as const,
    user: () => [...queryKeyFactory.auth.all, 'user'] as const,
    profile: (userId: string) => [...queryKeyFactory.auth.all, 'profile', userId] as const,
  },

  // Events
  events: {
    all: ['events'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeyFactory.events.all, 'list', params] as const,
    detail: (id: string) => [...queryKeyFactory.events.all, 'detail', id] as const,
    participants: (eventId: string) => [...queryKeyFactory.events.all, 'participants', eventId] as const,
    attendance: (eventId: string) => [...queryKeyFactory.events.all, 'attendance', eventId] as const,
    stats: () => [...queryKeyFactory.events.all, 'stats'] as const,
  },

  // Participants
  participants: {
    all: ['participants'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeyFactory.participants.all, 'list', params] as const,
    detail: (id: string) => [...queryKeyFactory.participants.all, 'detail', id] as const,
    byEvent: (eventId: string) => [...queryKeyFactory.participants.all, 'by-event', eventId] as const,
  },

  // Auditions
  auditions: {
    all: ['auditions'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeyFactory.auditions.all, 'list', params] as const,
    detail: (id: string) => [...queryKeyFactory.auditions.all, 'detail', id] as const,
    cycles: () => [...queryKeyFactory.auditions.all, 'cycles'] as const,
    applications: (cycleId: string) => [...queryKeyFactory.auditions.all, 'applications', cycleId] as const,
  },

  // Team
  team: {
    all: ['team'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeyFactory.team.all, 'list', params] as const,
    detail: (id: string) => [...queryKeyFactory.team.all, 'detail', id] as const,
    public: () => [...queryKeyFactory.team.all, 'public'] as const,
  },

  // Posts / Blog
  posts: {
    all: ['posts'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeyFactory.posts.all, 'list', params] as const,
    detail: (slug: string) => [...queryKeyFactory.posts.all, 'detail', slug] as const,
    published: (params?: Record<string, unknown>) => [...queryKeyFactory.posts.all, 'published', params] as const,
  },

  // Gallery
  gallery: {
    all: ['gallery'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeyFactory.gallery.all, 'list', params] as const,
    albums: () => [...queryKeyFactory.gallery.all, 'albums'] as const,
    byCategory: (category: string) => [...queryKeyFactory.gallery.all, 'category', category] as const,
  },

  // Attendance
  attendance: {
    all: ['attendance'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeyFactory.attendance.all, 'list', params] as const,
    byEvent: (eventId: string) => [...queryKeyFactory.attendance.all, 'event', eventId] as const,
    stats: () => [...queryKeyFactory.attendance.all, 'stats'] as const,
  },

  // Certificates
  certificates: {
    all: ['certificates'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeyFactory.certificates.all, 'list', params] as const,
    detail: (id: string) => [...queryKeyFactory.certificates.all, 'detail', id] as const,
    byEvent: (eventId: string) => [...queryKeyFactory.certificates.all, 'event', eventId] as const,
  },

  // Analytics
  analytics: {
    all: ['analytics'] as const,
    overview: () => [...queryKeyFactory.analytics.all, 'overview'] as const,
    events: () => [...queryKeyFactory.analytics.all, 'events'] as const,
    members: () => [...queryKeyFactory.analytics.all, 'members'] as const,
    growth: () => [...queryKeyFactory.analytics.all, 'growth'] as const,
  },

  // Settings
  settings: {
    all: ['settings'] as const,
    general: () => [...queryKeyFactory.settings.all, 'general'] as const,
    social: () => [...queryKeyFactory.settings.all, 'social'] as const,
  },

  // Activity Logs
  logs: {
    all: ['logs'] as const,
    list: (params?: Record<string, unknown>) => [...queryKeyFactory.logs.all, 'list', params] as const,
  },
} as const