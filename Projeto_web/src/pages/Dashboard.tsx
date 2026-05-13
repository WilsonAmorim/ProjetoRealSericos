import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, User, Users, DollarSign, Settings, Wrench, Loader2 } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import DashboardCard from '../components/os/DashboardCard';
import logo from '../assets/logo_real.jpg';

interface ActiveOS {
  id_os: number;
  cliente: { razao_social: string };
  motor: { num_serie: string; especificacao: string };
  data_abertura: string;
  andamento: string;
}

const Dashboard: React.FC = () => {
  const { profile, loading, signOut } = useAuth();
  const navigate = useNavigate();

  const [activeOSList, setActiveOSList] = useState<ActiveOS[]>([]);
  const [isLoadingOS, setIsLoadingOS] = useState(true);

  // Nome do perfil dinâmico vindo do Contexto
  const perfilExibicao = profile?.nome_perfil || 'Usuário';

  useEffect(() => {
    const fetchActiveOS = async () => {
      setIsLoadingOS(true);
      try {
        const response = await api.get('/api/os/ativas');

        // O seu Backend atualizado já envia 'andamento' como texto.
        // Não faça mais mapeamentos manuais aqui para não confundir o React.
        setActiveOSList(response.data?.data || []);

      } catch (error) {
        console.error('Erro ao carregar fila:', error);
        setActiveOSList([]);
      } finally {
        setIsLoadingOS(false);
      }
    };

    fetchActiveOS();
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header / Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <img src={logo} alt="RealServiços" className="h-10 w-auto" />
              <span className="ml-2 text-xl font-bold text-brand-gray uppercase tracking-tight">Real Serviços</span>
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center text-sm text-gray-600 border-r pr-4 border-gray-200">
                <User className="h-4 w-4 mr-2 text-gray-400" />
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold text-gray-900">{profile?.nome || 'Usuário'}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded border border-blue-100 font-black uppercase tracking-tighter">
                    {perfilExibicao}
                  </span>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 transition-all hover:bg-red-50 rounded-full"
                title="Sair do sistema"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-8 w-full">

        {/* Grade de Módulos Principais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link to="/clientes" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
            <div className="p-3 bg-blue-50 rounded-lg w-fit mb-4 group-hover:bg-blue-600 transition-colors">
              <Users className="h-6 w-6 text-blue-600 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Clientes</h3>
            <p className="text-xs text-gray-500 mt-1">Gestão de cadastros e vínculos de motores</p>
          </Link>

          <Link to="/motores" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
            <div className="p-3 bg-orange-50 rounded-lg w-fit mb-4 group-hover:bg-orange-600 transition-colors">
              <Settings className="h-6 w-6 text-orange-600 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Motores</h3>
            <p className="text-xs text-gray-500 mt-1">Fichas técnicas e histórico de manutenção</p>
          </Link>

          {/* Restrição de Acesso Admin baseada no id_perfil (Number) */}
          {profile?.id_perfil === 1 && (
            <Link to="/faturamento" className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group">
              <div className="p-3 bg-emerald-50 rounded-lg w-fit mb-4 group-hover:bg-emerald-600 transition-colors">
                <DollarSign className="h-6 w-6 text-emerald-600 group-hover:text-white" />
              </div>
              <h3 className="font-bold text-gray-900">Faturamento</h3>
              <p className="text-xs text-gray-500 mt-1">Fluxo de caixa e ordens concluídas</p>
            </Link>
          )}
        </div>

        {/* Seção da Fila de Trabalho */}
        <section className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-8 border-b pb-4 border-gray-100">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Wrench className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">Fila de Trabalho</h2>
                <p className="text-xs text-gray-400">Ordens de serviço em andamento na oficina</p>
              </div>
            </div>
            <div className="px-4 py-1.5 bg-brand-blue text-white rounded-full text-xs font-bold shadow-sm">
              {activeOSList.length} ATIVAS
            </div>
          </div>

          {isLoadingOS ? (
            <div className="flex flex-col items-center justify-center py-24">
              <Loader2 className="h-12 w-12 text-brand-blue animate-spin mb-4 opacity-20" />
              <p className="text-sm text-gray-400 animate-pulse font-medium">Sincronizando dados...</p>
            </div>
          ) : activeOSList.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl py-24 flex flex-col items-center text-center px-4">
              <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                <Wrench className="h-10 w-10 text-gray-200" />
              </div>
              <p className="text-lg font-bold text-gray-700">Oficina em dia!</p>
              <p className="text-sm text-gray-400 max-w-xs mt-2">
                Não há ordens de serviço pendentes ou em execução no momento.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeOSList.map((os) => (
                <DashboardCard key={os.id_os} os={os as any} />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Dashboard;