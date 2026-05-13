import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import type { Motor } from '../../types/motor';
import type { Cliente } from '../../types/client';
import { X, Save, Settings, Activity, Info, Zap } from 'lucide-react';

interface MotorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (motor: Motor) => Promise<void>;
    motor?: Motor | null;
    isReadOnly?: boolean;
}

const EMPTY_FORM: Partial<Motor> = {
    id_cliente: undefined,
    num_serie: '',
    classificacao: '',
    potencia_cv_kw: '',
    unidade_cv_kw: 'CV',
    rpm: '',
    tensao_v: '',
    hz: '',
    fabricante: '',
    modelo: '',
    tag_cliente: '',
    numero_polos: '',
    tens_arm: '',
    corr_arm: '',
    tens_exc: '',
    corr_exc: '',
    corrente_nominal: '',
    tensao_nominal: '',
    isolamento: '',
    ip: '',
    fs: '',
    rolamento_la: '',
    rolamento_loa: '',
    especificacao: '',
    opmed: '',
    codigo_fconst: undefined
};

const MotorModal: React.FC<MotorModalProps> = ({ isOpen, onClose, onSave, motor, isReadOnly = false }) => {
    const [formData, setFormData] = useState<Partial<Motor>>(EMPTY_FORM);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<'geral' | 'eletrica' | 'mecanica'>('geral');

    useEffect(() => {
        if (isOpen) {
            setFormData(motor ?? EMPTY_FORM);
            fetchClientes();
        }
    }, [motor, isOpen]);

    const fetchClientes = async () => {
        try {
            const response = await api.get('/api/clientes');
            const data = response.data.data;
            setClientes(Array.isArray(data) ? data : (data as any).clientes || []);
        } catch (error) {
            console.error('Erro ao carregar clientes para o modal:', error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        if (isReadOnly) return;
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isReadOnly) return;
        setIsSubmitting(true);
        try {
            await onSave(formData as Motor);
            onClose();
        } catch (error) {
            console.error('Erro ao salvar motor:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    const inputClass = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-blue focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500 text-sm";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">

                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white">
                    <div className="flex items-center space-x-2">
                        <Settings className="h-5 w-5 text-brand-blue" />
                        <h2 className="text-xl font-bold text-gray-800">
                            {isReadOnly ? 'Detalhes do Motor' : motor ? 'Editar Motor' : 'Novo Cadastro de Motor'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="h-6 w-6 text-gray-400" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex px-6 border-b border-gray-100 space-x-6 bg-gray-50/50">
                    {[
                        { id: 'geral', label: 'Identificação', icon: Info },
                        { id: 'eletrica', label: 'Dados Elétricos', icon: Zap },
                        { id: 'mecanica', label: 'Mecânica / Outros', icon: Activity }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center py-3 border-b-2 transition-colors space-x-2 text-sm font-medium ${activeTab === tab.id ? 'border-brand-blue text-brand-blue' : 'border-transparent text-gray-500 hover:text-gray-700'
                                }`}
                        >
                            <tab.icon className="h-4 w-4" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Form Content */}
                <form id="motor-form" onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">

                    {activeTab === 'geral' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                            <div className="col-span-2 md:col-span-1">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Cliente Proprietário *</label>
                                <select
                                    name="id_cliente"
                                    value={formData.id_cliente || ''}
                                    onChange={handleChange}
                                    required
                                    disabled={isReadOnly}
                                    className={inputClass}
                                >
                                    <option value="">Selecione um cliente...</option>
                                    {clientes.map(c => (
                                        <option key={c.id_cliente} value={c.id_cliente}>{c.nome_razao_social}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nº de Série / Tag Cliente *</label>
                                <input name="num_serie" value={formData.num_serie} onChange={handleChange} required disabled={isReadOnly} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Fabricante</label>
                                <input name="fabricante" value={formData.fabricante} onChange={handleChange} disabled={isReadOnly} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Modelo</label>
                                <input name="modelo" value={formData.modelo} onChange={handleChange} disabled={isReadOnly} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Classificação</label>
                                <input name="classificacao" value={formData.classificacao} onChange={handleChange} disabled={isReadOnly} className={inputClass} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Tag do Cliente</label>
                                <input name="tag_cliente" value={formData.tag_cliente} onChange={handleChange} disabled={isReadOnly} className={inputClass} />
                            </div>
                        </div>
                    )}

                    {activeTab === 'eletrica' && (
                        <div className="space-y-6 animate-in fade-in duration-300">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Potência *</label>
                                    <input name="potencia_cv_kw" value={formData.potencia_cv_kw} onChange={handleChange} required disabled={isReadOnly} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Unidade</label>
                                    <select name="unidade_cv_kw" value={formData.unidade_cv_kw} onChange={handleChange} disabled={isReadOnly} className={inputClass}>
                                        <option value="CV">CV</option>
                                        <option value="KW">KW</option>
                                        <option value="HP">HP</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">RPM</label>
                                    <input name="rpm" value={formData.rpm} onChange={handleChange} disabled={isReadOnly} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Freq (Hz)</label>
                                    <input name="hz" value={formData.hz} onChange={handleChange} disabled={isReadOnly} className={inputClass} />
                                </div>
                            </div>

                            <div className="bg-blue-50/30 p-4 rounded-xl border border-blue-100">
                                <h4 className="text-xs font-bold uppercase text-brand-blue mb-3 flex items-center">
                                    <Zap className="h-3 w-3 mr-1" /> Dados de Armadura e Excitação
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Tensão Arm. (V)</label>
                                        <input name="tens_arm" value={formData.tens_arm} onChange={handleChange} disabled={isReadOnly} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Corr. Arm. (A)</label>
                                        <input name="corr_arm" value={formData.corr_arm} onChange={handleChange} disabled={isReadOnly} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Tensão Exc. (V)</label>
                                        <input name="tens_exc" value={formData.tens_exc} onChange={handleChange} disabled={isReadOnly} className={inputClass} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-600 mb-1">Corr. Exc. (A)</label>
                                        <input name="corr_exc" value={formData.corr_exc} onChange={handleChange} disabled={isReadOnly} className={inputClass} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nº Polos</label>
                                    <input name="numero_polos" value={formData.numero_polos} onChange={handleChange} disabled={isReadOnly} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Isolamento</label>
                                    <input name="isolamento" value={formData.isolamento} onChange={handleChange} disabled={isReadOnly} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">IP</label>
                                    <input name="ip" value={formData.ip} onChange={handleChange} disabled={isReadOnly} className={inputClass} />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">F.S.</label>
                                    <input name="fs" value={formData.fs} onChange={handleChange} disabled={isReadOnly} className={inputClass} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'mecanica' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in duration-300">
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-gray-400 border-b pb-1">Rolamentos</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">L.A. (Acoplamento)</label>
                                        <input name="rolamento_la" value={formData.rolamento_la} onChange={handleChange} disabled={isReadOnly} className={inputClass} placeholder="Ex: 6312 C3" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-gray-700 mb-1">L.O.A. (Oposto)</label>
                                        <input name="rolamento_loa" value={formData.rolamento_loa} onChange={handleChange} disabled={isReadOnly} className={inputClass} placeholder="Ex: 6310 C3" />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h4 className="text-xs font-bold uppercase text-gray-400 border-b pb-1">Outras Informações</h4>
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1">Opm. / Medidas</label>
                                    <input name="opmed" value={formData.opmed} onChange={handleChange} disabled={isReadOnly} className={inputClass} />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Especificações Técnicas / Observações</label>
                                <textarea
                                    name="especificacao"
                                    value={formData.especificacao}
                                    onChange={handleChange as any}
                                    disabled={isReadOnly}
                                    rows={4}
                                    className={`${inputClass} resize-none`}
                                    placeholder="Detalhes adicionais sobre rebobinagem, fiação ou carcaça..."
                                />
                            </div>
                        </div>
                    )}
                </form>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-end space-x-3 bg-gray-50">
                    <button type="button" onClick={onClose} className="px-6 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 transition-colors">
                        {isReadOnly ? 'Fechar' : 'Cancelar'}
                    </button>
                    {!isReadOnly && (
                        <button
                            form="motor-form"
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center px-6 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-dark-blue transition-colors disabled:opacity-50 font-bold"
                        >
                            {isSubmitting ? (
                                <span className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2" />
                            ) : (
                                <Save className="h-4 w-4 mr-2" />
                            )}
                            {motor ? 'Salvar Alterações' : 'Cadastrar Motor'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MotorModal;