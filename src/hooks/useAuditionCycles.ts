import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { AuditionCycleListItem } from '@/types'

/**
 * Fetch open audition cycles for public display.
 */
export function usePublicAuditions() {
    return useQuery({
        queryKey: ['auditions', 'public'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('audition_cycles')
                .select('id, title, position, status, open_date, close_date, max_applicants, description, requirements')
                .order('close_date', { ascending: true })

            if (error) throw error

            return (data ?? []) as Array<AuditionCycleListItem & { description: string | null; requirements: string | null }>
        },
        staleTime: 0,
    })
}