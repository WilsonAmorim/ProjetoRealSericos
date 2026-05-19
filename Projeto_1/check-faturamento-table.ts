import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.from('faturamento').select('*').limit(1);
  if (error) {
    console.error('Error fetching faturamento table:', error.message);
  } else {
    console.log('faturamento table exists and has rows count:', data?.length);
  }
}

main();
