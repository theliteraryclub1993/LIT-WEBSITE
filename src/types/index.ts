/**
 * Central type exports.
 * Import from here for convenience:
 *   import type { Event, Participant } from '@/types'
 */

// Auth
export type {
    UserRole,
    Profile,
    ProfileUpdateInput,
    ProfileFormValues,
    LoginFormValues,
    AuthUser,
    RolePermissions,
} from './auth.types'

export {
    ROLE_HIERARCHY,
    ROLE_PERMISSIONS,
    hasPermission,
    hasMinRole,
} from './auth.types'

// Events
export type {
    EventCustomField,
    EventStatus,
    Event,
    EventCreateInput,
    EventUpdateInput,
    EventListItem,
    EventDetail,
    EventFilters,
    EventSort,
    EventFormValues,
    EventRegistrationInput,
    EventStats,
} from './event.types'

// Participants
export type {
    Participant,
    ParticipantCreateInput,
    ParticipantUpdateInput,
    ParticipantWithEvent,
    ParticipantWithCertificate,
    ParticipantListItem,
    ParticipantFilters,
    ParticipantRegistrationFormValues,
    BulkCheckInInput,
    ParticipantStats,
} from './participant.types'

// Auditions
export type {
    AuditionStatus,
    ApplicationStatus,
    AuditionCycle,
    AuditionCycleCreateInput,
    AuditionCycleUpdateInput,
    AuditionCycleWithStats,
    AuditionCycleListItem,
    AuditionApplication,
    AuditionApplicationCreateInput,
    AuditionApplicationUpdateInput,
    AuditionApplicationWithCycle,
    AuditionApplicationFormValues,
    AuditionReviewFormValues,
    AuditionCycleFilters,
    AuditionApplicationFilters,
    AuditionStats,
} from './audition.types'

// Team Members
export type {
    SocialLinks,
    TeamMember,
    TeamMemberCreateInput,
    TeamMemberUpdateInput,
    TeamMemberPublic,
    DepartmentGroup,
    TeamMemberFormValues,
    TeamMemberFilters,
    TeamStats,
} from './member.types'

// Gallery
export type {
    GalleryImage,
    GalleryImageCreateInput,
    GalleryImageUpdateInput,
    GalleryImageListItem,
    GalleryImageWithEvent,
    GalleryAlbum,
    GalleryCategory,
    GalleryImageFormValues,
    GalleryFilters,
    UploadProgress,
    LightboxState,
    GalleryStats,
    GalleryReorderItem,
} from './gallery.types'

// Blog
export type {
    PostStatus,
    Post,
    PostCreateInput,
    PostUpdateInput,
    PostListItem,
    PostDetail,
    PostFormValues,
    PostFilters,
    PostSort,
    BlogCategory,
    BlogTag,
    BlogStats,
    EditorBlock,
} from './blog.types'

// Certificates
export type {
    CertificateTemplate,
    Certificate,
    CertificateCreateInput,
    CertificateWithDetails,
    CertificateListItem,
    BulkCertificateGenerateInput,
    CertificateFilters,
    CertificateStats,
} from './certificate.types'

export { CERTIFICATE_TEMPLATE_LABELS } from './certificate.types'

// Attendance
export type {
    AttendanceMethod,
    AttendanceRecord,
    AttendanceCreateInput,
    AttendanceUpdateInput,
    AttendanceRecordWithDetails,
    AttendanceListItem,
    QRCheckInInput,
    AttendanceFilters,
    EventAttendanceSummary,
    AttendanceStats,
} from './attendance.types'

export { ATTENDANCE_METHOD_LABELS } from './attendance.types'

// Analytics
export type {
    AnalyticsTimeRange,
    ChartDataPoint,
    PieDataPoint,
    BarDataPoint,
    DashboardOverview,
    EventsAnalytics,
    GrowthAnalytics,
    ContentAnalytics,
    AnalyticsDashboard,
} from './analytics.types'

// Common
export type {
    PaginatedResponse,
    SingleResponse,
    MutationResult,
    SortDirection,
    SortConfig,
    PaginationConfig,
    ListQueryParams,
    SelectOption,
    TableColumn,
    TableState,
    ActionItem,
    ToastType,
    ConfirmDialogProps,
    TabItem,
    BreadcrumbItem,
    FileUploadResult,
    ExportFormat,
    DateRange,
} from './common.types'

// CMS
export type {
    NoesisEdition,
    NoesisEditionCreateInput,
    NoesisEditionUpdateInput,
    MalnadFestContact,
    MalnadFest,
    MalnadFestUpdateInput,
    Sponsor,
    SponsorCreateInput,
    SponsorUpdateInput,
    SparkSpeaker,
    SparkSpeakerCreateInput,
    SparkSpeakerUpdateInput,
} from './cms.types'