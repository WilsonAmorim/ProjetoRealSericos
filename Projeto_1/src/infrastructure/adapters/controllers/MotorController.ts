import { Request, Response, NextFunction } from 'express';
import { supabase } from '../../../config/supabase';
import { AppError } from '../../../middlewares/errorHandler';

export class MotorController {

  // Listar Motores (Filtro por id_cliente integrado)
  public getMotores = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // 1. Pegamos o id_cliente da query
      const { id_cliente } = req.query;

      let query = supabase
        .from('motores')
        .select('*, cliente(*)');


      // 2. Filtro Rigoroso
      if (id_cliente && id_cliente !== 'undefined' && id_cliente !== 'null') {
        const idNum = parseInt(String(id_cliente), 10);

        if (!isNaN(idNum)) {
          // Forçamos o filtro com o número exato
          query = query.eq('id_cliente', idNum);
        }
      }

      const { data, error } = await query;

      if (error) {
        console.error('Erro Supabase:', error);
        return next(new AppError(error.message, 500));
      }

      // 3. Log para você ver no terminal do VS Code exatamente o que o banco achou
      console.log(`Busca concluída. Cliente ID: ${id_cliente} | Encontrados: ${data?.length || 0}`);

      res.status(200).json({
        status: 'success',
        data: data ?? []
      });
    } catch (error) {
      next(error);
    }
  };

  // Criar Motor
  public createMotor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const motorData = req.body;

      if (!motorData.id_cliente || !motorData.num_serie) {
        return next(new AppError('ID do Cliente e Nº de Série são obrigatórios', 400));
      }

      const { data, error } = await supabase
        .from('motores')
        .insert([motorData])
        .select()
        .single();

      if (error) return next(new AppError(error.message, 500));

      res.status(201).json({ status: 'success', data });
    } catch (error) {
      next(error);
    }
  };

  // Atualizar Motor
  public updateMotor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      // 1. Extraímos os campos que NÃO devem ir para o banco.
      // O campo 'cliente' vem do frontend como um objeto { nome, etc }, 
      // precisamos tirá-lo do updateData para evitar o erro de schema cache.
      const {
        id_motor,
        data_criacao,
        created_at,
        cliente, // <--- ADICIONE ISSO AQUI
        ...updateData
      } = req.body;

      // 2. Realizamos o update apenas com dados puros da tabela 'motores'
      const { data, error } = await supabase
        .from('motores')
        .update(updateData)
        .eq('id_motor', id)
        .select('*, cliente(*)') // Retorna o motor com os dados do cliente atualizados
        .single();

      if (error) {
        console.error('Erro Supabase Update:', error);
        return next(new AppError(error.message, 500));
      }

      res.status(200).json({
        status: 'success',
        data
      });
    } catch (error) {
      next(error);
    }
  };

  // Deletar Motor
  public deleteMotor = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { error } = await supabase.from('motores').delete().eq('id_motor', id);

      if (error) return next(new AppError(error.message, 500));

      res.status(200).json({ status: 'success', message: 'Motor excluído com sucesso' });
    } catch (error) {
      next(error);
    }
  };
}