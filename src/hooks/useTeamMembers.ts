import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeyFactory } from '@/lib/queryClient'
import type { TeamMemberPublic } from '@/types'

/**
 * Fetch active team members for public display, ordered by department and index.
 */
export function usePublicTeamMembers() {
    return useQuery({
        queryKey: queryKeyFactory.team.public(),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('team_members')
                .select('id, name, role, department, avatar_url, bio, social_links')
                .eq('is_active', true)
                .order('order_index', { ascending: true })

            if (error) throw error
            return (data ?? []) as TeamMemberPublic[]
        },
        staleTime: 1000 * 60 * 10,
    })
}