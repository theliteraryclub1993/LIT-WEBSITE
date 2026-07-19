import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { GalleryImageListItem } from '@/types'

/**
 * Fetch gallery images for public display.
 */
export function usePublicGallery(params?: { album?: string; category?: string; limit?: number }) {
    return useQuery({
        queryKey: ['gallery', 'public', params],
        queryFn: async () => {
            let query = supabase
                .from('gallery_images')
                .select('id, url, thumbnail_url, caption, album, category, width, height')
                .order('order_index', { ascending: true })
                .order('created_at', { ascending: false })

            if (params?.album) {
                query = query.eq('album', params.album)
            }

            if (params?.category) {
                query = query.eq('category', params.category)
            }

            if (params?.limit) {
                query = query.limit(params.limit)
            }

            const { data, error } = await query

            if (error) throw error

            return (data ?? []).map((img) => ({
                ...img,
                aspect_ratio: img.width && img.height ? img.width / img.height : 16 / 9,
            })) as GalleryImageListItem[]
        },
        staleTime: 1000 * 60 * 5,
    })
}

/**
 * Fetch distinct albums for filter dropdown.
 */
export function useGalleryAlbums() {
    return useQuery({
        queryKey: ['gallery', 'albums'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('gallery_images')
                .select('album')
                .not('album', 'is', null)
                .order('album')

            if (error) throw error

            const albumSet = new Set(data?.map((d) => d.album).filter(Boolean))
            return Array.from(albumSet) as string[]
        },
        staleTime: 1000 * 60 * 10,
    })
}