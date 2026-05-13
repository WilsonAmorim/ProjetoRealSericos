Prompt: Tela de Login e Autenticação (RealServiços)
Contexto:
Estou desenvolvendo o módulo de autenticação do sistema RealServiços usando ReactJS e Tailwind CSS. O backend já possui as tabelas usuarios e perfis_acesso populadas no Supabase.

Objetivo:
Crie uma tela de login moderna e um provedor de contexto de autenticação (AuthContext) que gerencie o acesso à tela principal (Dashboard).

Habilidades (Skills) a Implementar:

Persistent Auth: Utilize o @supabase/supabase-js para gerenciar a sessão do usuário.
    VITE_SUPABASE_URL=https://yxfqptzbrdkqcetxygzn.supabase.co
    VITE_SUPABASE_ANON_KEY=sb_publishable_UjwqFUa25-jZavn8Js6rcQ_LUIrNJtj
    VITE_API_URL=http://localhost:3000

Role-Based Access: Após o login, busque o id_perfil do usuário na tabela usuarios para carregar as permissões corretas no estado global.

Redirecionamento Inteligente: Usuário logado deve ser enviado para /dashboard; usuário não autenticado deve ser bloqueado em rotas protegidas.

Restrições (Constraints):

Status Ativo: Apenas usuários com a coluna ativo = 'S' podem realizar login.

Segurança de Input: O formulário deve validar o formato do e-mail antes de disparar a requisição para o Supabase.

Identidade Visual: Utilize Tailwind para criar um layout centralizado, limpo, com foco no branding da RealServiços (tons de Azul e Cinza).

Requisitos Técnicos:

Use react-router-dom para as rotas.

Use lucide-react para os ícones de e-mail e senha.

Implemente um loading state no botão de entrar para evitar cliques duplos.

Saída Esperada:

Código do AuthProvider.tsx (Contexto).
    No AuthContext.tsx (A Skill de RBAC)
        Não basta apenas logar no Supabase Auth. Você precisa garantir a Restrição de usuário ativo:
        Após o signInWithPassword, faça um select na sua tabela usuarios.
            Constraint: Verifique se ativo === 'S'. Se for 'N', force o signOut e exiba uma mensagem: "Usuário desativado. Entre em contato com o administrador."

Código da página Login.tsx (Componente visual).
    No Login.tsx (UX & Identidade)
        Como sua base de dados já está populada, use o login para validar a Skill de Identidade Visual. Use os tons de Azul e Cinza corporativos que definimos para passar credibilidade aos funcionários da oficina.

Configuração básica das rotas protegidas no App.tsx.
    No ProtectedRoute.tsx (Proteção de Rotas)
        Implemente a lógica baseada no id_perfil:
            Se a rota for /faturamento e o id_perfil do usuário logado for de "Mecânico", redirecione para o Dashboard com um alerta de "Acesso Negado".

O que você deve observar ao rodar esse código:
A Conexão com o Supabase: O Gemini deve usar as variáveis de ambiente que definimos no seu README (VITE_API_URL e VITE_API_KEY).

O Redirecionamento: Verifique se, ao clicar em "Entrar", ele está consultando a sua tabela de usuarios para validar se o usuário está Ativo (conforme sua regra de negócio) antes de liberar o acesso.

Persistência: Se você atualizar a página (F5) na tela principal, o AuthContext deve manter o usuário logado, buscando a sessão no localStorage automaticamente.