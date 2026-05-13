Desenvolva testes automatizados completos e uma estrutura inicial de repositório GitHub para o projeto backend RealServiços.
A aplicação foi construída em Node.js + TypeScript + Express + Supabase, seguindo estritamente Arquitetura Hexagonal, com estrutura:

src/
 ├── domain/
 ├── application/
 ├── infrastructure/
 │      ├── adapters/
 │      ├── middlewares/
 │      ├── routes/
 │      └── config/
🎯 Objetivos

Quero que você:

1. Gere toda a suíte de testes da aplicação, incluindo:
Testes unitários dos casos de uso em src/application
Testes unitários das entidades e validações em src/domain
Testes de integração dos controllers e rotas
Testes simulando autenticação, RBAC, uploads via multer e busca centralizada
Mock do Supabase (sem tocar na base real)
Cenários de erro e sucesso

Os testes devem usar:

Vitest (preferencial)
Supertest para rotas HTTP
ts-mockito ou mocks embutidos do Vitest

Inclua:

Arquivo vitest.config.ts
Pastas e estrutura:
tests/
 ├── application/
 ├── domain/
 ├── infrastructure/
2. Crie a estrutura inicial do repositório GitHub, contendo:
README.md completo em (Português do Brasil)

Com:

Resumo do sistema
Diagrama resumido da Arquitetura Hexagonal
Estrutura das pastas
Como rodar o projeto
Como configurar o Supabase
Como rodar os testes
Como fazer build
.gitignore (Node + TS + uploads + env)
GitHub Actions CI workflow

Arquivo: .github/workflows/ci.yml

Com:

Node 18+
Instalação de dependências
Build
Execução automática dos testes
Lint (opcional)
3. Gerar também instruções passo a passo para importar este código para um novo repositório GitHub, incluindo:
comandos git para inicializar repo
adicionar remoto
fazer primeiro push
como configurar secrets para CI (se necessário)
4. IMPORTANTE

Considere que o backend contém estes endpoints:

POST /api/clientes
POST /api/motores
POST /api/os (com upload)
GET /api/os/:id/relatorio
GET /api/search?query=

E estes middlewares:

authenticateUser (Supabase JWT)
requireRoles([roles])
errorHandler

Quero que os testes cubram todos.

Gere:

O código dos testes
A estrutura do repositório
O conteúdo do README
O GitHub Actions workflow
Os comandos git finais