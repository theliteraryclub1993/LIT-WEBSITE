import { supabase } from '@/lib/supabase'
import { queryClient } from '@/lib/queryClient'
import { queryKeyFactory } from '@/lib/queryClient'
import type { Json } from '@/lib/supabase.types'

/**
 * Fetch a single setting by key.
 */
export async function getSetting(key: string): Promise<Json | null> {
    const { data, error } = await supabase
        .from('settings')
        .select('value')
        .eq('key', key)
        .single()

    if (error) {
        console.error(`[SettingsService] Error fetching setting "${key}":`, error.message)
        return null
    }

    return data?.value ?? null
}

const VALID_SETTING_CATEGORIES = new Set(['general', 'homepage', 'footer', 'contact', 'social', 'features', 'system'])

function sanitizeCategory(category: string): string {
    if (VALID_SETTING_CATEGORIES.has(category)) {
        return category
    }
    return 'general'
}

/**
 * Fetch all settings in a category.
 */
export async function getSettingsByCategory(category: string): Promise<Record<string, Json>> {
    const dbCategory = sanitizeCategory(category)
    const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .eq('category', dbCategory)

    if (error) {
        console.error(`[SettingsService] Error fetching settings for "${dbCategory}":`, error.message)
        return {}
    }

    const result: Record<string, Json> = {}
    for (const item of data ?? []) {
        result[item.key] = item.value
    }

    return result
}

/**
 * Upsert a setting value.
 */
export async function setSetting(
    key: string,
    value: Json,
    category: string,
    updatedBy?: string
): Promise<{ error: string | null }> {
    const { error } = await supabase
        .from('settings')
        .upsert(
            {
                key,
                value,
                category: sanitizeCategory(category),
                updated_by: updatedBy ?? null,
            },
            { onConflict: 'key' }
        )

    if (error) {
        console.error(`[SettingsService] Error setting "${key}":`, error.message)
        return { error: error.message }
    }

    // Invalidate all settings queries
    queryClient.invalidateQueries({ queryKey: queryKeyFactory.settings.all })

    return { error: null }
}

/**
 * Fetch all settings as a flat key-value map.
 */
export async function getAllSettings(): Promise<Record<string, Json>> {
    const { data, error } = await supabase
        .from('settings')
        .select('key, value')

    if (error) {
        console.error('[SettingsService] Error fetching all settings:', error.message)
        return {}
    }

    const result: Record<string, Json> = {}
    for (const item of data ?? []) {
        result[item.key] = item.value
    }

    return result
}