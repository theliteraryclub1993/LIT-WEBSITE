/**
 * Complete participant entity as stored in the database.
 */
export interface Participant {
    id: string
    event_id: string
    name: string
    email: string
    phone: string | null
    college: string | null
    custom_data: Record<string, unknown> | null
    registered_at: string
    attended: boolean
    certificate_id: string | null
}

/**
 * Payload for creating a new participant (registration).
 */
export type ParticipantCreateInput = Omit<Participant, 'id' | 'registered_at' | 'attended' | 'certificate_id'>

/**
 * Payload for updating a participant.
 */
export type ParticipantUpdateInput = Partial<Omit<Participant, 'id' | 'event_id' | 'registered_at'>>

/**
 * Participant with event context joined in.
 */
export interface ParticipantWithEvent extends Participant {
    event_title?: string
    event_slug?: string
    event_date?: string | null
    event_venue?: string | null
    event_status?: string
}

/**
 * Participant with certificate info joined in.
 */
export interface ParticipantWithCertificate extends Participant {
    certificate_number?: string | null
    certificate_template?: string | null
    certificate_pdf_url?: string | null
}

/**
 * Participant as displayed in list views.
 */
export interface ParticipantListItem {
    id: string
    name: string
    email: string
    phone: string | null
    college: string | null
    registered_at: string
    attended: boolean
    has_certificate: boolean
}

/**
 * Filters for listing participants.
 */
export interface ParticipantFilters {
    event_id?: string
    search?: string
    attended?: boolean
    has_certificate?: boolean
    college?: string
    date_from?: string
    date_to?: string
}

/**
 * Form values for public event registration.
 * Dynamically extends based on event custom_fields.
 */
export interface ParticipantRegistrationFormValues {
    name: string
    email: string
    phone: string
    college: string
    [key: string]: unknown
}

/**
 * Bulk check-in payload for attendance marking.
 */
export interface BulkCheckInInput {
    event_id: string
    participant_ids: string[]
    method: 'qr' | 'manual' | 'link'
    verified_by: string
}

/**
 * Participant statistics.
 */
export interface ParticipantStats {
    total: number
    attended: number
    certified: number
    by_college: Array<{ college: string; count: number }>
    by_event: Array<{ event_id: string; event_title: string; count: number }>
}