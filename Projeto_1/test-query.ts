import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase
    .from('os_itens_servico')
    .select(`
      *,
      servico (descricao_servico),
      pecas (descricao_pecas)
    `)
    .eq('id_os', 17);
    
  console.log('Query Error:', error ? error.message : 'Success');
  console.log('Query Data:', data);
  
  // Also try typeservico
  const { data: d2, error: e2 } = await supabase
    .from('os_itens_servico')
    .select(`
      *,
      tipo_servico (descricao_tipo_servico),
      pecas (descricao_pecas)
    `)
    .eq('id_os', 17);
  console.log('Query 2 Error:', e2 ? e2.message : 'Success');
  
  // also try servicos
  const { data: d3, error: e3 } = await supabase
    .from('os_itens_servico')
    .select(`
      *,
      servicos (descricao_servico),
      pecas (descricao_pecas)
    `)
    .eq('id_os', 17);
  console.log('Query 3 Error:', e3 ? e3.message : 'Success');

}

main();
