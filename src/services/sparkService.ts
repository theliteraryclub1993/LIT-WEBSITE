import { BaseService } from '@/services/baseService'
import type { SparkSpeaker } from '@/types'

class SparkService extends BaseService<SparkSpeaker> {
    constructor() {
        super('spark_speakers')
    }

    async getSpeakers(params?: {
        search?: string
    }): Promise<{ data: SparkSpeaker[]; error: string | null }> {
        let query = this.query.select('*')

        if (params?.search) {
            query = query.or(`name.ilike.%${params.search}%,topic.ilike.%${params.search}%,designation.ilike.%${params.search}%`) as never
        }

        query = query.order('order_index', { ascending: true }).order('talk_date', { ascending: false }) as never

        const { data, error } = await query
        if (error) return { data: [], error: error.message }
        return { data: (data as SparkSpeaker[]) ?? [], error: null }
    }
}

export const sparkService = new SparkService()
