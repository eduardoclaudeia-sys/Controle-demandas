import { createClient } from '@supabase/supabase-js'

const url = 'https://nmrmghaarydsgqkdvinj.supabase.co'
const publishableKey = 'sb_publishable_5zncFVn34v1WfyLLRaT3og_vjxwZLu0'

export const supabase = createClient(url, publishableKey)
export const supabaseConfigured = true
