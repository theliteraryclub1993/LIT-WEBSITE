/**
 * Certificate template types.
 */
export type CertificateTemplate = 'participation' | 'winner' | 'special' | 'volunteer'

/**
 * Template display labels.
 */
export const CERTIFICATE_TEMPLATE_LABELS: Record<CertificateTemplate, string> = {
  participation: 'Participation',
  winner: 'Winner',
  special: 'Special Mention',
  volunteer: 'Volunteer',
} as const

/**
 * Complete certificate entity.
 */
export interface Certificate {
  id: string
  participant_id: string
  event_id: string
  template_type: CertificateTemplate
  certificate_number: string
  issued_at: string
  pdf_url: string | null
  created_at: string
}

/**
 * Payload for creating a certificate.
 */
export type CertificateCreateInput = Omit<Certificate, 'id' | 'created_at'>

/**
 * Certificate with participant and event context.
 */
export interface CertificateWithDetails extends Certificate {
  participant_name?: string
  participant_email?: string
  event_title?: string
  event_date?: string | null
}

/**
 * Certificate list item for table display.
 */
export interface CertificateListItem {
  id: string
  certificate_number: string
  participant_name: string
  event_title: string
  template_type: CertificateTemplate
  issued_at: string
  has_pdf: boolean
}

/**
 * Bulk generation payload.
 */
export interface BulkCertificateGenerateInput {
  event_id: string
  participant_ids: string[]
  template_type: CertificateTemplate
  generated_by: string
}

/**
 * Filters for listing certificates.
 */
export interface CertificateFilters {
  event_id?: string
  template_type?: CertificateTemplate
  search?: string
  has_pdf?: boolean
  date_from?: string
  date_to?: string
}

/**
 * Certificate statistics.
 */
export interface CertificateStats {
  total: number
  by_template: Array<{ template_type: CertificateTemplate; count: number }>
  by_event: Array<{ event_id: string; event_title: string; count: number }>
  with_pdf: number
  without_pdf: number
}