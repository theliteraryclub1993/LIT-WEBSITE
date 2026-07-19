import { BaseService } from '@/services/baseService'
import { supabase } from '@/lib/supabase'
import { logActivity, LOG_ACTIONS, ENTITY_TYPES } from '@/services/activityLogService'
import type { Post, PostCreateInput, PostUpdateInput } from '@/types'

class BlogService extends BaseService<Post> {
    constructor() {
        super('posts')
    }

    /**
     * Calculate read time from HTML content.
     * Strips HTML tags and counts words at 200 wpm.
     */
    private computeReadTime(html: string | null): number | null {
        if (!html) return null
        const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
        if (!text) return null
        const words = text.split(/\s+/).filter(Boolean)
        return Math.max(1, Math.ceil(words.length / 200))
    }

    /**
     * List posts for admin with filters and sorting.
     */
    async listAdmin(params?: {
        status?: string | string[]
        category?: string
        search?: string
        is_featured?: boolean
        author_id?: string
        sortBy?: string
        sortDir?: string
        page?: number
        pageSize?: number
    }) {
        let query = this.query.select('*', { count: 'exact' })

        if (params?.status) {
            const statuses = Array.isArray(params.status) ? params.status : [params.status]
            query = query.in('status', statuses) as never
        }

        if (params?.category) {
            query = query.eq('category', params.category) as never
        }

        if (params?.is_featured !== undefined) {
            query = query.eq('is_featured', params.is_featured) as never
        }

        if (params?.author_id) {
            query = query.eq('author_id', params.author_id) as never
        }

        if (params?.search) {
            query = query.or(`title.ilike.%${params.search}%,excerpt.ilike.%${params.search}%,author_name.ilike.%${params.search}%`) as never
        }

        const sortBy = params?.sortBy || 'created_at'
        const sortDir = params?.sortDir || 'desc'
        query = query.order(sortBy, { ascending: sortDir === 'asc' }) as never

        if (params?.page && params?.pageSize) {
            const from = (params.page - 1) * params.pageSize
            const to = from + params.pageSize - 1
            query = query.range(from, to) as never
        }

        const { data, count, error } = await query
        if (error) return { data: [], count: null, error: error.message }
        return { data: (data as Post[]) ?? [], count, error: null }
    }

    /**
     * Fetch categories with post counts.
     */
    async getCategories(): Promise<Array<{ name: string; count: number }>> {
        const { data, error } = await supabase
            .from('posts')
            .select('category')
            .eq('status', 'published')
            .not('category', 'is', null)

        if (error) throw error

        const map = new Map<string, number>()
            ; (data ?? []).forEach(p => {
                if (p.category) {
                    map.set(p.category, (map.get(p.category) || 0) + 1)
                }
            })

        return Array.from(map.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
    }

    /**
     * Fetch tags with post counts.
     */
    async getTags(): Promise<Array<{ name: string; count: number }>> {
        const { data, error } = await supabase
            .from('posts')
            .select('tags')
            .eq('status', 'published')
            .not('tags', 'is', null)

        if (error) throw error

        const map = new Map<string, number>()
            ; (data ?? []).forEach(p => {
                ; (p.tags ?? []).forEach((tag: string) => {
                    map.set(tag, (map.get(tag) || 0) + 1)
                })
            })

        return Array.from(map.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
    }

    /**
     * Create post with auto-computed fields and activity log.
     */
    async createWithLog(payload: PostCreateInput, authorId: string, authorName: string) {
        const readTime = this.computeReadTime(payload.content || null)

        const result = await this.create({
            ...payload,
            author_id: authorId,
            author_name: authorName,
            read_time_minutes: readTime,
            published_at: payload.status === 'published' ? new Date().toISOString() : null,
        } as Omit<Post, 'id' | 'created_at' | 'updated_at'>)

        if (result.data && !result.error) {
            await logActivity({
                userId: authorId,
                action: LOG_ACTIONS.POST_CREATE,
                entityType: ENTITY_TYPES.POST,
                entityId: result.data.id,
                details: { title: payload.title, category: payload.category },
            })
        }

        return result
    }

    /**
     * Update post with re-computed read time and activity log.
     */
    async updateWithLog(id: string, payload: PostUpdateInput, userId: string) {
        // If content changed, re-compute read time
        let updates = { ...payload }

        if (payload.content !== undefined) {
            updates.read_time_minutes = this.computeReadTime(payload.content)
        }

        // If publishing, set published_at
        if (payload.status === 'published' && !payload.published_at) {
            updates.published_at = new Date().toISOString()
        }

        const result = await this.update(id, updates)

        if (!result.error) {
            const action = payload.status === 'published' ? LOG_ACTIONS.POST_PUBLISH : LOG_ACTIONS.POST_UPDATE
            await logActivity({
                userId,
                action,
                entityType: ENTITY_TYPES.POST,
                entityId: id,
                details: { title: (result.data as Post)?.title },
            })
        }

        return result
    }

    /**
     * Delete post with activity log.
     */
    async deleteWithLog(id: string, userId: string): Promise<{ error: string | null }> {
        // Fetch title for the log before deleting
        const { data: post } = await this.getById(id)

        const result = await this.delete(id)

        if (!result.error && post) {
            // Try to delete cover image from storage
            if (post.cover_image) {
                try {
                    const url = new URL(post.cover_image)
                    const pathParts = url.pathname.split('/storage/v1/object/')
                    if (pathParts.length > 1) {
                        const fullPath = decodeURIComponent(pathParts[1]!)
                        const [bucket, ...filePathParts] = fullPath.split('/')
                        const { deleteFile } = await import('@/lib/supabase')
                        if (bucket) {
                            await deleteFile(bucket, [filePathParts.filter(Boolean).join('/')])
                        }
                    }
                } catch {
                    // Silent fail — storage cleanup is non-critical
                }
            }

            await logActivity({
                userId,
                action: LOG_ACTIONS.POST_DELETE,
                entityType: ENTITY_TYPES.POST,
                entityId: id,
                details: { title: post.title },
            })
        }

        return result
    }

    /**
     * Generate a URL slug from a title.
     */
    async generateSlug(title: string, currentId?: string): Promise<string> {
        const slug = title
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 60)
            .trim()

        // Ensure uniqueness
        let finalSlug = slug
        let counter = 1

        while (true) {
            const testSlug = counter === 1 ? slug : `${slug}-${counter}`

            const { count } = await supabase
                .from('posts')
                .select('id', { count: 'exact', head: true })
                .eq('slug', testSlug)
                .neq('id', currentId || '00000000-0000-0000-0000-000000000000')

            if ((count ?? 0) === 0) {
                finalSlug = testSlug
                break
            }

            counter++
        }

        return finalSlug
    }
}

export const blogService = new BlogService()