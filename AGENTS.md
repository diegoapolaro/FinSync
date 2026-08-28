# FinSync — Contexto Técnico do Projeto

## Visão Geral

Sistema web de controle financeiro (entradas/saídas), multiusuário, com dois contextos de uso:
1. **Gestão comercial** (ex: pizzaria) — rastreamento de receitas/despesas do negócio
2. **Gestão financeira pessoal** — controle de gastos e receitas pessoais

Cada usuário tem suas próprias Contas (livros), Categorias e Transações, isoladas por login.

---

## Stack Tecnológico

### Back-End
- **Linguagem:** C#
- **Framework:** ASP.NET Core Web API (.NET 10)
- **Banco de Dados:** PostgreSQL no Supabase (produção e dev remoto) / Npgsql + EF Core
- **ORM:** Entity Framework Core (migrations automáticas)
- **Autenticação:** JWT (Bearer token) + BCrypt (hash de senha)
- **Documentação API:** OpenAPI com Scalar.AspNetCore (`/scalar/v1` em dev)
- **Hospedagem:** Azure App Service Linux (.NET 10 runtime, `finsync-api.azurewebsites.net`)

### Front-End
- **Framework:** React 19 + Vite
- **Estilo:** Tailwind CSS
- **Roteamento:** react-router-dom
- **Lint/Format:** Oxlint + Prettier
- **Testes:** Vitest + React Testing Library (client), xUnit (backend)
- **Hospedagem:** Vercel (`fin-sync-tan.vercel.app`)

### Ambiente
- **Editor:** VS Code (C# Dev Kit)
- **.NET SDK:** 10.0.300
- **Ferramentas de geração:** Google Stitch (design/front-end), opencode (assistente de código no VS Code)

---

## Identidade Visual

- Conceito: Linguagem inspirada no Copilot Money — visual fintech cinemático de alta densidade de dados (*Apple Design Award style*)
- Logo: Monograma "FS" com acento azul elétrico (`#1C6CFF`) e brilho sutil
- Paleta: Azul elétrico primário (`#1C6CFF`), Deep Space Navy dark canvas (`#000814`), Cards Navy (`#09182F`), Saídas/negativo (`#FF4433`), Entradas/positivo (`#00CC4B`), Alertas (`#FF9900`), Light canvas (`#F8FAFC`)
- Geometria: Cards e modais com raio de 20-24px (`rounded-2xl` / `rounded-3xl`), botões e inputs `rounded-xl` (12px), pills e badges `rounded-full`
- Tipografia: Inter (display bold com tracking tight para títulos, 600 para subdisplays, 400 para corpo) + IBM Plex Mono para valores/datas com números tabulares (`tnum`)
- Componentes: Shadcn UI (`Button`, `Card`, `Input`, `Badge`, `Dialog`, `Table`, `Tabs`, `Switch`) + Lucide React
- Tema claro/escuro via CSS variables, fonte única de verdade em `usePreferencias.js` com modo escuro Deep Navy nativo

---

## Estrutura do Projeto

```
FinSync/
├── Program.cs                    → Configuração, CORS, JWT, DbContext PostgreSQL
├── FinSync.csproj
├── appsettings.json               → Configuração base / templates
├── vercel.json                    → Configuração de build e SPA rewrites para Vercel
├── Features/                      → Slices verticais por domínio (Model + Dto + Service + Controller)
│   ├── Auth/
│   │   ├── Usuario.cs             → Id, Nome, Email, SenhaHash, DataCriacao
│   │   ├── AuthDtos.cs            → RegistrarRequest, LoginRequest, AuthResponse
│   │   ├── AuthService.cs         → Registrar + Login com BCrypt + JWT
│   │   └── AuthController.cs      → POST /api/auth/registrar, /api/auth/login
│   ├── Transacoes/
│   │   ├── Transacao.cs           → Id, Descricao, Valor, Tipo, Data, Status, ContaId, CategoriaId, ParcelamentoId, NumeroParcela, TotalParcelas, RecorrenciaId
│   │   ├── TransacaoDtos.cs       → Create/Update/TransacaoDto, UpdateStatusTransacaoDto, PagedResponse<T>, DetalhamentoCategoriaDto
│   │   ├── TransacaoService.cs    → CRUD + parcelamento + recorrência + filtros + paginação + export CSV + UpdateStatus
│   │   └── TransacoesController.cs → CRUD + GET /exportar, GET /resumo-periodo, GET /detalhamento, PATCH /{id}/status
│   ├── Recorrencias/
│   │   ├── Recorrencia.cs         → Id, Descricao, Valor, Tipo, Frequencia, DataInicio, DataFim, StatusPadrao, Ativo, ContaId, CategoriaId, UsuarioId
│   │   ├── RecorrenciaDtos.cs     → Create/Update/RecorrenciaDto, ResumoRecorrenciasDto
│   │   ├── RecorrenciaService.cs  → CRUD + projeção de 12 meses + cálculo de métricas mensais + toggle ativo
│   │   └── RecorrenciasController.cs → CRUD + GET /resumo + PATCH /{id}/toggle-ativo + POST /processar
│   ├── Contas/
│   │   ├── Conta.cs               → Id, Nome, Tipo, Arquivada, UsuarioId
│   │   ├── ContaDtos.cs
│   │   ├── ContaService.cs        → CRUD + GET /{id}/resumo + ToggleArchive
│   │   └── ContasController.cs
│   └── Categorias/
│       ├── Categoria.cs           → Id, Nome, Cor, Tipo, UsuarioId
│       ├── CategoriaDtos.cs
│       ├── CategoriaService.cs    → CRUD (isolado por usuário)
│       └── CategoriasController.cs
├── Shared/Enums/
│   ├── TipoTransacao.cs           → enum (Entrada, Saida) — sem acento, serializado via JsonStringEnumConverter
│   ├── TipoConta.cs               → enum (Comercial, Pessoal)
│   ├── StatusTransacao.cs         → enum (Pago, Pendente)
│   └── FrequenciaRecorrencia.cs   → enum (Semanal, Quinzenal, Mensal, Anual)
├── Data/
│   ├── FinSyncDbContext.cs        → DbSets + relacionamentos (UsuarioId em Conta/Categoria/Recorrencia)
│   └── DbSeeder.cs                → Seed automático de Usuario/Contas/Categorias
├── Handlers/GlobalExceptionHandler.cs
├── Helpers/DateRangeHelper.cs
├── Migrations/                    → EF Core Npgsql (InitialPostgres, AddStatusToTransacao, AddRecorrenciasEParcelamentos)
├── tests/FinSync.Tests/           → xUnit (Helpers, Services, Controllers, Models) — 61 testes passando
└── client/
    ├── src/
    │   ├── pages/                 → Extrato, RelatoriosPage, AjustesPage, LoginPage, LancamentosPage
    │   ├── components/
    │   │   ├── layout/            → MobileTopBar, DesktopHeader, DesktopSidebar, BottomNav, Layout
    │   │   ├── transactions/      → TransactionCard, TransactionTable
    │   │   ├── reports/           → ChartContainer
    │   │   ├── settings/          → SettingsSection, RecorrenciasSection, ContasSection, CategoriasSection
    │   │   └── common/            → ErrorBoundary, SummaryCard, Modal, FloatingActions, PeriodoPicker, ResponsiveGrid
    │   ├── contexts/              → AuthContext, ThemeContext, ToastContext
    │   ├── hooks/usePreferencias.js → fonte única de verdade do tema e preferências
    │   ├── services/api.js        → base URL via import.meta.env, parsing de erros, token JWT, transações, contas, categorias e recorrências
    │   ├── utils/
    │   │   ├── constants.js       → TIPO_TRANSACAO, STATUS_TRANSACAO, FREQUENCIA_RECORRENCIA, MODO_PARCELAMENTO, MODO_LANCAMENTO
    │   │   ├── filterTransacoes.js → filtro por período (dia/mês/range), evita bug de timezone
    │   │   └── formatters.js      → formatação monetária, datas e rótulos de período
    │   ├── styles/
    │   └── test/
    └── package.json               → Vitest com 79 testes passando

**Padrão arquitetural:** vertical slices (feature-first) — Controller, Service, Dto e Entidade juntos por domínio dentro de `Features/`. Infra compartilhada em `Data/`, `Handlers/`, `Helpers/`; enums em `Shared/Enums/`.

---

## Modelos de Dados

1. **Usuario** — Id, Nome, Email, SenhaHash, DataCriacao, GoogleId
2. **Transacao** — Id, Descricao, Valor, Tipo (enum), Data (DateOnly), Status (enum Pago/Pendente), ContaId, CategoriaId, ParcelamentoId (Guid?), NumeroParcela (int?), TotalParcelas (int?), RecorrenciaId (int?), navegação para Conta e Recorrencia
3. **Recorrencia** — Id, Descricao, Valor, Tipo (enum), Frequencia (enum), DataInicio (DateOnly), DataFim (DateOnly?), StatusPadrao (enum), Ativo (bool), ContaId, CategoriaId, UsuarioId, navegação para Transacoes
4. **Conta** — Id, Nome, Tipo (enum Comercial/Pessoal), Arquivada, UsuarioId, navegação para Transacoes
5. **Categoria** — Id, Nome, Cor (hex), Tipo (enum), UsuarioId

Dados isolados por usuário: Contas, Categorias e Recorrências têm `UsuarioId`; Transações herdam isolamento via `ContaId`.

---

## Status Atual

- **Back-end no Azure:** API .NET 10 implantada no Azure App Service (`https://finsync-api.azurewebsites.net`), integrada ao banco PostgreSQL remoto no Supabase. CORS liberado para o domínio do Vercel e localhost.
- **Front-end no Vercel:** Configuração SPA criada com `vercel.json` e `VITE_API_BASE_URL` direcionado para a API de produção.
- **Testes:** 61 testes xUnit (.NET) e 79 testes Vitest (React) 100% aprovados.
- **Recorrências & Parcelamentos:** Divisão automática de compras parceladas com projeção de faturas futuras (2x a 72x), regras de recorrência periódica (mensal, semanal, anual) com motor de projeção de até 12 meses futuros e painel de gestão dedicado em Ajustes.
- **Auth & Segurança:** JWT Bearer com chaves isoladas em variáveis de ambiente, senhas com BCrypt, sessões isoladas por usuário, Google OAuth 2.0 (Google Identity Services + backend validation), rate limiting com `AddRateLimiter`, mitigação de timing attack e headers HTTP de segurança.

---

## URLs do Projeto

- API Produção (Azure): `https://finsync-api.azurewebsites.net`
- Documentação Scalar (Dev local): `http://localhost:5154/scalar/v1`
- Front-end Produção (Vercel): `https://fin-sync-tan.vercel.app`
- Front-end Local: `http://localhost:5173`

---

*Última atualização: 28/08/2026*