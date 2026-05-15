import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: servicoData, error: servicoError } = await supabase.from('servico').insert([{ id_servico: 9999, descricao_servico: 'Test' }]);
  console.log('Insert into servico result:', servicoError ? servicoError.message : servicoData);
}

main();
