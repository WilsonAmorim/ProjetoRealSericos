import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Search, Plus, UserPlus, Settings, FileText, Loader2, User, ArrowRight } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import type { Cliente, Motor } from '../types/motor'; // Ajuste o caminho dos seus types

interface SearchResponse {
    clientes: Cliente[];
    motores: (Motor & { cliente?: Cliente })[];
    ordens_servico: any[];
}

const OpenOS: React.FC = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    // const [loadingOSId, setLoadingOSId] = useState<number | null>(null);

    // Estados separados para clientes e motores com base na sua SearchUseCase
    const [clientesResult, setClientesResult] = useState<Cliente[]>([]);
    const [motoresResult, setMotoresResult] = useState<(Motor & { cliente?: Cliente })[]>([]);

    const debouncedSearch = useDebounce(searchQuery, 500);

    const handleSearch = useCallback(async (query: string) => {
        if (!query || query.length < 3) {
            setClientesResult([]);
            setMotoresResult([]);
            return;
        }

        setIsSearching(true);
        try {
            const response = await api.get(`/api/search?query=${encodeURIComponent(query)}`);

            // 👉 USE A INTERFACE AQUI COLOCANDO "as SearchResponse"
            const data = (response.data.data || response.data) as SearchResponse;

            setClientesResult(data.clientes || []);
            setMotoresResult(data.motores || []);
        } catch (error) {
            console.error('Erro na busca centralizada:', error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    useEffect(() => {
        handleSearch(debouncedSearch);
    }, [debouncedSearch, handleSearch]);

    // No seu OpenOS.tsx, substitua a função handleCreateOS por esta:
    const handleCreateOS = (motor: Motor) => {
        if (!motor.id_motor) return;

        // Em vez de salvar no banco aqui, ele apenas redireciona para a tela de formulário
        navigate(`/os/abrir/${motor.id_motor}`);
    };

    const hasResults = clientesResult.length > 0 || motoresResult.length > 0;

    return (
        <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center">
            <div className="w-full max-w-4xl bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-6">

                {/* Header */}
                <div className="flex items-center space-x-3 border-b border-gray-100 pb-4">
                    <div className="p-3 bg-brand-blue/10 rounded-lg">
                        <FileText className="h-6 w-6 text-brand-blue" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Abertura de O.S.</h1>
                        <p className="text-sm text-gray-500">Busque por CPF/CNPJ, Razão Social ou Nº de Série do Motor</p>
                    </div>
                </div>

                {/* Input de Busca Omni-Channel */}
                <div className="relative">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-brand-blue focus:border-brand-blue transition-all bg-gray-50 focus:bg-white"
                        placeholder="Ex: 00.000.000/0001-00 ou WEG12345..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {isSearching && (
                        <Loader2 className="absolute right-4 top-3.5 h-5 w-5 text-brand-blue animate-spin" />
                    )}
                </div>

                {/* Área de Resultados */}
                <div className="space-y-6 pt-2">

                    {/* Empty State / Não encontrado */}
                    {!hasResults && searchQuery.length >= 3 && !isSearching && (
                        <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-600 mb-5 text-lg">Nenhum cliente ou motor encontrado para "{searchQuery}"</p>
                            <div className="flex justify-center space-x-4">
                                <button
                                    onClick={() => navigate('/clientes/novo')}
                                    className="inline-flex items-center px-5 py-2.5 bg-brand-blue text-white font-medium rounded-lg hover:bg-brand-dark-blue transition-colors shadow-sm"
                                >
                                    <UserPlus className="h-5 w-5 mr-2" />
                                    Cadastrar Cliente
                                </button>
                                <button
                                    onClick={() => navigate('/motores')}
                                    className="inline-flex items-center px-5 py-2.5 bg-white text-gray-700 font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors shadow-sm"
                                >
                                    <Settings className="h-5 w-5 mr-2" />
                                    Ver Motores
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Resultado 1: Motores Encontrados (Pesquisa por N de Série) */}
                    {motoresResult.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center">
                                <Settings className="h-4 w-4 mr-2" /> Equipamentos Encontrados
                            </h3>
                            <div className="divide-y divide-gray-100 border border-gray-200 rounded-lg overflow-hidden bg-white">
                                {motoresResult.map((motor) => (
                                    <div key={motor.id_motor} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors gap-4">
                                        <div>
                                            <p className="font-bold text-gray-800 text-lg">Série: {motor.num_serie}</p>
                                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                                <User className="h-4 w-4 mr-1 text-gray-400" />
                                                {motor.cliente?.nome_razao_social || 'Cliente desconhecido'}
                                            </div>
                                            <p className="text-xs text-gray-400 mt-1">
                                                {motor.potencia_cv_kw} {motor.unidade_cv_kw} • {motor.fabricante}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => handleCreateOS(motor)}
                                            className="flex justify-center items-center px-6 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-all shadow-sm active:scale-95 whitespace-nowrap"
                                        >
                                            <ArrowRight className="h-5 w-5 mr-2" />
                                            Abrir O.S.
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Resultado 2: Clientes Encontrados (Pesquisa por Documento/Nome) */}
                    {clientesResult.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider flex items-center mt-6">
                                <User className="h-4 w-4 mr-2" /> Clientes Encontrados
                            </h3>
                            <div className="grid gap-4 md:grid-cols-2">
                                {clientesResult.map((cliente) => (
                                    <div key={cliente.id_cliente} className="bg-white border border-gray-200 rounded-lg p-5 shadow-sm hover:border-brand-blue/50 transition-colors">
                                        <h3 className="font-bold text-gray-800 line-clamp-1" title={cliente.nome_razao_social}>
                                            {cliente.nome_razao_social}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-4">Doc: {cliente.documento}</p>

                                        <button
                                            onClick={() => navigate(`/motores?clienteId=${cliente.id_cliente}`)}
                                            className="w-full flex justify-center items-center px-4 py-2 bg-brand-blue/10 text-brand-blue font-semibold rounded-lg hover:bg-brand-blue hover:text-white transition-colors"
                                        >
                                            <Plus className="h-5 w-5 mr-2" />
                                            Ver / Cadastrar Motor
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default OpenOS;