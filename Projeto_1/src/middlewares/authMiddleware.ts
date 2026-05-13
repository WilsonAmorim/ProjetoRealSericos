import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from './errorHandler';
import { createClient } from '@supabase/supabase-js';

// Extend Express Request to include user data
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        id_perfil?: number;
      };
      supabase?: import('@supabase/supabase-js').SupabaseClient;
    }
  }
}

export const authenticateUser = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('No token provided', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    // Step 1: Validate the token using the default supabase client (auth is not affected by RLS)
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return next(new AppError('Invalid token', 401));
    }

    // Step 2: Create authenticated client with the user's token BEFORE querying data
    // This is required because RLS on 'usuarios' only allows users to read their own row
    const userClient = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: { Authorization: `Bearer ${token}` }
        }
      }
    );

    // Step 3: Fetch the user profile
    const { data: userProfile, error: profileError } = await userClient
      .from('usuarios')
      .select('id_perfil, ativo')
      .eq('id_usuario', user.id)
      .single();

    // MODO DE EMERGÊNCIA NO BACKEND
    if (profileError || !userProfile) {
      if (user.id === '987b663b-b1e5-44c5-a873-6ee4e52eec0f') {
        console.warn('⚠️ Emergência Backend: Ignorando erro de perfil para Wilson');
        req.user = { id: user.id, id_perfil: 1 }; // Força Admin
        req.supabase = userClient;
        return next();
      }
      return next(new AppError('User profile not found', 404));
    }

    req.user = {
      id: user.id,
      id_perfil: userProfile.id_perfil
    };
    req.supabase = userClient;

    next();
  } catch (err) {
    console.error('Auth middleware unexpected error:', err);
    return next(new AppError('Authentication error', 500));
  }
};

export const requireRoles = (roles: number[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !req.user.id_perfil) {
      return next(new AppError('Unauthorized access', 403));
    }

    if (!roles.includes(req.user.id_perfil)) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

// Map of Profile Names to IDs based on your setup (assumed standard IDs)
// 1 = Administrador, 2 = Recepcao, 3 = Mecanico, 4 = Eletricista
export const Roles = {
  ADMIN: 1,
  RECEPCO: 2,
  MECANICO: 3,
  ELETRICISTA: 4
};
