import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft, Package, Plus, Trash2,
    ClipboardList, Wrench, Search, Loader2, Save
} from 'lucide-react';
import api from '../services/api';

interface OSItem {
    id_item_os: number;
    id_tipo_servico: number;
    id_produto?: number;
    descricao_componente: string;
    servico_realizado: string;
    quantidade: number;
    valor_unitario: number;
    tipo_servico?: { descricao_tipo_servico: string };
    produtos?: { descricao_produto: string; unidade: string };
}


const OSServiceTracking: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [osData, setOsData] = useState<any>(null);
    const [items, setItems] = useState<OSItem[]>([]);
    const [serviceTypes, setServiceTypes] = useState<any[]>([]);

    // Form states
    const [idTipoServico, setIdTipoServico] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [productsResult, setProductsResult] = useState<any[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<any>(null);
    const [descricaoComponente, setDescricaoComponente] = useState('');
    const [servicoRealizado, setServicoRealizado] = useState('');
    const [quantidade, setQuantidade] = useState('1');
    const [valorUnitario, setValorUnitario] = useState('0');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [osRes, itemsRes, typesRes] = await Promise.all([
                    api.get(`/api/os/${id}`),
                    api.get(`/api/os-itens/${id}`),
                    api.get('/api/os-itens/tipos-servico')
                ]);

                setOsData(osRes.data.data);
                setItems(itemsRes.data.data);
                setServiceTypes(typesRes.data.data);
            } catch (error) {
                console.error('Erro ao buscar dados:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleSearchProduct = async (term: string) => {
        setSearchTerm(term);
        if (term.length < 2) {
            setProductsResult([]);
            return;
        }
        try {
            const res = await api.get(`/api/os-itens/produtos/busca?term=${term}`);
            setProductsResult(res.data.data);
        } catch (error) {
            console.error('Erro na busca de produtos:', error);
        }
    };

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newItem = {
                id_os: id,
                id_tipo_servico: Number(idTipoServico),
                id_produto: selectedProduct?.id_produto || null,
                descricao_componente: descricaoComponente,
                servico_realizado: servicoRealizado,
                quantidade: Number(quantidade),
                valor_unitario: Number(valorUnitario)
            };

            await api.post('/api/os-itens', newItem);

            // Recarrega itens
            const itemsRes = await api.get(`/api/os-itens/${id}`);
            setItems(itemsRes.data.data);

            // Limpa form
            setIdTipoServico('');
            setSearchTerm('');
            setSelectedProduct(null);
            setDescricaoComponente('');
            setServicoRealizado('');
            setQuantidade('1');
            setValorUnitario('0');
        } catch (error) {
            console.error('Erro ao adicionar item:', error);
            alert('Erro ao adicionar item.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleRemoveItem = async (idItem: number) => {
        if (!confirm('Deseja remover este item?')) return;
        try {
            await api.delete(`/api/os-itens/${idItem}`);
            setItems(items.filter(i => i.id_item_os !== idItem));
        } catch (error) {
            console.error('Erro ao remover item:', error);
        }
    };

    const totalOS = items.reduce((acc, item) => acc + (item.quantidade * item.valor_unitario), 0);

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
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
                                <Plus className="h-5 w-5 mr-2 text-brand-blue" />
                                Lançar Serviço/Peça
                            </h2>

                            <form onSubmit={handleAddItem} className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Tipo de Serviço</label>
                                    <select
                                        required
                                        value={idTipoServico}
                                        onChange={(e) => setIdTipoServico(e.target.value)}
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                                    >
                                        <option value="">Selecione...</option>
                                        {serviceTypes.map(t => (
                                            <option key={t.id_tipo_servico} value={t.id_tipo_servico}>{t.descricao_tipo_servico}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center justify-between">
                                        <span>Produto / Peça</span>
                                        <span className="text-[10px] lowercase font-normal text-gray-400">(opcional)</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="h-4 w-4 text-gray-400" />
                                        </div>
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => handleSearchProduct(e.target.value)}
                                            placeholder="Buscar peça no estoque..."
                                            className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                                        />
                                        {productsResult.length > 0 && (
                                            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                                                {productsResult.map(p => (
                                                    <button
                                                        key={p.id_produto}
                                                        type="button"
                                                        onClick={() => {
                                                            setSelectedProduct(p);
                                                            setSearchTerm(p.descricao_produto);
                                                            setProductsResult([]);
                                                        }}
                                                        className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                                    >
                                                        <p className="font-medium text-gray-700">{p.descricao_produto}</p>
                                                        <p className="text-[10px] text-gray-400 uppercase tracking-tighter">{p.referencia} | {p.fabricante}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descrição do Componente</label>
                                    <input
                                        type="text"
                                        required
                                        value={descricaoComponente}
                                        onChange={(e) => setDescricaoComponente(e.target.value)}
                                        placeholder="Ex: Rolamento Dianteiro"
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Serviço Realizado</label>
                                    <textarea
                                        required
                                        rows={2}
                                        value={servicoRealizado}
                                        onChange={(e) => setServicoRealizado(e.target.value)}
                                        placeholder="O que foi feito?"
                                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Qtd</label>
                                        <input
                                            type="number"
                                            required
                                            value={quantidade}
                                            onChange={(e) => setQuantidade(e.target.value)}
                                            className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Valor Unit.</label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <span className="text-gray-400 text-xs font-bold">R$</span>
                                            </div>
                                            <input
                                                type="number"
                                                required
                                                step="0.01"
                                                value={valorUnitario}
                                                onChange={(e) => setValorUnitario(e.target.value)}
                                                className="w-full pl-9 p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                                            />
                                        </div>
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
                                            <span>Lançar Item</span>
                                        </>
                                    )}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Items List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
                                <h2 className="text-lg font-bold text-gray-800 flex items-center">
                                    <ClipboardList className="h-5 w-5 mr-2 text-brand-blue" />
                                    Resumo da Manutenção
                                </h2>
                                <span className="bg-gray-100 text-gray-500 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-widest">
                                    {items.length} ITENS
                                </span>
                            </div>

                            {items.length === 0 ? (
                                <div className="p-12 text-center">
                                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-50 rounded-full mb-4">
                                        <Wrench className="h-8 w-8 text-gray-300" />
                                    </div>
                                    <h3 className="text-gray-500 font-medium">Nenhum serviço ou peça lançado ainda.</h3>
                                    <p className="text-gray-400 text-sm mt-1">Utilize o formulário ao lado para começar.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="bg-gray-50/50">
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Serviço / Item</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-center">Qtd</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Unitário</th>
                                                <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-widest text-right">Subtotal</th>
                                                <th className="px-6 py-4 text-center"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {items.map((item) => (
                                                <tr key={item.id_item_os} className="hover:bg-gray-50/50 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <p className="text-xs font-bold text-brand-blue uppercase tracking-tight mb-1">
                                                            {item.tipo_servico?.descricao_tipo_servico}
                                                        </p>
                                                        <p className="text-sm font-semibold text-gray-800">{item.descricao_componente}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5 italic">{item.servico_realizado}</p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className="text-sm font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                                                            {item.quantidade} {item.produtos?.unidade || 'UN'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right text-sm font-medium text-gray-600">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.valor_unitario)}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <p className="text-sm font-bold text-gray-800">
                                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.quantidade * item.valor_unitario)}
                                                        </p>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <button
                                                            onClick={() => handleRemoveItem(item.id_item_os)}
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OSServiceTracking;
