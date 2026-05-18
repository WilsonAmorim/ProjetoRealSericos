import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, Printer, Loader2, Calendar, Award, FileText } from 'lucide-react';
import api from '../services/api';
import logoCompleto from '../assets/logo_real_completo.png';

const OSOrcamento: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [osData, setOsData] = useState<any>(null);
    const [osServicos, setOsServicos] = useState<any[]>([]);
    const [osPecas, setOsPecas] = useState<any[]>([]);
    const [osRebobinamentos, setOsRebobinamentos] = useState<any[]>([]);

    // Commercial Terms States (Forma de Pagamento omitted based on User feedback)
    const [prazoExecucao, setPrazoExecucao] = useState('5');
    const [garantia, setGarantia] = useState('6');
    const [validadeProposta, setValidadeProposta] = useState('10');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [osRes, itemsRes] = await Promise.all([
                    api.get(`/api/os/${id}`),
                    api.get(`/api/os-itens/${id}`)
                ]);

                setOsData(osRes.data.data);
                setOsServicos(itemsRes.data.data.servicos || []);
                setOsPecas(itemsRes.data.data.pecas || []);
                setOsRebobinamentos(itemsRes.data.data.rebobinamentos || []);
            } catch (error) {
                console.error('Erro ao buscar dados do orçamento:', error);
                alert('Erro ao carregar dados do orçamento.');
                navigate(-1);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [id, navigate]);

    const totalServicos = osServicos.reduce((acc, item) => acc + Number(item.preco), 0);
    const totalPecas = osPecas.reduce((acc, item) => acc + Number(item.preco), 0);
    const totalRebobinamento = osRebobinamentos.reduce((acc, item) => acc + Number(item.preco), 0);
    const totalOS = totalServicos + totalPecas + totalRebobinamento;

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center space-y-4">
                    <Loader2 className="h-10 w-10 text-brand-blue animate-spin mx-auto" />
                    <p className="text-sm text-gray-500 font-medium">Carregando dados do orçamento...</p>
                </div>
            </div>
        );
    }

    const motor = osData?.motor;
    const cliente = osData?.cliente;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row">
            {/* ESTILO DE IMPRESSÃO CUSTOMIZADO E EMBUTIDO */}
            <style dangerouslySetInnerHTML={{
                __html: `
                @media print {
                    /* Ocultar barra lateral e outros controles no papel */
                    .no-print {
                        display: none !important;
                    }
                    /* Redefinir background e remover sombras no papel */
                    body, html {
                        background: white !important;
                        color: black !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        -webkit-print-color-adjust: exact !important;
                        print-color-adjust: exact !important;
                    }
                    /* Margens da página e tamanho A4 */
                    @page {
                        size: A4;
                        margin: 15mm 20mm 15mm 20mm;
                    }
                    .print-container {
                        background: white !important;
                        background-color: white !important;
                        padding: 0 !important;
                        margin: 0 !important;
                        width: 100% !important;
                        max-width: 100% !important;
                    }
                    .print-sheet {
                        width: 100% !important;
                        max-width: 100% !important;
                        box-shadow: none !important;
                        border: none !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: white !important;
                    }
                    /* Evitar quebras de página desagradáveis no meio de tabelas e listas */
                    tr {
                        page-break-inside: avoid !important;
                    }
                    h2, h3 {
                        page-break-after: avoid !important;
                    }
                }
            `}} />

            {/* Painel Esquerdo: Controles Comerciais (.no-print) */}
            <div className="no-print w-full lg:w-96 bg-white border-b lg:border-b-0 lg:border-r border-gray-200 p-6 flex flex-col justify-between shrink-0">
                <div className="space-y-6">
                    {/* Header */}
                    <div className="flex items-center space-x-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                            title="Voltar"
                        >
                            <ChevronLeft className="h-5 w-5 text-gray-500" />
                        </button>
                        <div>
                            <h1 className="text-lg font-bold text-gray-800">Orçamento O.S. #{id}</h1>
                            <p className="text-xs text-gray-500">Configuração das condições comerciais</p>
                        </div>
                    </div>

                    <div className="border-t border-gray-100 pt-4 space-y-4">
                        {/* Prazo de Execução */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1 text-brand-blue" />
                                Prazo de Execução (Dias Úteis)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={prazoExecucao}
                                onChange={(e) => setPrazoExecucao(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                            />
                        </div>

                        {/* Garantia */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                                <Award className="h-3.5 w-3.5 mr-1 text-brand-blue" />
                                Garantia (Meses)
                            </label>
                            <input
                                type="number"
                                min="0"
                                value={garantia}
                                onChange={(e) => setGarantia(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                            />
                        </div>

                        {/* Validade */}
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center">
                                <FileText className="h-3.5 w-3.5 mr-1 text-brand-blue" />
                                Validade da Proposta (Dias)
                            </label>
                            <input
                                type="number"
                                min="1"
                                value={validadeProposta}
                                onChange={(e) => setValidadeProposta(e.target.value)}
                                className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-bold focus:ring-2 focus:ring-brand-blue/20 focus:border-brand-blue outline-none"
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-8 space-y-3">
                    <button
                        onClick={handlePrint}
                        className="w-full flex items-center justify-center space-x-2 py-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg font-bold shadow-lg shadow-brand-blue/20 active:scale-98 transition-all"
                    >
                        <Printer className="h-5 w-5" />
                        <span>Gerar PDF / Imprimir</span>
                    </button>
                    <p className="text-[10px] text-center text-gray-400">
                        Selecione "Salvar como PDF" na caixa de diálogo de impressão para exportar o arquivo digital.
                    </p>
                </div>
            </div>

            {/* Painel Direito: Simulação da Proposta em Papel A4 */}
            <div className="flex-1 p-4 md:p-8 overflow-y-auto flex justify-center bg-gray-100 print-container">
                <div className="print-sheet w-[210mm] min-h-[297mm] bg-white p-12 flex flex-col justify-between">

                    <div>
                        {/* 1. Logomarca e Cabeçalho */}
                        <div className="flex flex-col items-center border-b-2 border-gray-800 pb-6 mb-6">
                            <img src={logoCompleto} alt="Real Serviços" className="h-16 w-auto object-contain mb-2" />
                            <h2 className="text-sm font-black text-gray-800 tracking-widest uppercase">Real Serviços Eletromecânicos e Com Ltda</h2>
                            <p className="text-[10px] text-gray-500">Manutenção Industrial - Rebobinamento de Motores</p>
                        </div>

                        {/* Assunto e Destinatário */}
                        <div className="space-y-4 mb-6">
                            <div className="bg-gray-50 border border-gray-100 p-3 rounded-lg flex justify-between items-center">
                                <span className="text-xs font-black text-gray-700 uppercase tracking-wide">
                                    Assunto: Orçamento para Manutenção de Equipamento - OS #{id}
                                </span>
                                <span className="text-[10px] text-gray-400 font-semibold">
                                    {new Date(osData?.data_entrada || Date.now()).toLocaleDateString('pt-BR')}
                                </span>
                            </div>

                            <p className="text-sm text-gray-800 leading-relaxed">
                                Prezado(a) <strong className="font-bold">{cliente?.nome_razao_social || 'Cliente'}</strong>,
                            </p>
                            <p className="text-xs text-gray-600 leading-relaxed">
                                Conforme solicitado, apresentamos o orçamento referente aos serviços de manutenção/rebobinamento do motor elétrico informado.
                            </p>
                        </div>

                        {/* 1. Identificação do Equipamento */}
                        <div className="space-y-2 mb-6">
                            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">
                                1. Identificação do Equipamento
                            </h3>
                            <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-xs">
                                <p className="text-gray-600">
                                    <strong className="font-semibold text-gray-800">Equipamento:</strong> Motor Elétrico
                                </p>
                                <p className="text-gray-600">
                                    <strong className="font-semibold text-gray-800">Marca/Modelo:</strong> {motor?.fabricante || 'Não Informado'} {motor?.modelo ? `/ ${motor.modelo}` : ''}
                                </p>
                                <p className="text-gray-600">
                                    <strong className="font-semibold text-gray-800">Número de Série:</strong> {motor?.num_serie || 'N/D'}
                                </p>
                                <p className="text-gray-600">
                                    <strong className="font-semibold text-gray-800">Potência/Especificação:</strong> {motor?.potencia_cv_kw ? `${motor.potencia_cv_kw} ${motor.unidade_cv_kw || 'CV/kW'}` : 'Não Informado'} {motor?.especificacao ? `- ${motor.especificacao}` : ''}
                                </p>
                            </div>
                        </div>

                        {/* 2. Diagnóstico Técnico */}
                        <div className="space-y-2 mb-6">
                            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">
                                2. Diagnóstico Técnico
                            </h3>
                            <div className="text-xs space-y-2 leading-relaxed">
                                <p className="text-gray-600">
                                    <strong className="font-semibold text-gray-800">Causa provável da queima:</strong> {osData?.causa_texto}
                                </p>
                                {osData?.observacoes_gerais && (
                                    <p className="text-gray-600">
                                        <strong className="font-semibold text-gray-800">Parecer Técnico:</strong> {osData.observacoes_gerais}
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* 3. Serviços Rebobinamento */}
                        <div className="space-y-2 mb-6">
                            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">
                                3. Serviços Rebobinamento
                            </h3>
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="border-b border-gray-300 font-bold text-gray-700">
                                        <th className="py-2">Descrição</th>
                                        <th className="py-2 text-right w-32">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {osRebobinamentos.length > 0 ? (
                                        osRebobinamentos.map((item) => {
                                            const rebobObj = item.rebobinamento || item.rebobinamentos;
                                            const desc = rebobObj?.descricao_rebobinamento || 'Serviço de Rebobinamento';
                                            const specs = [
                                                rebobObj?.cv && `${rebobObj.cv} CV`,
                                                rebobObj?.polos && `${rebobObj.polos} Polos`
                                            ].filter(Boolean).join(' - ');
                                            const fullDesc = specs ? `${desc} (${specs})` : desc;

                                            return (
                                                <tr key={item.id_osrebobinamento} className="text-gray-600">
                                                    <td className="py-2 font-medium">
                                                        {fullDesc}
                                                    </td>
                                                    <td className="py-2 text-right font-bold text-gray-800">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr className="text-gray-400 italic">
                                            <td className="py-2">Nenhum serviço de rebobinamento lançado para esta O.S.</td>
                                            <td className="py-2 text-right font-bold">-</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* 4. Serviços Adicionais */}
                        <div className="space-y-2 mb-6">
                            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">
                                4. Serviços
                            </h3>
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="border-b border-gray-300 font-bold text-gray-700">
                                        <th className="py-2">Descrição</th>
                                        <th className="py-2 text-right w-32">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {osServicos.length > 0 ? (
                                        osServicos.map((item) => {
                                            const servObj = item.servico || item.servicos;
                                            const desc = servObj?.descricao_servico || 'Serviço Geral';

                                            return (
                                                <tr key={item.id_osservicos} className="text-gray-600">
                                                    <td className="py-2 font-medium">
                                                        {desc}
                                                    </td>
                                                    <td className="py-2 text-right font-bold text-gray-800">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr className="text-gray-400 italic">
                                            <td className="py-2">Nenhum serviço geral/adicional lançado para esta O.S.</td>
                                            <td className="py-2 text-right font-bold">-</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* 5. Peças/Materiais */}
                        <div className="space-y-2 mb-6">
                            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">
                                5. Peças/Materiais
                            </h3>
                            <table className="w-full text-xs text-left">
                                <thead>
                                    <tr className="border-b border-gray-300 font-bold text-gray-700">
                                        <th className="py-2">Descrição</th>
                                        <th className="py-2 text-right w-32">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {osPecas.length > 0 ? (
                                        osPecas.map((item) => {
                                            const pecaObj = item.peca || item.pecas;
                                            const desc = pecaObj?.descricao_pecas || 'Peça / Material';

                                            return (
                                                <tr key={item.id_ospecas} className="text-gray-600">
                                                    <td className="py-2 font-medium">
                                                        {desc}
                                                    </td>
                                                    <td className="py-2 text-right font-bold text-gray-800">
                                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(item.preco)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    ) : (
                                        <tr className="text-gray-400 italic">
                                            <td className="py-2">Nenhuma peça ou material substituído para esta O.S.</td>
                                            <td className="py-2 text-right font-bold">-</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* 6. Condições Comerciais */}
                        <div className="space-y-3 mb-8 pt-4 border-t border-gray-200">
                            <h3 className="text-xs font-bold text-gray-900 border-b border-gray-200 pb-1 uppercase tracking-wider">
                                6. Condições Comerciais
                            </h3>
                            <div className="grid grid-cols-2 gap-4 text-xs">
                                <div>
                                    <p className="text-gray-600">
                                        <strong className="font-semibold text-gray-800">Prazo de Execução:</strong> {prazoExecucao} dias úteis após aprovação.
                                    </p>
                                    <p className="text-gray-600">
                                        <strong className="font-semibold text-gray-800">Garantia:</strong> {garantia} meses sobre os serviços e peças.
                                    </p>
                                    <p className="text-gray-600">
                                        <strong className="font-semibold text-gray-800">Validade da Proposta:</strong> {validadeProposta} dias a contar desta data.
                                    </p>
                                </div>
                                <div className="text-right flex flex-col justify-center items-end bg-gray-50 p-4 rounded-lg border border-gray-100">
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Valor Total do Serviço</span>
                                    <span className="text-xl font-black text-brand-blue">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalOS)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Rodapé da Proposta */}
                    <div className="space-y-4 border-t border-gray-200 pt-6">
                        <p className="text-[10px] text-gray-500 leading-relaxed text-center">
                            Para autorizar a execução dos serviços ou caso tenha qualquer dúvida técnica, basta responder a este e-mail /
                            <strong className="font-semibold text-gray-700">realserv@terra.com.br</strong> ou entrar em contato conosco pelo telefone
                            <strong className="font-semibold text-gray-700">(71) 3369-1880 / 3369-1881</strong>.
                        </p>

                        <p className="text-[10px] text-gray-400 text-center font-medium italic">
                            Ficamos no aguardo de sua avaliação para darmos andamento ao serviço.
                        </p>

                        <div className="flex justify-between items-end pt-4">
                            <div className="text-left text-[9px] text-gray-400">
                                <p className="font-bold">Real Serviços Eletromecânicos e Com Ltda</p>
                                <p>CNPJ: 13.798.996/0001-74</p>
                                <p>Endereço: Lauro de Freitas, BA</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-700">Departamento de Assistência Técnica</p>
                                <p className="text-[10px] text-gray-400">Real Serviços</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default OSOrcamento;
