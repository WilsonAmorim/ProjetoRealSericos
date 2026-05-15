import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Package, Plus, Trash2,
    ClipboardList, Wrench, Loader2, Save,
    Settings, Box
} from 'lucide-react';
import api from '../services/api';

interface OSServico {
    id_osservicos: number;
    id_os: number;
    preco: number;
    id_servico: number;
    servico?: { descricao_servico: string };
}

interface OSPeca {
    id_ospecas: number;
    id_os: number;
    preco: number;
    id_pecas: number;
    pecas?: { descricao_pecas: string };
}

const OSServiceTracking: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [osData, setOsData] = useState<any>(null);
    
    const [osServicos, setOsServicos] = useState<OSServico[]>([]);
    const [osPecas, setOsPecas] = useState<OSPeca[]>([]);
    
    const [serviceTypes, setServiceTypes] = useState<any[]>([]);
    const [pecasList, setPecasList] = useState<any[]>([]);

    // Tabs
    const [activeTab, setActiveTab] = useState<'servicos' | 'pecas'>('servicos');

    // Form states
    const [idServico, setIdServico] = useState('');
    const [idPecas, setIdPecas] = useState('');
    const [valorUnitario, setValorUnitario] = useState('0');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [osRes, itemsRes, typesRes, pecasRes] = await Promise.all([
                    api.get(`/api/os/${id}`),
                    api.get(`/api/os-itens/${id}`),
                    api.get('/api/os-itens/tipos-servico'),
                    api.get('/api/os-itens/pecas')
                ]);

                setOsData(osRes.data.data);
                setOsServicos(itemsRes.data.data.servicos);
                setOsPecas(itemsRes.data.data.pecas);
                setServiceTypes(typesRes.data.data);
                setPecasList(pecasRes.data.data);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newItem = {
                id_os: id,
                id_servico: activeTab === 'servicos' ? Number(idServico) : null,
                id_pecas: activeTab === 'pecas' ? Number(idPecas) : null,
                preco: Number(valorUnitario)
            };

            await api.post('/api/os-itens', newItem);

            // Recarrega itens
            const itemsRes = await api.get(`/api/os-itens/${id}`);
            setOsServicos(itemsRes.data.data.servicos);
            setOsPecas(itemsRes.data.data.pecas);

            // Limpa form
            setIdServico('');
            setIdPecas('');
            setValorUnitario('0');
        } catch (error) {
            console.error('Erro ao adicionar item:', error);
            alert('Erro ao adicionar item.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveItem = async (idItem: number, type: 'servico' | 'peca') => {
        if (!confirm('Deseja remover este item?')) return;
        try {
            await api.delete(`/api/os-itens/${idItem}?type=${type}`);
            
            if (type === 'servico') {
                setOsServicos(osServicos.filter(i => i.id_osservicos !== idItem));
            } else {
                setOsPecas(osPecas.filter(i => i.id_ospecas !== idItem));
            }
        } catch (error) {
            console.error('Erro ao remover item:', error);
        }
    };

    const totalServicos = osServicos.reduce((acc, item) => acc + Number(item.preco), 0);
    const totalPecas = osPecas.reduce((acc, item) => acc + Number(item.preco), 0);
    const totalOS = totalServicos + totalPecas;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="h-10 w-10 text-brand-blue animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-6xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center space-x-4">
                        <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                            <ChevronLeft className="h-6 w-6 text-gray-500" />
                        </button>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800 flex items-center">
                                <Package className="h-5 w-5 mr-2 text-brand-blue" />
                                Acompanhamento de O.S. #{id}
                            </h1>
                            <p className="text-sm text-gray-500 font-medium mt-1">
                                {osData?.cliente?.razao_social} | {osData?.motor?.num_serie}
                            </p>
                        </div>
                    </div>
                    <div className="bg-brand-blue/5 border border-brand-blue/10 px-4 py-2 rounded-lg text-right">
                        <p className="text-[10px] font-bold text-brand-blue uppercase tracking-wider">Total da Manutenção</p>
                        <p className="text-2xl font-black text-brand-blue">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOS)}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Add Item Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            
                            {/* Tabs Header */}
                            <div className="flex border-b border-gray-200 bg-gray-50">
                                <button
                                    onClick={() => setActiveTab('servicos')}
                                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center transition-colors ${
                                        activeTab === 'servicos'
                                            ? 'text-brand-blue border-b-2 border-brand-blue bg-white'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                                >
                                    <Settings className="h-4 w-4 mr-2" />
                                    Serviços
                                </button>
                                <button
                                    onClick={() => setActiveTab('pecas')}
                                    className={`flex-1 py-4 text-sm font-bold flex items-center justify-center transition-colors ${
                                        activeTab === 'pecas'
                                            ? 'text-brand-blue border-b-2 border-brand-blue bg-white'
                                            : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                                    }`}
                                >
                                    <Box className="h-4 w-4 mr-2" />
                                    Peças
                                </button>
                            </div>

                            <div className="p-6">
                                <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                    <Plus className="h-5 w-5 mr-2 text-brand-blue" />
                                    {activeTab === 'servicos' ? 'Lançar Serviço' : 'Lançar Peça'}
                                </h2>

                                <form onSubmit={handleAddItem} className="space-y-4">
                                    
                                    {activeTab === 'servicos' && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo de Serviço</label>
                                            <select
                                                required
                                                value={idServico}
                                                onChange={(e) => setIdServico(e.target.value)}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                                            >
                                                <option value="">Selecione um serviço...</option>
                                                {serviceTypes.map(t => (
                                                    <option key={t.id_servico} value={t.id_servico}>{t.descricao_servico}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {activeTab === 'pecas' && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Peça (Estoque)</label>
                                            <select
                                                required
                                                value={idPecas}
                                                onChange={(e) => setIdPecas(e.target.value)}
                                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                                            >
                                                <option value="">Selecione uma peça...</option>
                                                {pecasList.map(p => (
                                                    <option key={p.id_pecas} value={p.id_pecas}>{p.descricao_pecas}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Valor / Preço</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-400 text-xs font-bold">R$</span>
                                            </div>
                                            <input
                                                type="number"
                                                required
                                                step="0.01"
                                                min="0"
                                                value={valorUnitario}
                                                onChange={(e) => setValorUnitario(e.target.value)}
                                                className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full mt-4 flex items-center justify-center space-x-2 py-3 bg-brand-blue text-white rounded-lg font-bold hover:bg-brand-blue-dark transition-colors disabled:opacity-50"
                                    >
                                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                            <>
                                                <Save className="h-5 w-5" />
                                                <span>{activeTab === 'servicos' ? 'Lançar Serviço' : 'Lançar Peça'}</span>
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Summary per Tab */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden min-h-[400px]">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                    <ClipboardList className="h-5 w-5 mr-2 text-brand-blue" />
                                    {activeTab === 'servicos' ? 'Resumo de Serviços' : 'Resumo de Peças'}
                                </h2>
                                <div className="flex flex-col items-end">
                                    <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest">
                                        {activeTab === 'servicos' ? osServicos.length : osPecas.length} ITENS
                                    </span>
                                    <span className="text-xs font-bold text-brand-blue mt-1">
                                        Total: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(activeTab === 'servicos' ? totalServicos : totalPecas)}
                                    </span>
                                </div>
                            </div>

                            {activeTab === 'servicos' ? (
                                osServicos.length === 0 ? (
                                    <EmptyState message="Nenhum serviço lançado." />
                                ) : (
                                    <ItemsTable 
                                        items={osServicos} 
                                        type="servico" 
                                        onRemove={(id) => handleRemoveItem(id, 'servico')} 
                                    />
                                )
                            ) : (
                                osPecas.length === 0 ? (
                                    <EmptyState message="Nenhuma peça lançada." />
                                ) : (
                                    <ItemsTable 
                                        items={osPecas} 
                                        type="peca" 
                                        onRemove={(id) => handleRemoveItem(id, 'peca')} 
                                    />
                                )
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const EmptyState: React.FC<{ message: string }> = ({ message }) => (
    <div className="p-12 text-center h-full flex flex-col items-center justify-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
            <Wrench className="h-8 w-8 text-gray-300" />
        </div>
        <h3 className="text-gray-500 font-medium">{message}</h3>
        <p className="text-gray-400 text-sm mt-1">Utilize o formulário ao lado para começar.</p>
    </div>
);

const ItemsTable: React.FC<{ items: any[], type: 'servico' | 'peca', onRemove: (id: number) => void }> = ({ items, type, onRemove }) => (
    <div className="overflow-x-auto">
        <table className="w-full text-left">
            <thead>
                <tr className="bg-gray-50/50">
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Descrição</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Preço</th>
                    <th className="px-6 py-4 text-center"></th>
                </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
                {items.map((item) => (
                    <tr key={type === 'servico' ? item.id_osservicos : item.id_ospecas} className="hover:bg-gray-50/50 transition-colors group">
                        <td className="px-6 py-4">
                            <p className="text-sm font-semibold text-gray-800">
                                {type === 'servico' ? item.servico?.descricao_servico : item.pecas?.descricao_pecas}
                            </p>
                        </td>
                        <td className="px-6 py-4 text-right text-sm font-bold text-gray-800">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)}
                        </td>
                        <td className="px-6 py-4 text-center">
                            <button
                                onClick={() => onRemove(type === 'servico' ? item.id_osservicos : item.id_ospecas)}
                                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

export default OSServiceTracking;
