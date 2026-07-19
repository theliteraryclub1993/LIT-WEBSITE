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
/**
 * Helper to convert an image File to a Data URL (base64) string fallback.
 */
export function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = (err) => reject(err)
        reader.readAsDataURL(file)
    })
}

/**
 * Sanitize a storage path string to remove characters rejected by Supabase Storage.
 */
export function sanitizeStoragePath(path: string): string {
    const parts = path.split('/')
    const fileName = parts.pop() || 'file'
    const cleanFileName = fileName
        .replace(/[^a-zA-Z0-9._-]/g, '_')
        .replace(/_+/g, '_')
    return [...parts, cleanFileName].join('/')
}

/**
 * Upload a file to a Supabase storage bucket with path sanitization and bucket fallback.
 * If storage upload is unavailable, falls back to Data URL for image files so selections never fail.
 * Returns the public URL or data URL on success, null on failure.
 */
export async function uploadFile(
    bucket: string,
    path: string,
    file: File,
    options?: { upsert?: boolean; cacheControl?: string }
): Promise<string | null> {
    const cleanPath = sanitizeStoragePath(path)
    const bucketsToTry = Array.from(new Set([bucket, 'event-images', 'gallery', 'avatars', 'documents']))

    // Automatically infer fallback content type if file.type is blank or generic
    let contentType = file.type
    if (!contentType || contentType === 'application/octet-stream') {
        const ext = file.name.split('.').pop()?.toLowerCase()
        if (ext === 'png') contentType = 'image/png'
        else if (ext === 'webp') contentType = 'image/webp'
        else if (ext === 'gif') contentType = 'image/gif'
        else if (ext === 'svg') contentType = 'image/svg+xml'
        else if (ext === 'pdf') contentType = 'application/pdf'
        else contentType = 'image/jpeg'
    }

    for (const b of bucketsToTry) {
        try {
            let { data, error } = await supabase.storage
                .from(b)
                .upload(cleanPath, file, {
                    upsert: options?.upsert ?? true,
                    cacheControl: options?.cacheControl ?? '3600',
                    contentType,
                })

            if (error) {
                console.warn(`[uploadFile] Upload attempt to bucket "${b}" failed:`, error.message)
                if (error.message?.toLowerCase().includes('not found') || error.message?.toLowerCase().includes('bucket')) {
                    try {
                        console.log(`[uploadFile] Attempting to create missing public bucket "${b}"...`)
                        await supabase.storage.createBucket(b, { public: true })
                        const retry = await supabase.storage
                            .from(b)
                            .upload(cleanPath, file, {
                                upsert: options?.upsert ?? true,
                                cacheControl: options?.cacheControl ?? '3600',
                                contentType,
                            })
                        data = retry.data
                        error = retry.error
                    } catch (createErr) {
                        console.error(`[uploadFile] Could not auto-create bucket "${b}":`, createErr)
                    }
                }
            }

            if (!error && data?.path) {
                console.log(`[uploadFile] Upload successful using bucket "${b}" -> ${data.path}`)
                return getPublicUrl(b, data.path)
            }
        } catch (err) {
            console.error(`[uploadFile] Error uploading to "${b}":`, err)
        }
    }

    // Fallback: If it's an image file and storage bucket upload failed, convert to Data URL so image is never lost
    if (file.type?.startsWith('image/') || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(file.name)) {
        try {
            console.warn(`[uploadFile] Storage upload unavailable for ${file.name}. Converting to Data URL fallback.`)
            return await fileToDataUrl(file)
        } catch (dataUrlErr) {
            console.error('[uploadFile] Data URL fallback failed:', dataUrlErr)
        }
    }

    console.error(`[uploadFile] All upload attempts failed for path "${cleanPath}"`)
    return null
}

/**
 * Upload multiple files to a storage bucket in parallel with unique sanitized paths and Data URL fallback.
 * Returns an array of public URLs or data URLs for all successfully uploaded files.
 */
export async function uploadMultipleFiles(
    bucket: string,
    folder: string,
    files: File[],
    options?: { upsert?: boolean }
): Promise<string[]> {
    if (!files || files.length === 0) return []

    const now = Date.now()
    const promises = files.map(async (file, i) => {
        if (!file) return null
        const rand = Math.random().toString(36).substring(2, 7)
        const path = `${folder}/${now}_${i}_${rand}_${file.name}`

        try {
            return await uploadFile(bucket, path, file, options)
        } catch (err) {
            console.error(`[uploadMultipleFiles] Upload error for ${file.name}:`, err)
            try {
                return await fileToDataUrl(file)
            } catch {
                return null
            }
        }
    })

    const results = await Promise.all(promises)
    return results.filter((url): url is string => Boolean(url))
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