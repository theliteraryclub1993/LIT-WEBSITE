import { BaseService } from '@/services/baseService'
import type { MalnadFest } from '@/types'

class MalnadFestService extends BaseService<MalnadFest> {
    constructor() {
        super('malnad_fest')
    }

    async getFestInfo(): Promise<{ data: MalnadFest | null; error: string | null }> {
        const { data, error } = await this.query
            .select('*')
            .order('updated_at', { ascending: false })
            .limit(1)
            .maybeSingle()

        if (error) return { data: null, error: error.message }
        return { data: data as MalnadFest, error: null }
    }
}

export const malnadFestService = new MalnadFestService()
