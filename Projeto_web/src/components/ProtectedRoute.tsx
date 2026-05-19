import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: number; // Mudamos para number para bater com o banco
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { profile, loading } = useAuth();
  const location = useLocation();

  // 1. Enquanto o AuthContext busca o perfil, mostramos um loading amigável
  // ISSO EVITA O REDIRECT PRECOCE
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
      </div>
    );
  }

  // 2. Se não houver perfil após o carregamento, tchau!
  if (!profile) {
    console.warn("Acesso negado: Perfil não encontrado.");
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Verificação de Role (Garantindo que ambos sejam tratados como números)
  if (requiredRole !== undefined) {
    const userRole = Number(profile.id_perfil);
    const needed = Number(requiredRole);
    console.log(`[ProtectedRoute] userRole=${userRole} (type: ${typeof profile.id_perfil}, raw: ${profile.id_perfil}), needed=${needed}`);
    if (userRole !== needed) {
      console.error("Acesso negado: Role insuficiente.");
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <>{children}</>;
};

export default ProtectedRoute;