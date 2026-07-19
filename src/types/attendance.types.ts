/**
 * Attendance method types.
 */
export type AttendanceMethod = 'qr' | 'manual' | 'link'

/**
 * Method display labels.
 */
export const ATTENDANCE_METHOD_LABELS: Record<AttendanceMethod, string> = {
  qr: 'QR Scan',
  manual: 'Manual',
  link: 'Registration Link',
} as const

/**
 * Complete attendance record entity.
 */
export interface AttendanceRecord {
  id: string
  event_id: string
  participant_id: string
  checked_in_at: string
  checked_out_at: string | null
  method: AttendanceMethod
  verified_by: string | null
  created_at: string
}

/**
 * Payload for creating an attendance record (check-in).
 */
export type AttendanceCreateInput = Omit<AttendanceRecord, 'id' | 'created_at'>

/**
 * Payload for updating an attendance record (check-out).
 */
export type AttendanceUpdateInput = Partial<Omit<AttendanceRecord, 'id' | 'event_id' | 'participant_id' | 'checked_in_at' | 'created_at'>>

/**
 * Attendance record with participant and event context.
 */
export interface AttendanceRecordWithDetails extends AttendanceRecord {
  participant_name?: string
  participant_email?: string
  participant_college?: string | null
  event_title?: string
  verifier_name?: string | null
}

/**
 * Attendance list item for table display.
 */
export interface AttendanceListItem {
  id: string
  participant_name: string
  participant_email: string
  participant_college: string | null
  checked_in_at: string
  checked_out_at: string | null
  method: AttendanceMethod
  duration_minutes: number | null
  verified_by_name: string | null
}

/**
 * QR code check-in payload.
 */
export interface QRCheckInInput {
  event_id: string
  participant_id: string
  verified_by: string
}

/**
 * Filters for listing attendance records.
 */
export interface AttendanceFilters {
  event_id?: string
  method?: AttendanceMethod
  date_from?: string
  date_to?: string
  search?: string
}

/**
 * Event attendance summary.
 */
export interface EventAttendanceSummary {
  event_id: string
  event_title: string
  event_date: string | null
  total_registered: number
  total_checked_in: number
  total_checked_out: number
  attendance_rate: number
  by_method: Array<{ method: AttendanceMethod; count: number }>
}

/**
 * Attendance statistics.
 */
export interface AttendanceStats {
  total_records: number
  by_method: Array<{ method: AttendanceMethod; count: number }>
  events: EventAttendanceSummary[]
}