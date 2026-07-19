import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { queryKeyFactory } from '@/lib/queryClient'
import type { PostListItem, Post } from '@/types'

/**
 * Fetch published posts for public blog page.
 */
export function usePublicPosts(params?: { category?: string; tag?: string; limit?: number }) {
    return useQuery({
        queryKey: queryKeyFactory.posts.published(params),
        queryFn: async () => {
            let query = supabase
                .from('posts')
                .select('id, title, slug, excerpt, cover_image, author_name, status, category, tags, read_time_minutes, is_featured, published_at')
                .eq('status', 'published')
                .order('published_at', { ascending: false })

            if (params?.category) {
                query = query.eq('category', params.category)
            }

            if (params?.tag) {
                query = query.contains('tags', [params.tag])
            }

            if (params?.limit) {
                query = query.limit(params.limit)
            }

            const { data, error } = await query

            if (error) throw error
            return (data ?? []) as PostListItem[]
        },
        staleTime: 1000 * 60 * 5,
    })
}

/**
 * Fetch a single post by slug for the public detail page.
 */
export function usePublicPost(slug: string) {
    return useQuery({
        queryKey: queryKeyFactory.posts.detail(slug),
        queryFn: async () => {
            const { data, error } = await supabase
                .from('posts')
                .select('*')
                .eq('slug', slug)
                .eq('status', 'published')
                .single()

            if (error) throw error
            return data as Post
        },
        enabled: !!slug,
        staleTime: 1000 * 60 * 5,
    })
}

/**
 * Fetch recent posts for homepage.
 */
export function useRecentPosts(limit = 3) {
    return usePublicPosts({ limit })
}