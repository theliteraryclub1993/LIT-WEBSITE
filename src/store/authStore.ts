import { create } from 'zustand'
import { supabase } from '@/lib/supabase'
import type { AuthUser, UserRole, Profile } from '@/types'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
    // State
    user: AuthUser | null
    session: Session | null
    isLoading: boolean
    isAuthenticated: boolean
    initializationError: string | null

    // Actions
    initialize: () => Promise<void>
    login: (email: string, password: string) => Promise<{ error: string | null }>
    signup: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>
    logout: () => Promise<void>
    updateProfile: (updates: Partial<Pick<Profile, 'full_name' | 'avatar_url' | 'phone' | 'bio'>>) => Promise<{ error: string | null }>
    setUser: (user: AuthUser | null) => void
    reset: () => void
}

/**
 * Transforms Supabase User + Profile into our unified AuthUser type.
 */
function mapToAuthUser(userData: User, profile: Profile | null): AuthUser | null {
    if (!profile) return null

    return {
        id: userData.id,
        email: userData.email ?? null,
        phone: profile.phone,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        role: profile.role as UserRole,
        bio: profile.bio,
        created_at: profile.created_at,
    }
}

/**
 * Central authentication state store.
 * Handles Supabase Auth lifecycle, session management, and profile syncing.
 */
export const useAuthStore = create<AuthState>((set, get) => ({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    initializationError: null,

    initialize: async () => {
        const start = Date.now();
        set({ isLoading: true, initializationError: null })

        try {
            // 1. Get current session
            const {
                data: { session },
                error: sessionError,
            } = await supabase.auth.getSession()

            if (sessionError) {
                console.error('[AuthStore] Failed to get session:', sessionError.message)
                // Ensure minimum delay
                const elapsed = Date.now() - start;
                if (elapsed < 2000) await new Promise(r => setTimeout(r, 2000 - elapsed));
                set({ isLoading: false, initializationError: sessionError.message })
                return
            }

            // 2. If session exists, fetch the profile
            if (session?.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', session.user.id)
                    .single()

                const user = mapToAuthUser(session.user, profile)

                // Ensure minimum display time
                const elapsed = Date.now() - start;
                if (elapsed < 2000) await new Promise(r => setTimeout(r, 2000 - elapsed));

                set({
                    session,
                    user,
                    isAuthenticated: !!user,
                    isLoading: false,
                })
            } else {
                const elapsed = Date.now() - start;
                if (elapsed < 2000) await new Promise(r => setTimeout(r, 2000 - elapsed));
                set({
                    session: null,
                    user: null,
                    isAuthenticated: false,
                    isLoading: false,
                })
            }

            // 3. Listen for auth state changes (login, logout, token refresh)
            supabase.auth.onAuthStateChange(async (event, newSession) => {
                console.log('[AuthStore] Auth state change:', event)

                if (event === 'SIGNED_OUT' || (event as string) === 'USER_DELETED') {
                    set({
                        session: null,
                        user: null,
                        isAuthenticated: false,
                    })
                    return
                }

                if (newSession?.user) {
                    const { data: profile } = await supabase
                        .from('profiles')
                        .select('*')
                        .eq('id', newSession.user.id)
                        .single()

                    const user = mapToAuthUser(newSession.user, profile)

                    set({
                        session: newSession,
                        user,
                        isAuthenticated: !!user,
                    })
                }
            })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown initialization error'
            console.error('[AuthStore] Initialization error:', message)
            const elapsed = Date.now() - start;
            if (elapsed < 2000) await new Promise(r => setTimeout(r, 2000 - elapsed));
            set({ isLoading: false, initializationError: message })
        }
    },

    login: async (email: string, password: string) => {
        set({ isLoading: true })

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })

            if (error) {
                set({ isLoading: false })
                return { error: error.message }
            }

            // Note: Profile fetching is handled by onAuthStateChange listener
            // but we do it here too for immediate UI update
            if (data.user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single()

                const user = mapToAuthUser(data.user, profile)

                set({
                    session: data.session,
                    user,
                    isAuthenticated: !!user,
                    isLoading: false,
                })
            }

            return { error: null }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed'
            set({ isLoading: false })
            return { error: message }
        }
    },

    signup: async (email: string, password: string, fullName: string) => {
        set({ isLoading: true })

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            })

            if (error) {
                set({ isLoading: false })
                return { error: error.message }
            }

            // If email confirmation is disabled, user is logged in immediately
            if (data.user && data.session) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', data.user.id)
                    .single()

                const user = mapToAuthUser(data.user, profile)

                set({
                    session: data.session,
                    user,
                    isAuthenticated: !!user,
                    isLoading: false,
                })
            } else {
                // Email confirmation required
                set({ isLoading: false })
            }

            return { error: null }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Signup failed'
            set({ isLoading: false })
            return { error: message }
        }
    },

    logout: async () => {
        try {
            await supabase.auth.signOut()
        } catch (error) {
            console.error('[AuthStore] Logout error during signout call:', error)
        } finally {
            // 1. Clear state
            set({
                session: null,
                user: null,
                isAuthenticated: false,
            })

            // 2. Clear Local Storage
            try {
                localStorage.clear()
            } catch (e) {
                console.error('[AuthStore] Error clearing localStorage:', e)
            }

            // 3. Clear Session Storage
            try {
                sessionStorage.clear()
            } catch (e) {
                console.error('[AuthStore] Error clearing sessionStorage:', e)
            }

            // 4. Redirect to login and replace history entry to prevent back button access
            window.location.replace('/login')
        }
    },

    updateProfile: async (updates) => {
        const { user } = get()

        if (!user) {
            return { error: 'Not authenticated' }
        }

        try {
            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)

            if (error) {
                return { error: error.message }
            }

            // Optimistically update local state
            set({
                user: {
                    ...user,
                    ...updates,
                },
            })

            return { error: null }
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Profile update failed'
            return { error: message }
        }
    },

    setUser: (user) => {
        set({ user, isAuthenticated: !!user })
    },

    reset: () => {
        set({
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
            initializationError: null,
        })
    },
}))