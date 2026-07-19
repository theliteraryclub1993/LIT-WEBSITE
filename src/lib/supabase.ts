import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl) {
    throw new Error(
        'Missing VITE_SUPABASE_URL environment variable. ' +
        'Please add it to your .env file. ' +
        'You can find it in your Supabase project settings → API → Project URL.'
    )
}

if (!supabaseAnonKey) {
    throw new Error(
        'Missing VITE_SUPABASE_ANON_KEY environment variable. ' +
        'Please add it to your .env file. ' +
        'You can find it in your Supabase project settings → API → anon public key.'
    )
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
        storageKey: 'literary-club-auth',
        flowType: 'pkce',
    },
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
    db: {
        schema: 'public',
    },
})

/**
 * Helper to get the current authenticated user.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
    const {
        data: { user },
        error,
    } = await supabase.auth.getUser()

    if (error) {
        console.error('Error fetching current user:', error.message)
        return null
    }

    return user
}

/**
 * Helper to get the current session.
 * Returns null if no active session.
 */
export async function getCurrentSession() {
    const {
        data: { session },
        error,
    } = await supabase.auth.getSession()

    if (error) {
        console.error('Error fetching session:', error.message)
        return null
    }

    return session
}

/**
 * Get a public URL for a file in a Supabase storage bucket.
 */
export function getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)

    if (!data?.publicUrl) {
        return ''
    }

    return data.publicUrl
}

/**
 * Upload a file to a Supabase storage bucket.
 * Returns the public URL on success, null on failure.
 */
export async function uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: { upsert?: boolean; cacheControl?: string }
): Promise<string | null> {
    const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
            upsert: options?.upsert ?? false,
            cacheControl: options?.cacheControl ?? '3600',
        })

    if (error) {
        console.error(`Error uploading to ${bucket}/${path}:`, error.message)
        return null
    }

    return getPublicUrl(bucket, data.path)
}

/**
 * Delete a file from a Supabase storage bucket.
 */
export async function deleteFile(bucket: string, paths: string[]): Promise<boolean> {
    const { error } = await supabase.storage.from(bucket).remove(paths)

    if (error) {
        console.error(`Error deleting from ${bucket}:`, error.message)
        return false
    }

    return true
}

/**
 * List files in a Supabase storage bucket folder.
 */
export async function listFiles(bucket: string, folder?: string, limit?: number) {
    const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
            limit: limit ?? 100,
            sortBy: { column: 'created_at', order: 'desc' },
        })

    if (error) {
        console.error(`Error listing files in ${bucket}/${folder}:`, error.message)
        return []
    }

    return data ?? []
}

/**
 * Subscribe to realtime changes on a table.
 * Returns an unsubscribe function.
 */
export function subscribeToTable<T extends Record<string, unknown>>(
    table: string,
    callback: (payload: {
        eventType: string
        new: T
        old: T
    }) => void,
    filter?: string
): () => void {
    const subscription = supabase
        .channel(`${table}-changes`)
        .on(
            'postgres_changes' as never,
            {
                event: '*',
                schema: 'public',
                table,
                filter,
            },
            (payload) => {
                callback(payload as unknown as { eventType: string; new: T; old: T })
            }
        )
        .subscribe()

    return () => {
        supabase.removeChannel(subscription)
    }
}