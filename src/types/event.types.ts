/**
 * Custom field definition for dynamic event registration forms.
 */
export interface EventCustomField {
    label: string
    name: string
    type: 'text' | 'email' | 'number' | 'tel' | 'textarea' | 'select' | 'multiselect' | 'checkbox' | 'url'
    required: boolean
    placeholder?: string
    options?: string[]
    validation?: {
        min?: number
        max?: number
        pattern?: string
        message?: string
    }
}

/**
 * Event status values matching the PostgreSQL enum.
 */
export type EventStatus = 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'

/**
 * Complete event entity as stored in the database.
 */
export interface Event {
    id: string
    title: string
    slug: string
    description: string | null
    short_description: string | null
    cover_image: string | null
    venue: string | null
    date: string | null
    end_date: string | null
    time: string | null
    max_participants: number | null
    registration_fee: number
    status: EventStatus
    is_featured: boolean
    custom_fields: EventCustomField[] | null
    created_by: string
    rulebook_pdf?: string | null
    brochure_pdf?: string | null
    published_at: string | null
    created_at: string
    updated_at: string
}

/**
 * Payload for creating a new event.
 */
export type EventCreateInput = Omit<Event, 'id' | 'created_at' | 'updated_at' | 'published_at'>

/**
 * Payload for updating an existing event.
 * All fields are optional — only provided fields will be updated.
 */
export type EventUpdateInput = Partial<Omit<Event, 'id' | 'created_at' | 'updated_at'>>

/**
 * Event as displayed in list views (lighter payload).
 */
export interface EventListItem {
    id: string
    title: string
    slug: string
    short_description: string | null
    cover_image: string | null
    venue: string | null
    date: string | null
    time: string | null
    status: EventStatus
    is_featured: boolean
    max_participants: number | null
    registration_fee: number
    participant_count?: number
    published_at: string | null
}

/**
 * Event detail with pre-computed stats.
 */
export interface EventDetail extends Event {
    participant_count: number
    attended_count: number
    certified_count: number
    fill_percentage: number | null
    creator_name?: string
}

/**
 * Filters for listing events.
 */
export interface EventFilters {
    status?: EventStatus | EventStatus[]
    search?: string
    is_featured?: boolean
    date_from?: string
    date_to?: string
    has_fee?: boolean
    created_by?: string
}

/**
 * Sort options for event listing.
 */
export interface EventSort {
    column: 'date' | 'created_at' | 'published_at' | 'title' | 'participant_count'
    ascending: boolean
}

/**
 * Form values for the event creation/edit form.
 */
export interface EventFormValues {
    title: string
    slug: string
    description: string
    short_description: string
    cover_image: string
    venue: string
    date: string
    end_date: string
    time: string
    max_participants: string
    registration_fee: string
    status: EventStatus
    is_featured: boolean
    custom_fields: EventCustomField[]
}

/**
 * Participant registration payload.
 * Extends base fields with dynamic custom field answers.
 */
export interface EventRegistrationInput {
    event_id: string
    name: string
    email: string
    phone: string
    college: string
    custom_data: Record<string, unknown>
}

/**
 * Event statistics for dashboard cards.
 */
export interface EventStats {
    total: number
    published: number
    ongoing: number
    completed: number
    draft: number
    cancelled: number
    upcoming: number
    total_participants: number
    total_revenue: number
}