import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config()

const SUPABASE_KEY = process.env.SUPABASE_KEY
const SUPABASE_ADMIN_KEY = process.env.SUPABASE_ADMIN_KEY

export const supabase = createClient(
  'https://xtyrxekcsaesyyopouhh.supabase.co', 
  SUPABASE_KEY ?? ""
);

export const supabaseAdmin = createClient(
  'https://xtyrxekcsaesyyopouhh.supabase.co', 
  SUPABASE_ADMIN_KEY ?? ""
)
