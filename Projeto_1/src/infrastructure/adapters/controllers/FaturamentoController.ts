import { Request, Response, NextFunction } from 'express';
import { supabase as defaultSupabase } from '../../../config/supabase';
import { AppError } from '../../../middlewares/errorHandler';

export class FaturamentoController {

  // Listar OS's elegíveis para faturamento (status "Pronto para Entrega" ou "Entregue ao cliente")
  public getEligibleOS = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = req.supabase || defaultSupabase;

      // Primeiro buscar os IDs dos andamentos elegíveis
      const { data: andamentos, error: andError } = await db
        .from('andamento_servico')
        .select('id_andamento, descricao_andamento')
        .or('descricao_andamento.ilike.%Pronto para Entrega%,descricao_andamento.ilike.%Entregue ao cliente%');

      if (andError) return next(new AppError(andError.message, 500));

      const eligibleIds = andamentos?.map((a: any) => a.id_andamento) || [];

      if (eligibleIds.length === 0) {
        return res.status(200).json({ status: 'success', data: [] });
      }

      // Buscar OS's que já possuem fatura (para excluí-las)
      const { data: faturasExistentes } = await db
        .from('faturamento')
        .select('id_os');
      const osComFatura = new Set((faturasExistentes || []).map((f: any) => f.id_os));

      // Buscar OS's com esses status
      const { data, error } = await db
        .from('ordens_servico')
        .select(`
          id_os,
          data_entrada,
          id_andamento,
          motores (
            num_serie,
            especificacao,
            cliente (nome_razao_social)
          ),
          andamento_servico!ordens_servico_id_andamento_fkey (
            descricao_andamento
          )
        `)
        .in('id_andamento', eligibleIds)
        .order('id_os', { ascending: true });

      if (error) return next(new AppError(error.message, 500));

      // Filtrar: excluir OS's que já possuem fatura emitida
      const formatted = (data || [])
        .filter((os: any) => !osComFatura.has(os.id_os))
        .map((os: any) => ({
          id_os: os.id_os,
          data_entrada: os.data_entrada,
          andamento: os.andamento_servico?.descricao_andamento || `Status ${os.id_andamento}`,
          cliente: os.motores?.cliente?.nome_razao_social || 'N/D',
          motor: os.motores?.num_serie || '-'
        }));

      res.status(200).json({ status: 'success', data: formatted });
    } catch (error) {
      next(error);
    }
  };

  // Buscar valor total de uma ou mais OS's (soma serviços + peças + rebobinamentos)
  public getOSTotal = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = req.supabase || defaultSupabase;
      const idsParam = req.query.ids as string;

      if (!idsParam) return next(new AppError('IDs das OS são obrigatórios', 400));

      const ids = idsParam.split(',').map(Number).filter(n => !isNaN(n));
      if (ids.length === 0) return next(new AppError('IDs inválidos', 400));

      let totalGeral = 0;
      const detalhes: any[] = [];

      for (const id_os of ids) {
        // Serviços
        const { data: servicos } = await db
          .from('os_servicos')
          .select('preco')
          .eq('id_os', id_os);

        const totalServicos = (servicos || []).reduce((sum: number, s: any) => sum + (Number(s.preco) * 1.05 || 0), 0);

        // Peças
        const { data: pecas } = await db
          .from('os_pecas')
          .select('preco')
          .eq('id_os', id_os);

        const totalPecas = (pecas || []).reduce((sum: number, p: any) => sum + (Number(p.preco) * 1.205 || 0), 0);

        // Rebobinamentos
        const { data: rebob } = await db
          .from('os_rebobinamento')
          .select('preco')
          .eq('id_os', id_os);

        const totalRebob = (rebob || []).reduce((sum: number, r: any) => sum + (Number(r.preco) * 1.05 || 0), 0);

        const totalOS = totalServicos + totalPecas + totalRebob;
        totalGeral += totalOS;

        detalhes.push({
          id_os,
          total_servicos: totalServicos,
          total_pecas: totalPecas,
          total_rebobinamentos: totalRebob,
          total: totalOS
        });
      }

      res.status(200).json({
        status: 'success',
        data: { total: totalGeral, detalhes }
      });
    } catch (error) {
      next(error);
    }
  };

  // Criar fatura
  public createFaturamento = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = req.supabase || defaultSupabase;
      const { os_ids, valor_servico, data_vencimento, valor_desconto, numero_nota_fiscal } = req.body;

      if (!os_ids || !Array.isArray(os_ids) || os_ids.length === 0) {
        return next(new AppError('Pelo menos uma OS deve ser selecionada', 400));
      }

      if (!numero_nota_fiscal) {
        return next(new AppError('Número da nota fiscal é obrigatório', 400));
      }

      if (!data_vencimento) {
        return next(new AppError('Data de vencimento é obrigatória', 400));
      }

      // Inserir uma fatura para cada OS
      const faturas: any[] = [];
      const valorPorOS = Number(valor_servico) / os_ids.length;

      for (const id_os of os_ids) {
        // Verificar se a OS já possui fatura
        const { data: existing } = await db
          .from('faturamento')
          .select('id_faturamento')
          .eq('id_os', Number(id_os))
          .maybeSingle();

        if (existing) {
          return next(new AppError(`OS #${id_os} já possui fatura emitida`, 400));
        }

        const insertData = {
          id_os: Number(id_os),
          valor_servico: Number(valor_servico) / os_ids.length,
          data_vencimento,
          valor_desconto: valor_desconto ? Number(valor_desconto) / os_ids.length : 0,
          numero_nota_fiscal,
          status_pagamento: 'Pendente',
          valor_pagamento: null,
          data_pagamento: null
        };

        const { data, error } = await db
          .from('faturamento')
          .insert([insertData])
          .select()
          .single();

        if (error) return next(new AppError(error.message, 500));
        faturas.push(data);
      }

      res.status(201).json({
        status: 'success',
        message: 'Fatura(s) criada(s) com sucesso!',
        data: faturas
      });
    } catch (error) {
      next(error);
    }
  };

  // Listar faturas pendentes (não pagas e não vencidas)
  public getFaturas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = req.supabase || defaultSupabase;
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

      const { data, error } = await db
        .from('faturamento')
        .select(`
          *,
          ordens_servico!faturamento_id_os_fkey (
            id_os,
            data_entrada,
            motores (
              num_serie,
              cliente (nome_razao_social)
            )
          )
        `)
        .eq('status_pagamento', 'Pendente')
        .gte('data_vencimento', today)
        .order('data_vencimento', { ascending: true });

      if (error) return next(new AppError(error.message, 500));

      const formatted = (data || []).map((f: any) => ({
        ...f,
        cliente: f.ordens_servico?.motores?.cliente?.nome_razao_social || 'N/D',
        motor: f.ordens_servico?.motores?.num_serie || '-',
        id_os: f.ordens_servico?.id_os || f.id_os
      }));

      res.status(200).json({ status: 'success', data: formatted });
    } catch (error) {
      next(error);
    }
  };

  // Marcar fatura como paga
  public markAsPaid = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = req.supabase || defaultSupabase;
      const { id } = req.params;
      const { valor_pagamento } = req.body;

      if (!id) return next(new AppError('ID da fatura é obrigatório', 400));

      const { data, error } = await db
        .from('faturamento')
        .update({
          status_pagamento: 'Pago',
          valor_pagamento: valor_pagamento ? Number(valor_pagamento) : null,
          data_pagamento: new Date().toISOString()
        })
        .eq('id_faturamento', Number(id))
        .select()
        .single();

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  // Cancelar fatura (deletar)
  public cancelFatura = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = req.supabase || defaultSupabase;
      const { id } = req.params;

      if (!id) return next(new AppError('ID da fatura é obrigatório', 400));

      const { error } = await db
        .from('faturamento')
        .delete()
        .eq('id_faturamento', Number(id));

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({ status: 'success', message: 'Fatura cancelada com sucesso' });
    } catch (error) {
      next(error);
    }
  };

  // Relatório mensal
  public getRelatorio = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = req.supabase || defaultSupabase;
      const { mes, ano } = req.query;

      if (!mes || !ano) {
        return next(new AppError('Mês e ano são obrigatórios', 400));
      }

      const mesNum = Number(mes);
      const anoNum = Number(ano);
      const startDate = `${anoNum}-${String(mesNum).padStart(2, '0')}-01`;
      const endDate = mesNum === 12
        ? `${anoNum + 1}-01-01`
        : `${anoNum}-${String(mesNum + 1).padStart(2, '0')}-01`;

      const { data, error } = await db
        .from('faturamento')
        .select(`
          *,
          ordens_servico!faturamento_id_os_fkey (
            id_os,
            data_entrada,
            motores (
              num_serie,
              cliente (nome_razao_social)
            )
          )
        `)
        .gte('data_vencimento', startDate)
        .lt('data_vencimento', endDate)
        .order('data_vencimento', { ascending: true });

      if (error) return next(new AppError(error.message, 500));

      // Para cada fatura, buscar totais de serviços e peças
      const relatorio = [];
      for (const f of (data || [])) {
        const idOs = f.id_os;

        // Serviços
        const { data: servicos } = await db
          .from('os_servicos')
          .select('preco')
          .eq('id_os', idOs);
        const totalServicos = (servicos || []).reduce((sum: number, s: any) => sum + (Number(s.preco) * 1.05 || 0), 0);

        // Peças
        const { data: pecas } = await db
          .from('os_pecas')
          .select('preco')
          .eq('id_os', idOs);
        const totalPecas = (pecas || []).reduce((sum: number, p: any) => sum + (Number(p.preco) * 1.205 || 0), 0);

        relatorio.push({
          id_faturamento: f.id_faturamento,
          id_os: idOs,
          numero_nota_fiscal: f.numero_nota_fiscal,
          data_vencimento: f.data_vencimento,
          valor_faturamento: Number(f.valor_servico) || 0,
          valor_desconto: Number(f.valor_desconto) || 0,
          valor_total_faturamento: (Number(f.valor_servico) || 0) - (Number(f.valor_desconto) || 0),
          status_pagamento: f.status_pagamento,
          valor_pagamento: f.valor_pagamento,
          data_pagamento: f.data_pagamento,
          total_servicos: totalServicos,
          total_pecas: totalPecas,
          cliente: f.ordens_servico?.motores?.cliente?.nome_razao_social || 'N/D',
          motor: f.ordens_servico?.motores?.num_serie || '-'
        });
      }

      res.status(200).json({ status: 'success', data: relatorio });
    } catch (error) {
      next(error);
    }
  };
}
