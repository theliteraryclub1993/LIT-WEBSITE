import { supabase } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'
import { logActivity, LOG_ACTIONS, ENTITY_TYPES } from '@/services/activityLogService'
import type { Profile, AuthUser, UserRole } from '@/types'
import toast from 'react-hot-toast';

/**
 * Auth Service — Handles pure authentication API calls.
 * State management is handled by useAuthStore.
 * This service provides reusable auth utilities for components and hooks.
 */

/**
 * Fetches a user profile from the profiles table.
 */
export async function fetchProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

    if (error) {
        console.error('[AuthService] Error fetching profile:', error.message)
        return null
    }

    return data as Profile
}

/**
 * Sends a password reset email.
 */
export async function requestPasswordReset(email: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) {
        return { error: error.message }
    }

    return { error: null }
}

/**
 * Updates the user's password using the recovery token.
 */
export async function updatePassword(newPassword: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.updateUser({
        password: newPassword,
    })

    if (error) {
        return { error: error.message }
    }

    return { error: null }
}

/**
 * Updates the user's email. Requires re-authentication in Supabase.
 */
export async function updateEmail(newEmail: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.updateUser({
        email: newEmail,
    })

    if (error) {
        return { error: error.message }
    }

    return { error: null }
}

/**
 * Uploads an avatar image to Supabase storage and updates the profile.
 */
export async function updateAvatar(
    userId: string,
    file: File
): Promise<{ url: string | null; error: string | null }> {
    const fileExt = file.name.split('.').pop()
    const filePath = `${userId}/${Date.now()}.${fileExt}`

    const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true })

    if (uploadError) {
        toast.error('Avatar upload failed: ' + uploadError.message);
        return { url: null, error: uploadError.message };
    }

    const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

    const publicUrl = publicUrlData.publicUrl

    // Update profile with new avatar URL
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', userId)

    if (updateError) {
        return { url: publicUrl, error: 'Avatar uploaded but profile update failed.' }
    }

    // Log activity
    await logActivity({
        userId,
        action: LOG_ACTIONS.SETTINGS_UPDATE,
        entityType: ENTITY_TYPES.PROFILE,
        entityId: userId,
        details: { field: 'avatar_url' },
    })

    return { url: publicUrl, error: null }
}

/**
 * Transforms Supabase User + Profile into our unified AuthUser type.
 * Exported for use in stores and hooks.
 */
export function mapToAuthUser(userData: User, profile: Profile | null): AuthUser | null {
    if (!profile) return null

    return {
        id: userData.id,
        email: userData.email ?? null,
        phone: profile.phone,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: profile.role as UserRole,
        bio: profile.bio,
        created_at: profile.created_at,
    }
}