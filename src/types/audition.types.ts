/**
 * Audition cycle status values.
 */
export type AuditionStatus = 'open' | 'closed' | 'in_review' | 'results_out'

/**
 * Application status values.
 */
export type ApplicationStatus = 'pending' | 'shortlisted' | 'rejected' | 'selected'

/**
 * Complete audition cycle entity.
 */
export interface AuditionCycle {
  id: string
  title: string
  description: string | null
  position: string
  requirements: string | null
  status: AuditionStatus
  open_date: string
  close_date: string
  max_applicants: number | null
  created_by: string
  created_at: string
  updated_at: string
}

/**
 * Payload for creating an audition cycle.
 */
export type AuditionCycleCreateInput = Omit<AuditionCycle, 'id' | 'created_by' | 'created_at' | 'updated_at'>

/**
 * Payload for updating an audition cycle.
 */
export type AuditionCycleUpdateInput = Partial<Omit<AuditionCycle, 'id' | 'created_by' | 'created_at' | 'updated_at'>>

/**
 * Audition cycle with application count.
 */
export interface AuditionCycleWithStats extends AuditionCycle {
  application_count: number
  pending_count: number
  shortlisted_count: number
  rejected_count: number
  selected_count: number
  creator_name?: string
}

/**
 * Audition cycle as displayed in list views.
 */
export interface AuditionCycleListItem {
  id: string
  title: string
  position: string
  status: AuditionStatus
  open_date: string
  close_date: string
  application_count: number
  max_applicants: number | null
}

/**
 * Complete audition application entity.
 */
export interface AuditionApplication {
  id: string
  cycle_id: string
  name: string
  email: string
  phone: string | null
  college: string | null
  year_of_study: string | null
  experience: string | null
  portfolio_url: string | null
  status: ApplicationStatus
  notes: string | null
  reviewed_by: string | null
  reviewed_at: string | null
  created_at: string
}

/**
 * Payload for creating an audition application.
 */
export type AuditionApplicationCreateInput = Omit<AuditionApplication, 'id' | 'status' | 'notes' | 'reviewed_by' | 'reviewed_at' | 'created_at'>

/**
 * Payload for updating an application (review workflow).
 */
export type AuditionApplicationUpdateInput = Partial<Omit<AuditionApplication, 'id' | 'cycle_id' | 'name' | 'email' | 'phone' | 'college' | 'year_of_study' | 'experience' | 'portfolio_url' | 'created_at'>>

/**
 * Application with cycle context.
 */
export interface AuditionApplicationWithCycle extends AuditionApplication {
  cycle_title?: string
  cycle_position?: string
  cycle_status?: AuditionStatus
  reviewer_name?: string | null
}

/**
 * Form values for public audition application.
 */
export interface AuditionApplicationFormValues {
  name: string
  email: string
  phone: string
  college: string
  year_of_study: string
  experience: string
  portfolio_url: string
}

/**
 * Review form values for admins.
 */
export interface AuditionReviewFormValues {
  status: ApplicationStatus
  notes: string
}

/**
 * Filters for listing audition cycles.
 */
export interface AuditionCycleFilters {
  status?: AuditionStatus | AuditionStatus[]
  search?: string
  position?: string
}

/**
 * Filters for listing audition applications.
 */
export interface AuditionApplicationFilters {
  cycle_id?: string
  status?: ApplicationStatus | ApplicationStatus[]
  search?: string
  college?: string
}

/**
 * Audition statistics.
 */
export interface AuditionStats {
  total_cycles: number
  open_cycles: number
  total_applications: number
  pending_applications: number
  selected_applications: number
  by_college: Array<{ college: string; count: number }>
}
