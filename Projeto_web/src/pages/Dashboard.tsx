import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, LayoutDashboard, User, Users, DollarSign, Settings, Wrench, Loader2, RotateCw, Edit, Trash2, Plus, X } from 'lucide-react';
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

  // Rebobinamentos states
  const [isRebobinamentosOpen, setIsRebobinamentosOpen] = useState(false);
  const [rebobinamentosList, setRebobinamentosList] = useState<any[]>([]);
  const [isLoadingRebobinamentos, setIsLoadingRebobinamentos] = useState(false);
  const [descricao, setDescricao] = useState('');
  const [cv, setCv] = useState('');
  const [polos, setPolos] = useState('');
  const [preco, setPreco] = useState('');
  const [editingItem, setEditingItem] = useState<any | null>(null);
  const [isSavingRebobinamentos, setIsSavingRebobinamentos] = useState(false);

  const clearForm = () => {
    setDescricao('');
    setCv('');
    setPolos('');
    setPreco('');
    setEditingItem(null);
  };

  const fetchRebobinamentos = async () => {
    setIsLoadingRebobinamentos(true);
    try {
      const response = await api.get('/api/rebobinamentos');
      setRebobinamentosList(response.data?.data || []);
    } catch (error) {
      console.error('Erro ao carregar rebobinamentos:', error);
    } finally {
      setIsLoadingRebobinamentos(false);
    }
  };

  useEffect(() => {
    if (isRebobinamentosOpen) {
      fetchRebobinamentos();
    }
  }, [isRebobinamentosOpen]);

  const handleSubmitRebobinamento = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descricao.trim()) return;

    setIsSavingRebobinamentos(true);
    const payload = {
      descricao_rebobinamento: descricao.trim(),
      cv: cv.trim() !== '' ? cv.trim() : null,
      polos: polos.trim() !== '' ? Number(polos) : null,
      preco: preco.trim() !== '' ? Number(preco.replace(',', '.')) : null
    };

    try {
      if (editingItem) {
        // Edit mode
        await api.put(`/api/rebobinamentos/${editingItem.id_rebobinamento}`, payload);
      } else {
        // Create mode
        await api.post('/api/rebobinamentos', payload);
      }
      clearForm();
      await fetchRebobinamentos();
    } catch (error) {
      console.error('Erro ao salvar rebobinamento:', error);
      alert('Erro ao salvar rebobinamento.');
    } finally {
      setIsSavingRebobinamentos(false);
    }
  };

  const handleEditRebobinamento = (item: any) => {
    setEditingItem(item);
    setDescricao(item.descricao_rebobinamento || '');
    setCv(item.cv !== null && item.cv !== undefined ? String(item.cv) : '');
    setPolos(item.polos !== null && item.polos !== undefined ? String(item.polos) : '');
    setPreco(item.preco !== null && item.preco !== undefined ? String(item.preco) : '');
  };

  const handleDeleteRebobinamento = async (id: number) => {
    if (!confirm('Deseja realmente excluir este tipo de rebobinamento?')) return;

    try {
      await api.delete(`/api/rebobinamentos/${id}`);
      if (editingItem?.id_rebobinamento === id) {
        clearForm();
      }
      await fetchRebobinamentos();
    } catch (error) {
      console.error('Erro ao excluir rebobinamento:', error);
      alert('Erro ao excluir rebobinamento.');
    }
  };

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

          <button
            onClick={() => setIsRebobinamentosOpen(true)}
            className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group text-left w-full outline-none"
          >
            <div className="p-3 bg-purple-50 rounded-lg w-fit mb-4 group-hover:bg-purple-600 transition-colors">
              <RotateCw className="h-6 w-6 text-purple-600 group-hover:text-white" />
            </div>
            <h3 className="font-bold text-gray-900">Rebobinamentos</h3>
            <p className="text-xs text-gray-500 mt-1">Cadastro e alteração de tipos de rebobinamento</p>
          </button>
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

      {/* Modal Rebobinamentos */}
      {isRebobinamentosOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300">
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div className="flex items-center space-x-2">
                <RotateCw className="h-5 w-5 text-purple-600 animate-spin" style={{ animationDuration: '3s' }} />
                <h3 className="text-lg font-bold text-gray-800">Tipos de Rebobinamento</h3>
              </div>
              <button
                onClick={() => {
                  setIsRebobinamentosOpen(false);
                  clearForm();
                }}
                className="p-1.5 hover:bg-gray-200/60 rounded-lg transition-colors text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content Area */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              
              {/* Form */}
              <form onSubmit={handleSubmitRebobinamento} className="bg-purple-50/30 border border-purple-100 p-4 rounded-xl space-y-4">
                <label className="block text-xs font-bold text-purple-700 uppercase tracking-wider">
                  {editingItem ? 'Editar Tipo de Rebobinamento' : 'Novo Tipo de Rebobinamento'}
                </label>
                
                <div className="space-y-3">
                  {/* Row 1: Descricao */}
                  <div>
                    <span className="block text-xs font-bold text-gray-500 mb-1">Descrição</span>
                    <input
                      type="text"
                      required
                      maxLength={100}
                      placeholder="Ex: Rebobinamento Estator, Classe H, etc..."
                      value={descricao}
                      onChange={(e) => setDescricao(e.target.value)}
                      disabled={isSavingRebobinamentos}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all disabled:opacity-50"
                    />
                  </div>

                  {/* Row 2: CV, Polos, Preco */}
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <span className="block text-xs font-bold text-gray-500 mb-1">Potência (CV)</span>
                      <input
                        type="text"
                        placeholder="Ex: 5.5 ou 1/2"
                        value={cv}
                        onChange={(e) => setCv(e.target.value)}
                        disabled={isSavingRebobinamentos}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-500 mb-1">Polos</span>
                      <input
                        type="number"
                        placeholder="Ex: 4"
                        value={polos}
                        onChange={(e) => setPolos(e.target.value)}
                        disabled={isSavingRebobinamentos}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-500 mb-1">Preço (R$)</span>
                      <input
                        type="text"
                        placeholder="Ex: 1250,00"
                        value={preco}
                        onChange={(e) => setPreco(e.target.value)}
                        disabled={isSavingRebobinamentos}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none transition-all disabled:opacity-50"
                      />
                    </div>
                  </div>

                  {/* Row 3: Action Buttons */}
                  <div className="flex justify-end space-x-2 pt-2">
                    {editingItem && (
                      <button
                        type="button"
                        onClick={clearForm}
                        className="px-4 py-2 bg-gray-100 text-gray-600 font-bold rounded-lg text-sm hover:bg-gray-200 transition-colors"
                      >
                        Cancelar
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={isSavingRebobinamentos || !descricao.trim()}
                      className="px-6 py-2 bg-purple-600 text-white font-bold rounded-lg text-sm hover:bg-purple-700 active:bg-purple-800 transition-colors disabled:opacity-50 flex items-center space-x-1.5 shadow-sm"
                    >
                      {isSavingRebobinamentos ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : editingItem ? (
                        <span>Atualizar</span>
                      ) : (
                        <>
                          <Plus className="h-4 w-4" />
                          <span>Adicionar</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest">Tipos Cadastrados</h4>
                
                {isLoadingRebobinamentos ? (
                  <div className="py-12 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 text-purple-600 animate-spin opacity-40" />
                  </div>
                ) : rebobinamentosList.length === 0 ? (
                  <div className="py-12 border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center text-center px-4 bg-gray-50/50">
                    <RotateCw className="h-8 w-8 text-gray-300 mb-2" />
                    <p className="text-sm font-semibold text-gray-500">Nenhum tipo cadastrado</p>
                    <p className="text-xs text-gray-400 mt-0.5">Use o formulário acima para adicionar.</p>
                  </div>
                ) : (
                  <div className="border border-gray-100 rounded-xl overflow-hidden bg-white shadow-sm">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50/75 border-b border-gray-100 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                          <th className="px-4 py-3 font-bold">Descrição</th>
                          <th className="px-4 py-3 font-bold text-center">CV</th>
                          <th className="px-4 py-3 font-bold text-center">Polos</th>
                          <th className="px-4 py-3 font-bold text-right">Preço</th>
                          <th className="px-4 py-3 font-bold text-center w-24">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {rebobinamentosList.map((item) => (
                          <tr key={item.id_rebobinamento} className="hover:bg-gray-50/50 transition-colors group">
                            <td className="px-4 py-3 text-sm font-medium text-gray-700 break-words max-w-[200px]">
                              {item.descricao_rebobinamento}
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-500 text-center">
                              {item.cv !== null && item.cv !== undefined ? `${item.cv} CV` : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-500 text-center">
                              {item.polos !== null && item.polos !== undefined ? `${item.polos}P` : '-'}
                            </td>
                            <td className="px-4 py-3 text-sm font-bold text-gray-800 text-right">
                              {item.preco !== null && item.preco !== undefined ? (
                                Number(item.preco).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                              ) : '-'}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex items-center justify-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  type="button"
                                  onClick={() => handleEditRebobinamento(item)}
                                  className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                                  title="Editar"
                                >
                                  <Edit className="h-4 w-4" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRebobinamento(item.id_rebobinamento)}
                                  className="p-1.5 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                  title="Excluir"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;