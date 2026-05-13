Prompt: Desenvolvimento do Módulo de Clientes (Frontend RealServiços)
1. Objetivo
Desenvolver a interface de Gestão de Clientes em ReactJS, permitindo visualizar, buscar e editar os clientes migrados do sistema antigo. A interface deve ser focada em alta produtividade para a recepção da oficina.

2. Pilha Tecnológica
Vite + React (TypeScript): Para tipagem segura em sincronia com o Backend.

Tailwind CSS: Para estilização baseada em utilitários.

TanStack Query (React Query): Para gerenciar o estado das requisições (Loading, Error, Data).

Axios: Para chamadas HTTP ao Backend Node.js.

3. Requisitos de Interface (UI)
Tabela de Clientes: Listagem responsiva exibindo: Razão Social, Documento (CPF/CNPJ), Cidade/UF e Telefone.

Filtro de Busca: Um campo de busca que dispara a pesquisa no backend (/search?query=...) conforme o usuário digita (Debounce).

Modal de Edição: Ao clicar em um cliente, abrir um formulário para atualizar dados (incluindo os novos campos: Cidade e Estado).

4. Lógica de Integração (Frontend -> Backend)
Sincronia de Tipos: Criar uma interface Cliente no Frontend que seja idêntica à Entity do Domain no Backend.

Tratamento de Erros: Exibir notificações (Toasts) amigáveis se o backend retornar erro (ex: documento duplicado ou erro de conexão).

Loading States: Mostrar esqueletos de carregamento (Skeletons) enquanto os dados do Supabase estão sendo buscados.

5. Exemplo de Comportamento Esperado
"Ao abrir a tela, o sistema busca os primeiros 20 clientes. O usuário digita 'CAMAÇARI' na busca; o componente chama o Caso de Uso de Busca do Backend; a tabela é atualizada instantaneamente com os clientes daquela região, mantendo a acentuação correta tratada na migração."

Por que esse prompt é bom para você entender:
Separação de Preocupações: Ele explica que o Frontend não "manda" no banco; ele apenas "pede" para o Backend através do Axios.

Consistência: Garante que os campos que você corrigiu no Excel (Cidade, Estado) apareçam corretamente na tela.

UX (Experiência do Usuário): Foca em ferramentas como o React Query, que faz o sistema parecer muito rápido, pois ele guarda os dados em "cache".