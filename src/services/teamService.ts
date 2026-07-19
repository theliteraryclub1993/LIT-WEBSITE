import { BaseService } from '@/services/baseService'
import { supabase } from '@/lib/supabase'
import { logActivity, LOG_ACTIONS, ENTITY_TYPES } from '@/services/activityLogService'
import { deleteFile } from '@/lib/supabase'
import type { TeamMember, TeamMemberCreateInput, TeamMemberUpdateInput, TeamMemberPublic, DepartmentGroup } from '@/types'

class TeamService extends BaseService<TeamMember> {
    constructor() {
        super('team_members')
    }

    /**
     * Fetch all team members for admin with filtering.
     */
    async listAdmin(params?: {
        department?: string
        is_active?: boolean
        search?: string
        sortBy?: string
        sortDir?: string
        page?: number
        pageSize?: number
    }) {
        let query = this.query.select('*', { count: 'exact' })

        if (params?.department) {
            query = query.eq('department', params.department) as never
        }

        if (params?.is_active !== undefined) {
            query = query.eq('is_active', params.is_active) as never
        }

        if (params?.search) {
            query = query.or(`name.ilike.%${params.search}%,role.ilike.%${params.search}%,department.ilike.%${params.search}%`) as never
        }

        const sortBy = params?.sortBy || 'order_index'
        const sortDir = params?.sortDir || 'asc'
        query = query.order(sortBy, { ascending: sortDir === 'asc' }) as never

        if (params?.page && params?.pageSize) {
            const from = (params.page - 1) * params.pageSize
            const to = from + params.pageSize - 1
            query = query.range(from, to) as never
        }

        const { data, count, error } = await query
        if (error) return { data: [], count: null, error: error.message }
        return { data: (data as TeamMember[]) ?? [], count, error: null }
    }

    /**
     * Fetch public team members grouped by department.
     */
    async listPublicGrouped(): Promise<DepartmentGroup[]> {
        const { data, error } = await supabase
            .from('team_members')
            .select('id, name, role, department, avatar_url, bio, social_links')
            .eq('is_active', true)
            .order('order_index', { ascending: true })

        if (error) throw error

        const map = new Map<string, TeamMemberPublic[]>()
            ; (data ?? []).forEach((m) => {
                const dept = m.department || 'General'
                if (!map.has(dept)) map.set(dept, [])
                map.get(dept)!.push(m as TeamMemberPublic)
            })

        return Array.from(map.entries()).map(([department, members]) => ({
            department,
            members,
        }))
    }

    /**
     * Fetch distinct departments.
     */
    async getDepartments(): Promise<string[]> {
        const { data, error } = await supabase
            .from('team_members')
            .select('department')
            .not('department', 'is', null)
            .order('department')

        if (error) throw error
        const set = new Set(data?.map(d => d.department).filter(Boolean))
        return Array.from(set) as string[]
    }

    /**
     * Create with activity log.
     */
    async createWithLog(payload: TeamMemberCreateInput, userId: string) {
        const result = await this.create(payload as Omit<TeamMember, 'id' | 'created_at' | 'updated_at'>)

        if (result.data && !result.error) {
            await logActivity({
                userId,
                action: LOG_ACTIONS.TEAM_CREATE,
                entityType: ENTITY_TYPES.TEAM_MEMBER,
                entityId: result.data.id,
                details: { name: payload.name, role: payload.role },
            })
        }

        return result
    }

    /**
     * Update with activity log.
     */
    async updateWithLog(id: string, payload: TeamMemberUpdateInput, userId: string) {
        const result = await this.update(id, payload)

        if (!result.error) {
            await logActivity({
                userId,
                action: LOG_ACTIONS.TEAM_UPDATE,
                entityType: ENTITY_TYPES.TEAM_MEMBER,
                entityId: id,
                details: payload,
            })
        }

        return result
    }

    /**
     * Delete member, remove avatar from storage, and log.
     */
    async deleteWithLog(id: string, userId: string): Promise<{ error: string | null }> {
        // Fetch the member to get avatar URL for cleanup
        const { data: member } = await this.getById(id)

        const result = await this.delete(id)

        if (!result.error && member?.avatar_url) {
            // Try to extract the path from the public URL and delete from storage
            try {
                const url = new URL(member.avatar_url)
                const pathParts = url.pathname.split('/storage/v1/object/')
                if (pathParts.length > 1) {
                    const fullPath = decodeURIComponent(pathParts[1]!)
                    const [bucket, ...filePathParts] = fullPath.split('/')
                    if (bucket) {
                        await deleteFile(bucket, [filePathParts.filter(Boolean).join('/')])
                    }
                }
            } catch {
                // Silent fail — storage cleanup is non-critical
            }

            await logActivity({
                userId,
                action: LOG_ACTIONS.TEAM_DELETE,
                entityType: ENTITY_TYPES.TEAM_MEMBER,
                entityId: id,
                details: { name: member.name },
            })
        }

        return result
    }

    /**
     * Reorder members — accepts array of { id, order_index }.
     */
    async reorder(items: Array<{ id: string; order_index: number }>): Promise<{ error: string | null }> {
        // Use a transaction-like approach with Promise.all
        const updates = items.map(item =>
            supabase
                .from('team_members')
                .update({ order_index: item.order_index })
                .eq('id', item.id)
        )

        const results = await Promise.all(updates)
        const firstError = results.find(r => r.error)

        if (firstError && firstError.error) {
            return { error: firstError.error.message }
        }

        return { error: null }
    }
}

export const teamService = new TeamService()