import React, { useState, useEffect, useCallback, useMemo } from 'react';
import api from '../services/api';
import type { Motor } from '../types/motor';
import { useDebounce } from '../hooks/useDebounce';
import SearchBar from '../components/common/SearchBar';
import { Plus, Settings, LayoutDashboard, ChevronLeft, ChevronRight, Package, XCircle } from 'lucide-react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

import MotorTable from '../components/motors/MotorTable';
import MotorModal from '../components/motors/MotorModal';

const ITEMS_PER_PAGE = 10;

const Motors: React.FC = () => {
    const { profile } = useAuth();
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate(); // <-- Hook de navegação adicionado
    const [motors, setMotors] = useState<Motor[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isReadOnly, setIsReadOnly] = useState(false);
    const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);
    const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [loadingOSId] = useState<number | null>(null); // <-- Controle de loading por motor

    const clienteIdFiltro = searchParams.get('clienteId');

    const userProfileId = profile?.id_perfil ? String(profile.id_perfil) : '';
    const canEdit = userProfileId === '1' || userProfileId === '2';
    const canDelete = userProfileId === '1' || userProfileId === '2';

    const debouncedSearch = useDebounce(searchQuery, 500);

    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ message, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchMotors = useCallback(async (query?: string) => {
        setIsLoading(true);
        try {
            let response;

            if (query && query.trim()) {
                response = await api.get(`/api/search?query=${query.trim()}`);
            } else if (clienteIdFiltro) {
                response = await api.get('/api/motores', {
                    params: { id_cliente: Number(clienteIdFiltro) }
                });
            } else {
                response = await api.get('/api/motores');
            }

            const rawData = response.data.data;
            setMotors(Array.isArray(rawData) ? rawData : (rawData?.motores || []));

            setCurrentPage(1);
        } catch (error: any) {
            console.error('ERRO DETALHADO:', error.response?.data || error.message);
            showToast('Erro ao carregar motores.', 'error');
        } finally {
            setIsLoading(false);
        }
    }, [clienteIdFiltro]);

    useEffect(() => {
        fetchMotors(debouncedSearch);
    }, [debouncedSearch, fetchMotors]);

    const totalPages = Math.ceil(motors.length / ITEMS_PER_PAGE);
    const paginatedMotors = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return motors.slice(start, start + ITEMS_PER_PAGE);
    }, [motors, currentPage]);

    const handleSaveMotor = async (motorData: Motor) => {
        try {
            if (motorData.id_motor) {
                await api.put(`/api/motores/${motorData.id_motor}`, motorData);
                showToast('Motor atualizado com sucesso!', 'success');
            } else {
                await api.post('/api/motores', motorData);
                showToast('Motor cadastrado com sucesso!', 'success');
            }
            setIsModalOpen(false);
            fetchMotors(debouncedSearch);
        } catch (error: any) {
            const msg = error.response?.data?.message || 'Erro ao salvar motor.';
            showToast(msg, 'error');
            throw error;
        }
    };

    const handleDeleteMotor = async (id: number) => {
        if (!window.confirm('Excluir este motor? Esta ação removerá o histórico técnico vinculado.')) return;
        try {
            await api.delete(`/api/motores/${id}`);
            showToast('Motor removido.', 'success');
            fetchMotors(debouncedSearch);
        } catch (err) {
            showToast('Erro ao excluir motor.', 'error');
        }
    };


    const handleOpenOS = (motor: Motor) => {
        if (!motor.id_motor) {
            showToast('Erro: Motor sem ID identificado.', 'error');
            return;
        }


        navigate(`/os/abrir/${motor.id_motor}`);
    };

    const clearClientFilter = () => {
        setSearchParams({});
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <nav className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-4">
                        <Link to="/dashboard" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <LayoutDashboard className="h-5 w-5 text-gray-500" />
                        </Link>
                        <h1 className="text-xl font-bold text-brand-blue flex items-center">
                            <Settings className="h-6 w-6 mr-2" />
                            Motores e Equipamentos
                        </h1>
                    </div>

                    {canEdit && (
                        <button
                            onClick={() => { setSelectedMotor(null); setIsReadOnly(false); setIsModalOpen(true); }}
                            className="flex items-center px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-dark-blue transition-all shadow-md active:scale-95"
                        >
                            <Plus className="h-5 w-5 mr-1" /> Novo Motor
                        </button>
                    )}
                </div>
            </nav>

            <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex flex-wrap gap-4 items-center justify-between">
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            placeholder="Buscar por Nº de Série, Fabricante ou Cliente..."
                        />
                        <div className="flex items-center space-x-2 text-sm text-gray-500 font-medium bg-gray-50 px-3 py-1 rounded-full border border-gray-100">
                            <Package className="h-4 w-4" />
                            <span>{motors.length} {motors.length === 1 ? 'item' : 'itens'}</span>
                        </div>
                    </div>

                    {clienteIdFiltro && (
                        <div className="flex items-center">
                            <div className="bg-orange-50 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-lg border border-orange-100 flex items-center shadow-sm">
                                <span className="mr-2">Filtrando Motores por Cliente</span>
                                <button
                                    onClick={clearClientFilter}
                                    className="p-0.5 hover:bg-orange-200 rounded-full transition-colors"
                                    title="Limpar Filtro"
                                >
                                    <XCircle className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <MotorTable
                    motors={paginatedMotors}
                    isLoading={isLoading}
                    onEdit={(m) => { setSelectedMotor(m); setIsReadOnly(false); setIsModalOpen(true); }}
                    onView={(m) => { setSelectedMotor(m); setIsReadOnly(true); setIsModalOpen(true); }}
                    onDelete={handleDeleteMotor}
                    onOpenOS={handleOpenOS}          // <-- NOVA PROP
                    loadingOSId={loadingOSId}        // <-- NOVA PROP
                    canEdit={canEdit}
                    canDelete={canDelete}
                />

                {!isLoading && totalPages > 1 && (
                    <div className="flex items-center justify-center space-x-4 pb-8">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <span className="text-sm font-medium text-gray-700">
                            Página <span className="text-brand-blue font-bold">{currentPage}</span> de {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-50 hover:bg-gray-50 transition-colors"
                        >
                            <ChevronRight className="h-5 w-5 text-gray-600" />
                        </button>
                    </div>
                )}
            </main>

            <MotorModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveMotor}
                motor={selectedMotor}
                isReadOnly={isReadOnly}
            />

            {toast && (
                <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
                    } text-white font-medium flex items-center shadow-lg`}>
                    {toast.message}
                </div>
            )}
        </div>
    );
};

export default Motors;