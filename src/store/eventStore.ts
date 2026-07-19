import { create } from 'zustand'
import type { EventFilters } from '@/types'

type EventViewMode = 'grid' | 'list'
type AdminEventTab = 'all' | 'published' | 'draft' | 'ongoing' | 'completed' | 'cancelled'

interface EventState {
    // Public event page state
    publicFilters: EventFilters
    publicViewMode: EventViewMode
    publicSearch: string
    publicCurrentPage: number

    // Admin event management state
    adminTab: AdminEventTab
    adminSearch: string
    adminSortBy: 'date' | 'created_at' | 'title' | 'participant_count'
    adminSortDir: 'asc' | 'desc'
    adminPageSize: number
    adminCurrentPage: number

    // Selected event for detail/edit views
    selectedEventId: string | null
    selectedEventSlug: string | null

    // Actions — Public
    setPublicFilters: (filters: Partial<EventFilters>) => void
    resetPublicFilters: () => void
    setPublicViewMode: (mode: EventViewMode) => void
    setPublicSearch: (search: string) => void
    setPublicCurrentPage: (page: number) => void

    // Actions — Admin
    setAdminTab: (tab: AdminEventTab) => void
    setAdminSearch: (search: string) => void
    setAdminSort: (sortBy: EventState['adminSortBy'], sortDir: EventState['adminSortDir']) => void
    setAdminPageSize: (size: number) => void
    setAdminCurrentPage: (page: number) => void

    // Actions — Selection
    selectEventById: (id: string | null) => void
    selectEventBySlug: (slug: string | null) => void
    clearSelection: () => void

    // Bulk — Reset all
    resetAll: () => void
}

const initialPublicFilters: EventFilters = {
    status: undefined,
    search: undefined,
    is_featured: undefined,
    date_from: undefined,
    date_to: undefined,
    has_fee: undefined,
}

/**
 * Event-specific global state.
 * Manages filters, view modes, pagination, and selection for both public and admin event views.
 * Does NOT store event data itself — that belongs in React Query cache.
 */
export const useEventStore = create<EventState>((set) => ({
    // Public defaults
    publicFilters: { ...initialPublicFilters },
    publicViewMode: 'grid',
    publicSearch: '',
    publicCurrentPage: 1,

    // Admin defaults
    adminTab: 'all',
    adminSearch: '',
    adminSortBy: 'date',
    adminSortDir: 'desc',
    adminPageSize: 25,
    adminCurrentPage: 1,

    // Selection defaults
    selectedEventId: null,
    selectedEventSlug: null,

    // Public actions
    setPublicFilters: (filters) =>
        set((state) => ({
            publicFilters: { ...state.publicFilters, ...filters },
            publicCurrentPage: 1, // Reset page on filter change
        })),

    resetPublicFilters: () =>
        set({
            publicFilters: { ...initialPublicFilters },
            publicSearch: '',
            publicCurrentPage: 1,
        }),

    setPublicViewMode: (mode) => set({ publicViewMode: mode }),

    setPublicSearch: (search) =>
        set({
            publicSearch: search,
            publicFilters: { ...initialPublicFilters, search: search || undefined },
            publicCurrentPage: 1,
        }),

    setPublicCurrentPage: (page) => set({ publicCurrentPage: page }),

    // Admin actions
    setAdminTab: (tab) => {
        set({
            adminTab: tab,
            adminCurrentPage: 1,
        })
    },

    setAdminSearch: (search) =>
        set({ adminSearch: search, adminCurrentPage: 1 }),

    setAdminSort: (sortBy, sortDir) =>
        set({ adminSortBy: sortBy, adminSortDir: sortDir }),

    setAdminPageSize: (size) =>
        set({ adminPageSize: size, adminCurrentPage: 1 }),

    setAdminCurrentPage: (page) =>
        set({ adminCurrentPage: page }),

    // Selection actions
    selectEventById: (id) =>
        set({ selectedEventId: id, selectedEventSlug: null }),

    selectEventBySlug: (slug) =>
        set({ selectedEventSlug: slug, selectedEventId: null }),

    clearSelection: () =>
        set({ selectedEventId: null, selectedEventSlug: null }),

    // Reset everything
    resetAll: () =>
        set({
            publicFilters: { ...initialPublicFilters },
            publicViewMode: 'grid',
            publicSearch: '',
            publicCurrentPage: 1,
            adminTab: 'all',
            adminSearch: '',
            adminSortBy: 'date',
            adminSortDir: 'desc',
            adminPageSize: 25,
            adminCurrentPage: 1,
            selectedEventId: null,
            selectedEventSlug: null,
        }),
}))