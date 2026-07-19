import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeyFactory } from '@/lib/queryClient'
import type { Event, EventListItem } from '@/types'

/**
 * Fetch all published events for public display.
 */
export function usePublicEvents() {
    return useQuery({
        queryKey: queryKeyFactory.events.list({ status: 'published' }),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('events')
                .select('id, title, slug, short_description, cover_image, venue, date, time, status, is_featured, max_participants, registration_fee, published_at')
                .eq('status', 'published')
                .order('date', { ascending: false })

            if (error) throw error
            return (data ?? []) as EventListItem[]
        },
        staleTime: 1000 * 60 * 5,
    })
}

/**
 * Fetch a single event by slug for the public detail page.
 */
export function usePublicEvent(slug: string) {
    return useQuery({
        queryKey: queryKeyFactory.events.detail(slug),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('events')
                .select('*')
                .eq('slug', slug)
                .eq('status', 'published')
                .single()

            if (error) throw error
            return data as Event
        },
        enabled: !!slug,
        staleTime: 1000 * 60 * 5,
    })
}

/**
 * Fetch featured events for homepage.
 */
export function useFeaturedEvents(limit = 3) {
    return useQuery({
        queryKey: ['events', 'featured', limit],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('events')
                .select('id, title, slug, short_description, cover_image, venue, date, time, status, is_featured, max_participants, registration_fee, published_at')
                .eq('status', 'published')
                .eq('is_featured', true)
                .order('date', { ascending: true })
                .limit(limit)

            if (error) throw error
            return (data ?? []) as EventListItem[]
        },
        staleTime: 1000 * 60 * 5,
    })
}