import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../../config/supabase';
import { AppError } from '../../../middlewares/errorHandler';

export class OSItemsController {

  // Listar itens de uma OS específica
  public getItemsByOS = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id_os } = req.params;

      const { data, error } = await supabase
        .from('os_itens_servico')
        .select(`
          *,
          tipo_servico (descricao_tipo_servico),
          produtos (descricao_produto, unidade)
        `)
        .eq('id_os', Number(id_os));

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };


  // Adicionar item (serviço ou peça)
  public addItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        id_os, id_tipo_servico, id_produto,
        descricao_componente, servico_realizado,
        quantidade, valor_unitario
      } = req.body;

      const { data, error } = await supabase
        .from('os_itens_servico')
        .insert([{
          id_os: Number(id_os),
          id_tipo_servico: Number(id_tipo_servico),
          id_produto: id_produto ? Number(id_produto) : null,
          descricao_componente,
          servico_realizado,
          quantidade: Number(quantidade),
          valor_unitario: Number(valor_unitario)
        }])
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

      const { error } = await supabase
        .from('os_itens_servico')
        .delete()
        .eq('id_item_os', Number(id_item));

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({ status: 'success', message: 'Item removido com sucesso' });
    } catch (error) {
      next(error);
    }
  };

  // Listar Tipos de Serviço
  public getServiceTypes = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { data, error } = await supabase
        .from('tipo_servico')
        .select('*')
        .order('id_tipo_servico', { ascending: true });

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  // Buscar produtos/peças
  public searchProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { term } = req.query;

      if (!term) return res.status(200).json({ status: 'success', data: [] });

      const { data, error } = await supabase
        .from('produtos')
        .select('*')
        .ilike('descricao_produto', `%${term}%`)
        .limit(10);

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };
}
