import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, DollarSign } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Faturamento: React.FC = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 border border-gray-100 text-center">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-emerald-100 rounded-full">
            <DollarSign className="h-10 w-10 text-emerald-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-brand-gray mb-2">Módulo de Faturamento</h1>
        <p className="text-gray-500 mb-8">
          Acesso concedido para o perfil: <span className="font-bold text-emerald-600 uppercase">{profile?.id_perfil}</span>
        </p>
        
        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-lg mb-8 text-left">
          <p className="text-emerald-800 text-sm italic">
            "Este módulo é restrito a administradores e pessoal financeiro. Aqui são geradas as notas e baixas de pagamento."
          </p>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center text-sm font-medium text-brand-blue hover:underline"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Voltar para o Dashboard
        </button>
      </div>
    </div>
  );
};

export default Faturamento;
