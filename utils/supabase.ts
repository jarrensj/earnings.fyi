import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getUserPreferences(userId: string) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
  
  if (error) throw error
  return data
}

export async function updateUserPreference(
  userId: string,
  ticker: string,
  updates: { is_hidden?: boolean, is_favorite?: boolean }
) {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      ticker,
      ...updates
    })
    .select()
    .single()
  
  if (error) throw error
  return data
} 