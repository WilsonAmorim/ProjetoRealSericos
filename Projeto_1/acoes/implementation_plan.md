# Frontend Authentication Implementation Plan

This plan details the setup of the ReactJS/Tailwind frontend for the RealServiços system and the implementation of the login and authentication module as requested in `GEMINI.md`, incorporating your feedback.

## Setup and Configurations

- Initialize Vite React + TypeScript project in `Projeto_web` using `npm create vite@latest . -- --template react-ts`.
- Install dependencies: `tailwindcss`, `postcss`, `autoprefixer`, `react-router-dom`, `lucide-react`, `@supabase/supabase-js`, `axios`.
- Create `.env` with provided values:
  ```
  VITE_SUPABASE_URL=https://yxfqptzbrdkqcetxygzn.supabase.co
  VITE_SUPABASE_ANON_KEY=sb_publishable_UjwqFUa25-jZavn8Js6rcQ_LUIrNJtj
  VITE_API_URL=http://localhost:3000
  ```

## Proposed Changes

### Project Setup
- Configure `tailwind.config.js` with the corporate branding colors (Azul e Cinza) and `index.css`.

### Authentication Module

#### [NEW] `src/lib/supabase.ts`
- Initialize Supabase client using environment variables as the "Client Adapter".

#### [NEW] `src/contexts/AuthContext.tsx`
- Create the authentication context.
- Implement persistent auth using Supabase session.
- Add **Constraint: Restrição de usuário ativo**:
  - Após o `signInWithPassword`, fazer um `select` na tabela `usuarios`.
  - Verificar se `ativo === 'S'`. Se for `'N'`, forçar o `signOut` e exibir: *"Usuário desativado. Entre em contato com o administrador."*
- Guardar no estado o `id_perfil` para as validações de rota.

#### [NEW] `src/pages/Login.tsx`
- Build a modern login screen using Tailwind CSS.
- **Identidade Visual**: Aplicar tons de Azul e Cinza corporativos para passar credibilidade.
- Add form validation (email format).
- Implement loading states to prevent double-clicking.
- Integrate with `AuthContext` to authenticate.

#### [NEW] `src/pages/Dashboard.tsx`
- Create a placeholder dashboard page for logged-in users.

#### [NEW] `src/components/ProtectedRoute.tsx`
- Implementar a lógica baseada no `id_perfil`.
- Se a rota for (por exemplo) `/faturamento` e o `id_perfil` do usuário for de "Mecânico", redirecionar para o Dashboard com um alerta de *"Acesso Negado"*.
- Bloquear usuários não autenticados enviando-os para `/login`.

#### [MODIFY] `src/App.tsx`
- Configure `react-router-dom` routes (`/login`, `/dashboard`).
- Wrap the application with `AuthProvider`.

## Verification Plan

### Automated Tests
- Run `npm run build` to ensure the project compiles successfully.
- Verify TypeScript types are correct.

### Manual Verification
- Test the login flow, ensuring that inactive users are blocked.
- Test role-based redirecting (e.g., block mechanics from billing).
- Ensure UI matches corporate colors (Blue and Gray).
