import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../../config/supabase';
import { AppError } from '../../../middlewares/errorHandler';

export class OSItemsController {

  // Listar itens de uma OS específica (Serviços, Peças e Rebobinamentos separados)
  public getItemsByOS = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id_os } = req.params;

      // 1. Buscar Serviços
      const { data: servicosData, error: sErr } = await supabase
        .from('os_servicos')
        .select(`
          *,
          servico (descricao_servico)
        `)
        .eq('id_os', Number(id_os));

      if (sErr) return next(new AppError(sErr.message, 500));

      // 2. Buscar Peças
      const { data: pecasData, error: pErr } = await supabase
        .from('os_pecas')
        .select(`
          *,
          pecas (descricao_pecas)
        `)
        .eq('id_os', Number(id_os));

      if (pErr) return next(new AppError(pErr.message, 500));

      // 3. Buscar Rebobinamento
      const { data: rebobinamentosData, error: rErr } = await supabase
        .from('os_rebobinamento')
        .select(`
          *,
          rebobinamentos (descricao_rebobinamento)
        `)
        .eq('id_os', Number(id_os));

      if (rErr) return next(new AppError(rErr.message, 500));

      res.status(200).json({ 
        status: 'success', 
        data: {
          servicos: servicosData,
          pecas: pecasData,
          rebobinamentos: rebobinamentosData
        }
      });
    } catch (error) {
      next(error);
    }
  };


  // Adicionar item (serviço, peça ou rebobinamento)
  public addItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        id_os, id_servico, id_pecas, id_rebobinamento,
        preco, quantidade // Adicionando quantidade caso exista na tabela
      } = req.body;

      let table = '';
      let insertData: any = {
        id_os: Number(id_os),
        preco: Number(preco)
      };

      if (id_servico) {
        table = 'os_servicos';
        insertData.id_servico = Number(id_servico);
      } else if (id_pecas) {
        table = 'os_pecas';
        insertData.id_pecas = Number(id_pecas);
        // Note: Se a tabela os_pecas tiver 'quantidade', deve ser enviada
      } else if (id_rebobinamento) {
        table = 'os_rebobinamento';
        insertData.id_rebobinamento = Number(id_rebobinamento);
      } else {
        return next(new AppError('id_servico, id_pecas ou id_rebobinamento deve ser informado', 400));
      }

      const { data, error } = await supabase
        .from(table)
        .insert([insertData])
        .select()
        .single();

      if (error) return next(new AppError(error.message, 500));

      res.status(201).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  // Remover item
  public removeItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id_item } = req.params;
      const { type } = req.query; // 'servico', 'peca' ou 'rebobinamento'

      if (!type) return next(new AppError('Tipo (servico/peca/rebobinamento) não informado', 400));

      let table = '';
      let idColumn = '';

      if (type === 'servico') {
        table = 'os_servicos';
        idColumn = 'id_osservicos';
      } else if (type === 'peca') {
        table = 'os_pecas';
        idColumn = 'id_ospecas';
      } else if (type === 'rebobinamento') {
        table = 'os_rebobinamento';
        idColumn = 'id_osrebobinamento';
      } else {
        return next(new AppError('Tipo inválido', 400));
      }

      const { error } = await supabase
        .from(table)
        .delete()
        .eq(idColumn, Number(id_item));

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({ status: 'success', message: 'Item removido com sucesso' });
    } catch (error) {
      next(error);
    }
  };

  // Listar Serviços (Dropdown)
  public getServiceTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await supabase
        .from('servico')
        .select('*')
        .order('id_servico', { ascending: true });

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  // Buscar peças
  public searchPecas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { term } = req.query;

      if (!term) return res.status(200).json({ status: 'success', data: [] });

      const { data, error } = await supabase
        .from('pecas')
        .select('*')
        .ilike('descricao_pecas', `%${term}%`)
        .limit(10);

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  // Listar todas as peças para o comboBox
  public getAllPecas = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await supabase
        .from('pecas')
        .select('*')
        .order('descricao_pecas', { ascending: true });

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  // Atualizar item (preço)
  public updateItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id_item } = req.params;
      const { type } = req.query; // 'servico', 'peca' ou 'rebobinamento'
      const { preco } = req.body;

      if (!type) return next(new AppError('Tipo (servico/peca/rebobinamento) não informado', 400));
      if (preco === undefined) return next(new AppError('Preço não informado', 400));

      let table = '';
      let idColumn = '';

      if (type === 'servico') {
        table = 'os_servicos';
        idColumn = 'id_osservicos';
      } else if (type === 'peca') {
        table = 'os_pecas';
        idColumn = 'id_ospecas';
      } else if (type === 'rebobinamento') {
        table = 'os_rebobinamento';
        idColumn = 'id_osrebobinamento';
      } else {
        return next(new AppError('Tipo inválido', 400));
      }

      const { data, error } = await supabase
        .from(table)
        .update({ preco: Number(preco) })
        .eq(idColumn, Number(id_item))
        .select()
        .single();

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };
}

