/**
 * Time range for analytics queries.
 */
export type AnalyticsTimeRange = '7d' | '30d' | '90d' | '1y' | 'all'

/**
 * Chart data point for line/area charts.
 */
export interface ChartDataPoint {
  label: string
  value: number
  secondaryValue?: number
}

/**
 * Pie/donut chart data point.
 */
export interface PieDataPoint {
  name: string
  value: number
  color: string
}

/**
 * Bar chart data point.
 */
export interface BarDataPoint {
  label: string
  value: number
  category?: string
}

/**
 * Dashboard overview stats.
 */
export interface DashboardOverview {
  totalEvents: number
  totalParticipants: number
  totalTeamMembers: number
  totalPosts: number
  totalGalleryImages: number
  totalCertificates: number
  openAuditions: number
  pendingApplications: number
  eventsThisMonth: number
  participantsThisMonth: number
  growthRate: {
    events: number
    participants: number
    posts: number
  }
}

/**
 * Events analytics.
 */
export interface EventsAnalytics {
  byStatus: PieDataPoint[]
  byMonth: ChartDataPoint[]
  topByParticipation: Array<{
    event_id: string
    event_title: string
    participant_count: number
    attendance_rate: number
  }>
  averageFillRate: number
  totalRevenue: number
}

/**
 * Member/participant growth analytics.
 */
export interface GrowthAnalytics {
  participantsByMonth: ChartDataPoint[]
  attendanceByMonth: ChartDataPoint[]
  cumulativeParticipants: ChartDataPoint[]
  retentionRate: number
}

/**
 * Content analytics (blog + gallery).
 */
export interface ContentAnalytics {
  postsByCategory: PieDataPoint[]
  postsByMonth: ChartDataPoint[]
  galleryByAlbum: PieDataPoint[]
  totalReadTime: number
  averageReadTime: number
  topPosts: Array<{
    id: string
    title: string
    read_time_minutes: number | null
    published_at: string | null
  }>
}

/**
 * Full analytics dashboard data.
 */
export interface AnalyticsDashboard {
  overview: DashboardOverview
  events: EventsAnalytics
  growth: GrowthAnalytics
  content: ContentAnalytics
  lastUpdated: string
}
