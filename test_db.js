import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://kchrgxpwqgkbijejkybb.supabase.co'
const supabaseAnonKey = 'sb_publishable_HojnKuRmy4IVQ-JuBI9FeA_04f0n-fs'

console.log('Connecting to:', supabaseUrl)
const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function getProfiles() {
    const { data, error } = await supabase.from('profiles').select('*')
    if (error) {
        console.error('Error fetching profiles:', error.message)
    } else {
        console.log('Profiles found:', data)
    }
}

getProfiles()
