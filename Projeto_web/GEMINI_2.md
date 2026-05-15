Prompt Mestre: Desenvolvimento Frontend RealServiços
Contexto:
Estou desenvolvendo o frontend (Web ou Mobile) para o sistema de gestão de oficina de motores elétricos RealServiços. O backend (Projeto_1), foi desenvolvido em Node.js seguindo a Arquitetura Hexagonal e utiliza Supabase como banco de dados. 

Diretrizes de Desenvolvimento:

1. Skills do Sistema (Habilidades Ativas)
Busca Omni-Channel: Implemente a busca utilizando o endpoint /search, que filtra simultaneamente por Razão Social, ID da OS ou Número de Série do Motor.

Gestão de Estoque Reativa: Toda interface de saída de materiais deve refletir que o saldo é calculado via movimentações de entrada/saída, garantindo a integridade do inventário.

Normalização Geográfica: Utilize os campos cidade e estado de forma independente para filtros e exibições, respeitando a limpeza de dados realizada.

Role-Based Access Control (RBAC): Adapte a interface conforme o id_perfil (Administrador, Recepção, Mecânico, Eletricista). Remova ou desabilite botões de faturamento para perfis técnicos.

2. Restrições e Travas (Constraints)
Unicidade de Identidade: O formulário de cadastro de clientes deve validar o documento (CPF/CNPJ) para evitar duplicidade antes do envio, tratando o erro amigavelmente caso o banco rejeite.

Integridade Referencial: Não permita a exclusão de registros que possuam dependências (ex: deletar cliente com motor ativo), exibindo alertas de bloqueio.

Validação de Status: As alterações de status de serviço devem seguir estritamente as opções da tabela andamento_servico (ex: "Em desmontagem", "Pronto para entrega").

Blindagem Financeira: Campos de valor devem impedir entradas negativas e aplicar máscaras de moeda brasileira (R$).

3. Requisitos Técnicos de UI/UX
Stack: ReactJS/Tailwind (Web) ou React Native/Expo (Mobile).

Feedback Visual: Utilize Skeletons para carregamento e Toasts para confirmações ou erros.

Ícones: Utilize a biblioteca lucide-react.

Tarefa Atual: 
Prompt: Tela de Acompanhamento de Serviços e Peças da OS
Contexto:
Estou desenvolvendo o módulo de acompanhamento de OS do sistema RealServiços usando ReactJS e Tailwind CSS. 

Objetivo:
Atualizar a Tela de Acompanhamento de Serviços e Peças da OS \Projeto_web\src\pages\OSServiceTracking.tsx, ela tem duas abas uma para peças e outra para serviços, as duas abas devem chamar os endpoints do backend para buscar nas tabelas de peças (pecas) e na tabela de serviços (servico). 

    - Tabelas envolvidade: os, clientes, motores, andamento_servico, causa_queima
        - ordem_servico: id_os, id_motor, id_andamento, id_causa_queima, observacoes_tecnicas
        - servico: id_servico, descricao_servico 
        - pecas: id_pecas, descricao_pecas,
        - os_itens_servico: id_item_os, id_os, descricao_componente, servico_realizado, quantidade, valor_unitario, subtotal, id_servico, id_pecas
    
Cada os_itens_servico é identificado por: 

ID do Acompanhamento da os: id_item_os
Ordem de Serviço: id_os
servico: id_servico
pecas: id_pecas
Descrição do Componente: descricao_componente
Serviço Realizado: servico_realizado
Quantidade: quantidade
Valor Unitário: valor_unitario
Sub Total: subtotal

a tabela já foi criada no supabase. 
create table public.os_itens_servico (
  id_item_os serial not null,
  id_os integer null,
  id_servico integer null,
  id_pecas integer null,
  descricao_componente character varying(150) null,
  servico_realizado character varying(255) null,
  quantidade numeric(10, 2) null,
  valor_unitario numeric(10, 2) null,
  subtotal numeric GENERATED ALWAYS as ((quantidade * valor_unitario)) STORED (10, 2) null,
  constraint os_itens_servico_pkey primary key (id_item_os),
  constraint os_itens_servico_id_os_fkey foreign KEY (id_os) references ordens_servico (id_os) on delete CASCADE,
  constraint os_itens_servico_id_pecas_fkey foreign KEY (id_pecas) references pecas (id_pecas),
  constraint os_itens_servico_id_servico_fkey foreign KEY (id_servico) references tipo_servico (id_tipo_servico)
) TABLESPACE pg_default;
Habilidades (Skills) a serem implementadas na Tela de Acompanhamento de Serviços e Peças da OS:

Busca Omni-Channel: Implemente a busca utilizando o endpoint /search, que filtra simultaneamente por ID da OS .

Restrições (Constraints):

Status Ativo: Apenas usuários com a coluna ativo = 'S' podem realizar login.

Segurança de Input: O formulário deve validar o formato do e-mail antes de disparar a requisição para o Supabase.

Identidade Visual: Utilize Tailwind para criar um layout centralizado, limpo, com foco no branding da RealServiços (tons de Azul e Cinza).

Requisitos Técnicos:

Use react-router-dom.

Use lucide-react para os ícones .



