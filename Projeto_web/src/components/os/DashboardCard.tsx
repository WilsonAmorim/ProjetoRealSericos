import React from 'react';
import { Settings, User, Clock, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DashboardCardProps {
    os: {
        id_os: number;
        cliente: { razao_social: string };
        motor: { num_serie: string; especificacao: string };
        data_abertura: string;
        andamento: string; // Já vem o texto do banco aqui (ex: "Aguardando Orçamento")
    };
}

const DashboardCard: React.FC<DashboardCardProps> = ({ os }) => {
    const navigate = useNavigate();

    return (
        <div
            className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all group"
        >
            <div className="flex justify-between items-start mb-4">
                {/* COR FIXA AZUL E EXIBIÇÃO DIRETA DO TEXTO DO BANCO */}
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-600 text-white border-blue-700 shadow-sm">
                    <Clock className="w-3 h-3 mr-1 text-white" />
                    {os.andamento}
                </span>
                <span className="text-sm font-bold text-gray-400 group-hover:text-brand-blue transition-colors">
                    #{os.id_os}
                </span>
            </div>

            <div className="space-y-3">
                <div className="flex items-start space-x-3">
                    <User className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Cliente</p>
                        <p className="text-sm font-medium text-gray-800 line-clamp-1">{os.cliente.razao_social}</p>
                    </div>
                </div>

                <div className="flex items-start space-x-3">
                    <Settings className="w-5 h-5 text-gray-400 mt-0.5" />
                    <div>
                        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Equipamento</p>
                        <p className="text-sm font-medium text-gray-800">Série: {os.motor.num_serie}</p>
                        <p className="text-xs text-gray-500 line-clamp-1">{os.motor.especificacao}</p>
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                <button 
                    onClick={() => navigate(`/os/${os.id_os}`)}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-semibold text-gray-600 bg-gray-50 hover:bg-brand-blue/10 hover:text-brand-blue rounded-lg transition-colors"
                >
                    <Settings className="w-3.5 h-3.5" />
                    <span>Detalhes</span>
                </button>
                
                <button 
                    onClick={() => navigate(`/os/${os.id_os}/acompanhamento`)}
                    className="flex-1 flex items-center justify-center space-x-2 py-2 text-xs font-semibold text-white bg-brand-blue hover:bg-brand-blue-dark rounded-lg shadow-sm shadow-brand-blue/20 transition-colors"
                >
                    <Package className="w-3.5 h-3.5" />
                    <span>Serviços/Peças</span>
                </button>
            </div>
        </div>
    );
};

export default DashboardCard;