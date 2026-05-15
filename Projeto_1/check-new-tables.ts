import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: sData, error: sErr } = await supabase.from('os_servicos').select('*').limit(1);
  console.log('os_servicos:', sErr ? sErr.message : 'exists');

  const { data: pData, error: pErr } = await supabase.from('os_pecas').select('*').limit(1);
  console.log('os_pecas:', pErr ? pErr.message : 'exists');
}

main();
