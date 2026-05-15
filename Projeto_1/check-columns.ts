import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: sCols, error: sErr } = await supabase.rpc('get_table_columns', { table_name: 'os_servicos' });
  console.log('os_servicos columns:', sErr ? sErr.message : sCols);

  const { data: pCols, error: pErr } = await supabase.rpc('get_table_columns', { table_name: 'os_pecas' });
  console.log('os_pecas columns:', pErr ? pErr.message : pCols);
}

main();
