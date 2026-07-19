/**
 * Auto-generated Supabase database types.
 * After running the SQL from Phase 4, generate types with:
 * npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts
 *
 * For now, we define the base types that the client expects.
 * These will be supplemented by the generated types.
 */

export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    full_name: string | null
                    avatar_url: string | null
                    phone: string | null
                    role: string
                    bio: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    full_name?: string | null
                    avatar_url?: string | null
                    phone?: string | null
                    role?: string
                    bio?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    full_name?: string | null
                    avatar_url?: string | null
                    phone?: string | null
                    role?: string
                    bio?: string | null
                    updated_at?: string
                }
            }
            team_members: {
                Row: {
                    id: string
                    user_id: string | null
                    name: string
                    role: string
                    department: string | null
                    avatar_url: string | null
                    bio: string | null
                    order_index: number
                    is_active: boolean
                    social_links: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    name: string
                    role: string
                    department?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    order_index?: number
                    is_active?: boolean
                    social_links?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    name?: string
                    role?: string
                    department?: string | null
                    avatar_url?: string | null
                    bio?: string | null
                    order_index?: number
                    is_active?: boolean
                    social_links?: Json | null
                    updated_at?: string
                }
            }
            events: {
                Row: {
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
                    registration_fee: number | null
                    status: string
                    is_featured: boolean
                    custom_fields: Json | null
                    created_by: string
                    published_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    slug: string
                    description?: string | null
                    short_description?: string | null
                    cover_image?: string | null
                    venue?: string | null
                    date?: string | null
                    end_date?: string | null
                    time?: string | null
                    max_participants?: number | null
                    registration_fee?: number | null
                    status?: string
                    is_featured?: boolean
                    custom_fields?: Json | null
                    created_by: string
                    published_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    slug?: string
                    description?: string | null
                    short_description?: string | null
                    cover_image?: string | null
                    venue?: string | null
                    date?: string | null
                    end_date?: string | null
                    time?: string | null
                    max_participants?: number | null
                    registration_fee?: number | null
                    status?: string
                    is_featured?: boolean
                    custom_fields?: Json | null
                    published_at?: string | null
                    updated_at?: string
                }
            }
            participants: {
                Row: {
                    id: string
                    event_id: string
                    name: string
                    email: string
                    phone: string | null
                    college: string | null
                    custom_data: Json | null
                    registered_at: string
                    attended: boolean
                    certificate_id: string | null
                }
                Insert: {
                    id?: string
                    event_id: string
                    name: string
                    email: string
                    phone?: string | null
                    college?: string | null
                    custom_data?: Json | null
                    registered_at?: string
                    attended?: boolean
                    certificate_id?: string | null
                }
                Update: {
                    id?: string
                    event_id?: string
                    name?: string
                    email?: string
                    phone?: string | null
                    college?: string | null
                    custom_data?: Json | null
                    attended?: boolean
                    certificate_id?: string | null
                }
            }
            audition_cycles: {
                Row: {
                    id: string
                    title: string
                    description: string | null
                    position: string
                    requirements: string | null
                    status: string
                    open_date: string
                    close_date: string
                    max_applicants: number | null
                    created_by: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    description?: string | null
                    position: string
                    requirements?: string | null
                    status?: string
                    open_date: string
                    close_date: string
                    max_applicants?: number | null
                    created_by: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    description?: string | null
                    position?: string
                    requirements?: string | null
                    status?: string
                    open_date?: string
                    close_date?: string
                    max_applicants?: number | null
                    updated_at?: string
                }
            }
            audition_applications: {
                Row: {
                    id: string
                    cycle_id: string
                    name: string
                    email: string
                    phone: string | null
                    college: string | null
                    year_of_study: string | null
                    experience: string | null
                    portfolio_url: string | null
                    status: string
                    notes: string | null
                    reviewed_by: string | null
                    reviewed_at: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    cycle_id: string
                    name: string
                    email: string
                    phone?: string | null
                    college?: string | null
                    year_of_study?: string | null
                    experience?: string | null
                    portfolio_url?: string | null
                    status?: string
                    notes?: string | null
                    reviewed_by?: string | null
                    reviewed_at?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    cycle_id?: string
                    name?: string
                    email?: string
                    phone?: string | null
                    college?: string | null
                    year_of_study?: string | null
                    experience?: string | null
                    portfolio_url?: string | null
                    status?: string
                    notes?: string | null
                    reviewed_by?: string | null
                    reviewed_at?: string | null
                }
            }
            posts: {
                Row: {
                    id: string
                    title: string
                    slug: string
                    content: string | null
                    excerpt: string | null
                    cover_image: string | null
                    author_id: string
                    author_name: string
                    status: string
                    category: string | null
                    tags: string[] | null
                    read_time_minutes: number | null
                    is_featured: boolean
                    published_at: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    title: string
                    slug: string
                    content?: string | null
                    excerpt?: string | null
                    cover_image?: string | null
                    author_id: string
                    author_name: string
                    status?: string
                    category?: string | null
                    tags?: string[] | null
                    read_time_minutes?: number | null
                    is_featured?: boolean
                    published_at?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    title?: string
                    slug?: string
                    content?: string | null
                    excerpt?: string | null
                    cover_image?: string | null
                    author_id?: string
                    author_name?: string
                    status?: string
                    category?: string | null
                    tags?: string[] | null
                    read_time_minutes?: number | null
                    is_featured?: boolean
                    published_at?: string | null
                    updated_at?: string
                }
            }
            gallery_images: {
                Row: {
                    id: string
                    url: string
                    thumbnail_url: string | null
                    caption: string | null
                    album: string | null
                    category: string | null
                    event_id: string | null
                    uploaded_by: string
                    order_index: number
                    width: number | null
                    height: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    url: string
                    thumbnail_url?: string | null
                    caption?: string | null
                    album?: string | null
                    category?: string | null
                    event_id?: string | null
                    uploaded_by: string
                    order_index?: number
                    width?: number | null
                    height?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    url?: string
                    thumbnail_url?: string | null
                    caption?: string | null
                    album?: string | null
                    category?: string | null
                    event_id?: string | null
                    order_index?: number
                    width?: number | null
                    height?: number | null
                }
            }
            attendance_records: {
                Row: {
                    id: string
                    event_id: string
                    participant_id: string
                    checked_in_at: string
                    checked_out_at: string | null
                    method: string
                    verified_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    event_id: string
                    participant_id: string
                    checked_in_at?: string
                    checked_out_at?: string | null
                    method?: string
                    verified_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    event_id?: string
                    participant_id?: string
                    checked_in_at?: string
                    checked_out_at?: string | null
                    method?: string
                    verified_by?: string | null
                }
            }
            certificates: {
                Row: {
                    id: string
                    participant_id: string
                    event_id: string
                    template_type: string
                    certificate_number: string
                    issued_at: string
                    pdf_url: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    participant_id: string
                    event_id: string
                    template_type?: string
                    certificate_number: string
                    issued_at?: string
                    pdf_url?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    participant_id?: string
                    event_id?: string
                    template_type?: string
                    certificate_number?: string
                    pdf_url?: string | null
                }
            }
            activity_logs: {
                Row: {
                    id: string
                    user_id: string | null
                    action: string
                    entity_type: string
                    entity_id: string | null
                    details: Json | null
                    ip_address: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    user_id?: string | null
                    action: string
                    entity_type: string
                    entity_id?: string | null
                    details?: Json | null
                    ip_address?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string | null
                    action?: string
                    entity_type?: string
                    entity_id?: string | null
                    details?: Json | null
                    ip_address?: string | null
                }
            }
            settings: {
                Row: {
                    id: string
                    key: string
                    value: Json
                    category: string
                    updated_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    key: string
                    value: Json
                    category: string
                    updated_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    key?: string
                    value?: Json
                    category?: string
                    updated_by?: string | null
                    updated_at?: string
                }
            }
        }
        Views: Record<string, never>
        Functions: Record<string, never>
        Enums: {
            user_role: 'superAdmin' | 'admin' | 'eventManager' | 'contentEditor'
            event_status: 'draft' | 'published' | 'ongoing' | 'completed' | 'cancelled'
            audition_status: 'open' | 'closed' | 'in_review' | 'results_out'
            application_status: 'pending' | 'shortlisted' | 'rejected' | 'selected'
            post_status: 'draft' | 'published' | 'archived'
            attendance_method: 'qr' | 'manual' | 'link'
            certificate_template: 'participation' | 'winner' | 'special' | 'volunteer'
            setting_category: 'general' | 'social' | 'events' | 'appearance' | 'security' | 'homepage' | 'about'
        }
    }
}

/**
 * Convenience type for accessing table row types.
 * Usage: type Event = Tables['events']['Row']
 */
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]