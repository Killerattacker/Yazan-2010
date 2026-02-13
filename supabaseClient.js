import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://uquvyousbrkfgcdociia.supabase.co'
const supabaseKey = 'sb_publishable_HPP_cHCDHGhJ9iCMfuo61w_hINmYFRU'

export const supabase = createClient(supabaseUrl, supabaseKey)