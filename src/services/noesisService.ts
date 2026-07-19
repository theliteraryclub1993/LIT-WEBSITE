import { BaseService } from '@/services/baseService'
import { supabase } from '@/lib/supabase'
import type { NoesisEdition } from '@/types'

class NoesisService extends BaseService<NoesisEdition> {
    constructor() {
        super('noesis_editions')
    }

    async getEditions(params?: {
        search?: string
        page?: number
        pageSize?: number
    }) {
        let query = this.query.select('*', { count: 'exact' }).is('deleted_at', null)

        if (params?.search) {
            query = query.or(`title.ilike.%${params.search}%,edition_number.ilike.%${params.search}%`) as never
        }

        // Sort by is_current DESC, publish_date DESC
        query = query.order('is_current', { ascending: false }).order('publish_date', { ascending: false }) as never

        if (params?.page && params?.pageSize) {
            const from = (params.page - 1) * params.pageSize
            const to = from + params.pageSize - 1
            query = query.range(from, to) as never
        }

        const { data, count, error } = await query
        if (error) return { data: [], count: null, error: error.message }
        return { data: (data as NoesisEdition[]) ?? [], count, error: null }
    }

    async getCurrentEdition(): Promise<{ data: NoesisEdition | null; error: string | null }> {
        const { data, error } = await this.query
            .select('*')
            .eq('is_current' as never, true)
            .is('deleted_at', null)
            .limit(1)
            .maybeSingle()

        if (error) return { data: null, error: error.message }
        return { data: data as NoesisEdition, error: null }
    }

    async deleteEdition(id: string): Promise<{ error: string | null }> {
        // Soft delete
        const { error } = await supabase
            .from('noesis_editions')
            .update({ deleted_at: new Date().toISOString() })
            .eq('id', id)

        if (error) return { error: error.message }
        return { error: null }
    }
}

export const noesisService = new NoesisService()
