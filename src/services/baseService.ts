import { supabase } from '@/lib/supabase'

/**
 * Base service class providing common CRUD operations.
 * All services extend this class for consistent error handling and typing.
 */
export class BaseService<T extends { id: string }> {
    protected tableName: string

    constructor(tableName: string) {
        this.tableName = tableName
    }

    /**
     * Get the base query builder for the table.
     */
    protected get query(): any {
        return supabase.from(this.tableName) as any
    }

    /**
     * Fetch all records with optional filtering, sorting, and pagination.
     */
    async list(params?: {
        select?: string
        filter?: (q: any) => any
        orderBy?: { column: string; ascending?: boolean }
        page?: number
        pageSize?: number
        range?: { from: number; to: number }
    }): Promise<{ data: T[]; count: number | null; error: string | null }> {
        try {
            let query = this.query.select(params?.select ?? '*', { count: 'exact' })

            if (params?.filter) {
                query = params.filter(query)
            }

            if (params?.orderBy) {
                query = query.order(params.orderBy.column, {
                    ascending: params.orderBy.ascending ?? false,
                })
            }

            if (params?.range) {
                query = query.range(params.range.from, params.range.to)
            } else if (params?.page && params?.pageSize) {
                const from = (params.page - 1) * params.pageSize
                const to = from + params.pageSize - 1
                query = query.range(from, to)
            }

            const { data, count, error } = await query

            if (error) {
                console.error(`[BaseService] Error listing ${this.tableName}:`, error.message)
                return { data: [], count: null, error: error.message }
            }

            return { data: (data as T[]) ?? [], count, error: null }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            console.error(`[BaseService] Unexpected error listing ${this.tableName}:`, message)
            return { data: [], count: null, error: message }
        }
    }

    /**
     * Fetch a single record by ID.
     */
    async getById(
        id: string,
        select?: string
    ): Promise<{ data: T | null; error: string | null }> {
        try {
            const { data, error } = await this.query
                .select(select ?? '*')
                .eq('id', id)
                .single()

            if (error) {
                console.error(`[BaseService] Error fetching ${this.tableName} by ID:`, error.message)
                return { data: null, error: error.message }
            }

            return { data: data as T, error: null }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            console.error(`[BaseService] Unexpected error fetching ${this.tableName}:`, message)
            return { data: null, error: message }
        }
    }

    /**
     * Create a new record.
     */
    async create(
        payload: Omit<T, 'id' | 'created_at' | 'updated_at'>
    ): Promise<{ data: T | null; error: string | null }> {
        try {
            const { data, error } = await this.query
                .insert(payload)
                .select()
                .single()

            if (error) {
                console.error(`[BaseService] Error creating ${this.tableName}:`, error.message)
                return { data: null, error: error.message }
            }

            return { data: data as T, error: null }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            console.error(`[BaseService] Unexpected error creating ${this.tableName}:`, message)
            return { data: null, error: message }
        }
    }

    /**
     * Update an existing record by ID.
     */
    async update(
        id: string,
        payload: Partial<Omit<T, 'id' | 'created_at'>>
    ): Promise<{ data: T | null; error: string | null }> {
        try {
            const { data, error } = await this.query
                .update(payload)
                .eq('id', id)
                .select()
                .single()

            if (error) {
                console.error(`[BaseService] Error updating ${this.tableName}:`, error.message)
                return { data: null, error: error.message }
            }

            return { data: data as T, error: null }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            console.error(`[BaseService] Unexpected error updating ${this.tableName}:`, message)
            return { data: null, error: message }
        }
    }

    /**
     * Delete a record by ID.
     */
    async delete(id: string): Promise<{ error: string | null }> {
        try {
            const { error } = await this.query.delete().eq('id', id)

            if (error) {
                console.error(`[BaseService] Error deleting ${this.tableName}:`, error.message)
                return { error: error.message }
            }

            return { error: null }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            console.error(`[BaseService] Unexpected error deleting ${this.tableName}:`, message)
            return { error: message }
        }
    }

    /**
     * Delete multiple records by a column value.
     */
    async deleteByColumn(
        column: string,
        value: unknown
    ): Promise<{ error: string | null }> {
        try {
            const { error } = await this.query
                .delete()
                .eq(column, value)

            if (error) {
                console.error(`[BaseService] Error deleting ${this.tableName} by ${column}:`, error.message)
                return { error: error.message }
            }

            return { error: null }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            console.error(`[BaseService] Unexpected error deleting ${this.tableName}:`, message)
            return { error: message }
        }
    }

    /**
     * Check if a record exists by a column value.
     */
    async exists(
        column: string,
        value: unknown
    ): Promise<{ exists: boolean; error: string | null }> {
        try {
            const { count, error } = await this.query
                .select('id', { count: 'exact', head: true })
                .eq(column, value)

            if (error) {
                return { exists: false, error: error.message }
            }

            return { exists: (count ?? 0) > 0, error: null }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            return { exists: false, error: message }
        }
    }

    /**
     * Get count of records matching a filter.
     */
    async count(
        filter?: (q: any) => any
    ): Promise<{ count: number | null; error: string | null }> {
        try {
            let query = this.query.select('id', { count: 'exact', head: true })

            if (filter) {
                query = filter(query)
            }

            const { count, error } = await query

            if (error) {
                return { count: null, error: error.message }
            }

            return { count, error: null }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error'
            return { count: null, error: message }
        }
    }
}