import { supabase } from '@/lib/supabase'

interface LogPayload {
    userId?: string | null
    action: string
    entityType: string
    entityId?: string | null
    details?: Record<string, unknown> | null
}

/**
 * Log an activity for audit trail.
 * Fire-and-forget — does not block the calling function.
 */
export async function logActivity(payload: LogPayload): Promise<void> {
    try {
        await supabase.from('activity_logs').insert({
            user_id: payload.userId ?? null,
            action: payload.action,
            entity_type: payload.entityType,
            entity_id: payload.entityId ?? null,
            details: payload.details ?? null,
        })
    } catch (err) {
        // Never throw from logging — it's non-critical
        console.error('[ActivityLog] Failed to log activity:', err)
    }
}

/**
 * Pre-built action constants for consistency.
 */
export const LOG_ACTIONS = {
    // Auth
    AUTH_LOGIN: 'auth.login',
    AUTH_LOGOUT: 'auth.logout',

    // Events
    EVENT_CREATE: 'event.create',
    EVENT_UPDATE: 'event.update',
    EVENT_DELETE: 'event.delete',
    EVENT_PUBLISH: 'event.publish',
    EVENT_CANCEL: 'event.cancel',

    // Participants
    PARTICIPANT_REGISTER: 'participant.register',
    PARTICIPANT_UPDATE: 'participant.update',
    PARTICIPANT_DELETE: 'participant.delete',
    PARTICIPANT_CHECK_IN: 'participant.check_in',

    // Auditions
    AUDITION_CREATE: 'audition.create',
    AUDITION_UPDATE: 'audition.update',
    AUDITION_DELETE: 'audition.delete',
    AUDITION_APPLY: 'audition.apply',
    AUDITION_REVIEW: 'audition.review',

    // Team
    TEAM_CREATE: 'team.create',
    TEAM_UPDATE: 'team.update',
    TEAM_DELETE: 'team.delete',

    // Blog
    POST_CREATE: 'post.create',
    POST_UPDATE: 'post.update',
    POST_DELETE: 'post.delete',
    POST_PUBLISH: 'post.publish',

    // Gallery
    GALLERY_UPLOAD: 'gallery.upload',
    GALLERY_DELETE: 'gallery.delete',
    GALLERY_UPDATE: 'gallery.update',

    // Certificates
    CERTIFICATE_GENERATE: 'certificate.generate',
    CERTIFICATE_DOWNLOAD: 'certificate.download',

    // Settings
    SETTINGS_UPDATE: 'settings.update',
} as const

export const ENTITY_TYPES = {
    EVENT: 'event',
    PARTICIPANT: 'participant',
    AUDITION: 'audition',
    AUDITION_APPLICATION: 'audition_application',
    TEAM_MEMBER: 'team_member',
    POST: 'post',
    GALLERY_IMAGE: 'gallery_image',
    CERTIFICATE: 'certificate',
    ATTENDANCE: 'attendance',
    SETTINGS: 'settings',
    USER: 'user',
    PROFILE: 'profile',
} as const