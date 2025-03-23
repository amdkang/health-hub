import { createClient } from '@supabase/supabase-js'; 

/** Initialize connection to Supabase database */

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY; 

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);