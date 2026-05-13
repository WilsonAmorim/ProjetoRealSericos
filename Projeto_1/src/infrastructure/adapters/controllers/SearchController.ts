import { Request, Response, NextFunction } from 'express';
import { SearchUseCase } from '../../../application/use-cases/SearchUseCase';
import { supabase } from '../../../config/supabase';

export class SearchController {
  private searchUseCase: SearchUseCase;

  constructor() {
    this.searchUseCase = new SearchUseCase(supabase);
  }


  public search = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req.query;

      if (!query || typeof query !== 'string') {
        return res.status(400).json({ status: 'error', message: 'Query parameter is required and must be a string' });
      }

      const results = await this.searchUseCase.execute(query, req.supabase);

      res.status(200).json({
        status: 'success',
        data: results
      });
    } catch (error) {
      next(error);
    }
  };
}
