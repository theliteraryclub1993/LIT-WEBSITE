/**
 * Standard API response wrapper for list endpoints.
 */
export interface PaginatedResponse<T> {
  data: T[]
  count: number | null
  page: number
  pageSize: number
  totalPages: number | null
}

/**
 * Standard API response wrapper for single item endpoints.
 */
export interface SingleResponse<T> {
  data: T | null
  error: string | null
}

/**
 * Generic mutation result.
 */
export interface MutationResult {
  success: boolean
  error: string | null
}

/**
 * Sort direction.
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Sort configuration.
 */
export interface SortConfig<T extends string = string> {
  column: T
  direction: SortDirection
}

/**
 * Pagination configuration.
 */
export interface PaginationConfig {
  page: number
  pageSize: number
}

/**
 * Combined list query parameters.
 */
export interface ListQueryParams<TSortColumn extends string = string> {
  pagination?: PaginationConfig
  sort?: SortConfig<TSortColumn>
  search?: string
  [key: string]: unknown
}

/**
 * Select option for dropdowns.
 */
export interface SelectOption<T = string> {
  label: string
  value: T
  disabled?: boolean
  group?: string
}

/**
 * Column definition for data tables.
 */
export interface TableColumn<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  width?: string
  align?: 'left' | 'center' | 'right'
  render?: (value: unknown, row: T) => React.ReactNode
  className?: string
}

/**
 * Table state for controlled data tables.
 */
export interface TableState<TSortColumn extends string = string> {
  pagination: PaginationConfig
  sort: SortConfig<TSortColumn>
  search: string
  selectedRows: string[]
}

/**
 * Action item for dropdown menus and context menus.
 */
export interface ActionItem {
  label: string
  icon?: string
  onClick: () => void
  disabled?: boolean
  variant?: 'default' | 'danger' | 'warning'
  dividerAfter?: boolean
}

/**
 * Toast notification types.
 */
export type ToastType = 'success' | 'error' | 'info' | 'warning'

/**
 * Confirmation dialog props.
 */
export interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'warning' | 'default'
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

/**
 * Tab definition.
 */
export interface TabItem {
  id: string
  label: string
  count?: number
  icon?: string
  disabled?: boolean
}

/**
 * Breadcrumb item.
 */
export interface BreadcrumbItem {
  label: string
  href?: string
  icon?: string
}

/**
 * File upload result.
 */
export interface FileUploadResult {
  url: string
  thumbnailUrl?: string
  path: string
  size: number
  name: string
}

/**
 * Export format options.
 */
export type ExportFormat = 'csv' | 'pdf'

/**
 * Date range filter.
 */
export interface DateRange {
  from: string | null
  to: string | null
}
