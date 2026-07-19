import { BaseService } from '@/services/baseService'
import type { Sponsor } from '@/types'

class SponsorService extends BaseService<Sponsor> {
    constructor() {
        super('sponsors')
    }

    async getSponsors(): Promise<{ data: Sponsor[]; error: string | null }> {
        const { data, error } = await this.query
            .select('*')
            .order('order_index', { ascending: true })

        if (error) return { data: [], error: error.message }
        return { data: (data as Sponsor[]) ?? [], error: null }
    }
}

export const sponsorService = new SponsorService()
