import { BaseService } from '@/services/baseService'
import { supabase } from '@/lib/supabase'
import { logActivity, LOG_ACTIONS, ENTITY_TYPES } from '@/services/activityLogService'
import type { AuditionCycle, AuditionCycleCreateInput, AuditionCycleUpdateInput, AuditionApplication, AuditionCycleWithStats } from '@/types'

class AuditionCycleService extends BaseService<AuditionCycle> {
    constructor() {
        super('audition_cycles')
    }

    /**
     * List audition cycles for admin with filters and stats.
     */
    async listAdmin(params?: {
        status?: string | string[]
        search?: string
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

        if (params?.search) {
            query = query.or(`title.ilike.%${params.search}%,position.ilike.%${params.search}%`) as never
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
        return { data: (data as AuditionCycle[]) ?? [], count, error: null }
    }

    /**
     * Get a single cycle with application statistics.
     */
    async getWithStats(id: string): Promise<{ data: AuditionCycleWithStats | null; error: string | null }> {
        const { data: cycle, error: cycleError } = await this.getById(id)
        if (cycleError || !cycle) return { data: null, error: cycleError }

        const { count: totalApps } = await supabase
            .from('audition_applications')
            .select('id', { count: 'exact', head: true })
            .eq('cycle_id', id)

        const { count: pendingCount } = await supabase
            .from('audition_applications')
            .select('id', { count: 'exact', head: true })
            .eq('cycle_id', id)
            .eq('status', 'pending')

        const { count: shortlistedCount } = await supabase
            .from('audition_applications')
            .select('id', { count: 'exact', head: true })
            .eq('cycle_id', id)
            .eq('status', 'shortlisted')

        const { count: rejectedCount } = await supabase
            .from('audition_applications')
            .select('id', { count: 'exact', head: true })
            .eq('cycle_id', id)
            .eq('status', 'rejected')

        const { count: selectedCount } = await supabase
            .from('audition_applications')
            .select('id', { count: 'exact', head: true })
            .eq('cycle_id', id)
            .eq('status', 'selected')

        return {
            data: {
                ...cycle,
                application_count: totalApps || 0,
                pending_count: pendingCount || 0,
                shortlisted_count: shortlistedCount || 0,
                rejected_count: rejectedCount || 0,
                selected_count: selectedCount || 0,
            },
            error: null,
        }
    }

    /**
     * Create with activity log.
     */
    async createWithLog(payload: AuditionCycleCreateInput, userId: string) {
        const insertPayload: Omit<AuditionCycle, 'id' | 'created_at' | 'updated_at'> = {
            ...payload,
            created_by: userId,
        }
        const result = await this.create(insertPayload)

        if (result.data && !result.error) {
            await logActivity({
                userId,
                action: LOG_ACTIONS.AUDITION_CREATE,
                entityType: ENTITY_TYPES.AUDITION,
                entityId: result.data.id,
                details: { title: payload.title, position: payload.position },
            })
        }

        return result
    }

    /**
     * Update with activity log.
     */
    async updateWithLog(id: string, payload: AuditionCycleUpdateInput, userId: string) {
        const result = await this.update(id, payload)

        if (!result.error) {
            await logActivity({
                userId,
                action: LOG_ACTIONS.AUDITION_UPDATE,
                entityType: ENTITY_TYPES.AUDITION,
                entityId: id,
                details: payload,
            })
        }

        return result
    }

    /**
     * Delete with activity log.
     */
    async deleteWithLog(id: string, userId: string) {
        const result = await this.delete(id)

        if (!result.error) {
            await logActivity({
                userId,
                action: LOG_ACTIONS.AUDITION_DELETE,
                entityType: ENTITY_TYPES.AUDITION,
                entityId: id,
            })
        }

        return result
    }
}

class AuditionApplicationService extends BaseService<AuditionApplication> {
    constructor() {
        super('audition_applications')
    }

    /**
     * List applications for a specific cycle.
     */
    async listByCycle(cycleId: string, params?: {
        status?: string | string[]
        search?: string
        sortBy?: string
        sortDir?: string
    }) {
        let query = this.query
            .select('*')
            .eq('cycle_id', cycleId)

        if (params?.status) {
            const statuses = Array.isArray(params.status) ? params.status : [params.status]
            query = query.in('status', statuses) as never
        }

        if (params?.search) {
            query = query.or(`name.ilike.%${params.search}%,email.ilike.%${params.search}%,college.ilike.%${params.search}%`) as never
        }

        const sortBy = params?.sortBy || 'created_at'
        const sortDir = params?.sortDir || 'desc'
        query = query.order(sortBy, { ascending: sortDir === 'asc' }) as never

        const { data, error } = await query
        if (error) return { data: [], error: error.message }
        return { data: (data as AuditionApplication[]) ?? [], error: null }
    }

    /**
     * Review an application — update status and reviewer info.
     */
    async review(id: string, status: string, notes: string, reviewerId: string) {
        const { data, error } = await supabase
            .from('audition_applications')
            .update({
                status,
                notes,
                reviewed_by: reviewerId,
                reviewed_at: new Date().toISOString(),
            })
            .eq('id', id)
            .select()
            .single()

        if (error) return { data: null, error: error.message }

        await logActivity({
            userId: reviewerId,
            action: LOG_ACTIONS.AUDITION_REVIEW,
            entityType: ENTITY_TYPES.AUDITION_APPLICATION,
            entityId: id,
            details: { status, notes },
        })

        return { data: data as AuditionApplication, error: null }
    }

    /**
     * Bulk update application statuses.
     */
    async bulkReview(ids: string[], status: string, reviewerId: string) {
        const { error } = await supabase
            .from('audition_applications')
            .update({
                status,
                reviewed_by: reviewerId,
                reviewed_at: new Date().toISOString(),
            })
            .in('id', ids)

        if (error) return { error: error.message }

        await logActivity({
            userId: reviewerId,
            action: LOG_ACTIONS.AUDITION_REVIEW,
            entityType: ENTITY_TYPES.AUDITION_APPLICATION,
            details: { status, count: ids.length },
        })

        return { error: null }
    }
}

export const auditionCycleService = new AuditionCycleService()
export const auditionApplicationService = new AuditionApplicationService()
