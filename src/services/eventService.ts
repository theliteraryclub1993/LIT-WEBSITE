import { BaseService } from '@/services/baseService'
import { supabase } from '@/lib/supabase'
import { logActivity, LOG_ACTIONS, ENTITY_TYPES } from '@/services/activityLogService'
import type { Event, EventCreateInput, EventUpdateInput, EventDetail } from '@/types'

class EventService extends BaseService<Event> {
    constructor() {
        super('events')
    }

    /**
     * Fetch public-facing event list items with filtering and sorting.
     */
    async listAdmin(params?: {
        status?: string | string[]
        search?: string
        is_featured?: boolean
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

        if (params?.is_featured !== undefined) {
            query = query.eq('is_featured', params.is_featured) as never
        }

        if (params?.search) {
            query = query.or(`title.ilike.%${params.search}%,venue.ilike.%${params.search}%`) as never
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
        return { data: (data as Event[]) ?? [], count, error: null }
    }

    /**
     * Fetch a single event by ID with full details.
     */
    async getDetail(id: string): Promise<{ data: EventDetail | null; error: string | null }> {
        // Fetch event
        const { data: event, error: eventError } = await this.getById(id)
        if (eventError || !event) return { data: null, error: eventError }

        // Fetch participant stats
        const { count: participantCount } = await supabase
            .from('participants')
            .select('id', { count: 'exact', head: true })
            .eq('event_id', id)

        const { count: attendedCount } = await supabase
            .from('participants')
            .select('id', { count: 'exact', head: true })
            .eq('event_id', id)
            .eq('attended', true)

        const { count: certifiedCount } = await supabase
            .from('participants')
            .select('id', { count: 'exact', head: true })
            .eq('event_id', id)
            .not('certificate_id', 'is', null)

        const fillPercentage = event.max_participants
            ? Math.round(((participantCount || 0) / event.max_participants) * 1000) / 10
            : null

        return {
            data: {
                ...event,
                participant_count: participantCount || 0,
                attended_count: attendedCount || 0,
                certified_count: certifiedCount || 0,
                fill_percentage: fillPercentage,
            },
            error: null,
        }
    }

    /**
     * Create a new event and log the action.
     */
    async createWithLog(payload: EventCreateInput, userId: string) {
        const insertPayload: Omit<Event, 'id' | 'created_at' | 'updated_at'> = {
            ...payload,
            created_by: userId,
            published_at: null,
        }
        const result = await this.create(insertPayload)

        if (result.data && !result.error) {
            await logActivity({
                userId,
                action: LOG_ACTIONS.EVENT_CREATE,
                entityType: ENTITY_TYPES.EVENT,
                entityId: result.data.id,
                details: { title: payload.title },
            })
        }

        return result
    }

    /**
     * Update an event and log the action.
     */
    async updateWithLog(id: string, payload: EventUpdateInput, userId: string) {
        const result = await this.update(id, payload)

        if (!result.error) {
            await logActivity({
                userId,
                action: LOG_ACTIONS.EVENT_UPDATE,
                entityType: ENTITY_TYPES.EVENT,
                entityId: id,
                details: payload,
            })
        }

        return result
    }

    /**
     * Delete an event and log the action.
     */
    async deleteWithLog(id: string, userId: string) {
        const result = await this.delete(id)

        if (!result.error) {
            await logActivity({
                userId,
                action: LOG_ACTIONS.EVENT_DELETE,
                entityType: ENTITY_TYPES.EVENT,
                entityId: id,
            })
        }

        return result
    }

    /**
     * Publish an event (set status to 'published' and published_at to now).
     */
    async publish(id: string, userId: string) {
        const { data, error } = await supabase
            .from('events')
            .update({ status: 'published', published_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single()

        if (error) return { data: null, error: error.message }

        await logActivity({
            userId,
            action: LOG_ACTIONS.EVENT_PUBLISH,
            entityType: ENTITY_TYPES.EVENT,
            entityId: id,
        })

        return { data: data as Event, error: null }
    }
}

export const eventService = new EventService()