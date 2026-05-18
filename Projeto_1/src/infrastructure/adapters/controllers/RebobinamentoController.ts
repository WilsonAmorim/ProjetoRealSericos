import { Request, Response, NextFunction } from 'express';
import { supabase as defaultSupabase } from '../../../config/supabase';
import { AppError } from '../../../middlewares/errorHandler';

export class RebobinamentoController {

  public createRebobinamento = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { descricao_rebobinamento, cv, polos, preco } = req.body;
      const db = req.supabase || defaultSupabase;

      if (!descricao_rebobinamento) {
        return next(new AppError('Descrição é obrigatória', 400));
      }

      const insertData = {
        descricao_rebobinamento,
        cv: cv !== undefined && cv !== '' ? String(cv).trim() : null,
        polos: polos !== undefined && polos !== '' ? Number(polos) : null,
        preco: preco !== undefined && preco !== '' ? Number(preco) : null
      };

      const { data, error } = await db
        .from('rebobinamentos')
        .insert([insertData])
        .select()
        .single();

      if (error) return next(new AppError(error.message, 500));

      res.status(201).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  public getRebobinamentos = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const db = req.supabase || defaultSupabase;
      const { data, error } = await db
        .from('rebobinamentos')
        .select('*')
        .order('id_rebobinamento', { ascending: true });

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  public updateRebobinamento = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { descricao_rebobinamento, cv, polos, preco } = req.body;
      const db = req.supabase || defaultSupabase;

      if (!id) return next(new AppError('ID é obrigatório', 400));
      if (!descricao_rebobinamento) return next(new AppError('Descrição é obrigatória', 400));

      const updateData = {
        descricao_rebobinamento,
        cv: cv !== undefined && cv !== '' ? String(cv).trim() : null,
        polos: polos !== undefined && polos !== '' ? Number(polos) : null,
        preco: preco !== undefined && preco !== '' ? Number(preco) : null
      };

      const { data, error } = await db
        .from('rebobinamentos')
        .update(updateData)
        .eq('id_rebobinamento', Number(id))
        .select()
        .single();

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  public deleteRebobinamento = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const db = req.supabase || defaultSupabase;

      if (!id) return next(new AppError('ID é obrigatório', 400));

      const { error } = await db
        .from('rebobinamentos')
        .delete()
        .eq('id_rebobinamento', Number(id));

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({
        status: 'success',
        message: 'Rebobinamento excluído com sucesso'
      });
    } catch (error) {
      next(error);
    }
  };
}
