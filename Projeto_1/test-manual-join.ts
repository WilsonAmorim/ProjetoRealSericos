import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data: osItens, error } = await supabase
    .from('os_itens_servico')
    .select(`
      *,
      pecas (descricao_pecas)
    `)
    .eq('id_os', 17);

  if (error) {
    console.error('Error fetching itens:', error.message);
    return;
  }

  const servicosIds = osItens?.map(item => item.id_servico).filter(Boolean) || [];
  if (servicosIds.length > 0) {
    const { data: servicos } = await supabase
      .from('servico')
      .select('id_servico, descricao_servico')
      .in('id_servico', servicosIds);
      
    osItens.forEach(item => {
      if (item.id_servico) {
        item.servico = servicos?.find((s: any) => s.id_servico === item.id_servico);
      }
    });
  }

  console.log('Success!', JSON.stringify(osItens, null, 2));
}

main();
