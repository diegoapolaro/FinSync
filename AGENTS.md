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
│   │   ├── Transacao.cs           → Id, Descricao, Valor, Tipo, Data, ContaId, CategoriaId
│   │   ├── TransacaoDtos.cs       → Create/Update/TransacaoDto, PagedResponse<T>, DetalhamentoCategoriaDto
│   │   ├── TransacaoService.cs    → CRUD + filtros (inclui categoriaId) + paginação + export CSV
│   │   └── TransacoesController.cs → CRUD + GET /exportar, GET /resumo-periodo, GET /detalhamento
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
│   └── TipoConta.cs               → enum (Comercial, Pessoal)
├── Data/
│   ├── FinSyncDbContext.cs        → DbSets + relacionamentos (UsuarioId em Conta/Categoria)
│   └── DbSeeder.cs                → Seed automático de Usuario/Contas/Categorias
├── Handlers/GlobalExceptionHandler.cs
├── Helpers/DateRangeHelper.cs
├── Migrations/                    → EF Core Npgsql (InitialPostgres)
├── tests/FinSync.Tests/           → xUnit (Helpers, Services) — 39 testes passando
└── client/
    ├── src/
    │   ├── pages/                 → Extrato, RelatoriosPage, AjustesPage, LoginPage, LancamentosPage
    │   ├── components/
    │   │   ├── layout/            → MobileTopBar, DesktopHeader, DesktopSidebar, BottomNav, Layout
    │   │   ├── transactions/      → TransactionCard, TransactionTable
    │   │   ├── reports/           → ChartContainer
    │   │   ├── settings/          → SettingsSection
    │   │   └── common/            → ErrorBoundary, SummaryCard, Modal, FloatingActions, PeriodoPicker, ResponsiveGrid
    │   ├── contexts/              → AuthContext, ThemeContext, ToastContext
    │   ├── hooks/usePreferencias.js → fonte única de verdade do tema e preferências
    │   ├── services/api.js        → base URL via import.meta.env, parsing de erros, token JWT
    │   ├── utils/
    │   │   ├── constants.js       → TIPO_TRANSACAO.ENTRADA / .SAIDA centralizados
    │   │   ├── filterTransacoes.js → filtro por período (dia/mês/range), evita bug de timezone
    │   │   └── formatters.js      → formatação monetária, datas e rótulos de período
    │   ├── styles/
    │   └── test/
    └── package.json               → Vitest com 34 testes passando
```

**Padrão arquitetural:** vertical slices (feature-first) — Controller, Service, Dto e Entidade juntos por domínio dentro de `Features/`. Infra compartilhada em `Data/`, `Handlers/`, `Helpers/`; enums em `Shared/Enums/`.

---

## Modelos de Dados

1. **Usuario** — Id, Nome, Email, SenhaHash, DataCriacao
2. **Transacao** — Id, Descricao, Valor, Tipo (enum), Data (DateOnly), ContaId, CategoriaId, navegação para Conta
3. **Conta** — Id, Nome, Tipo (enum Comercial/Pessoal), Arquivada, UsuarioId, navegação para Transacoes
4. **Categoria** — Id, Nome, Cor (hex), Tipo (enum), UsuarioId

Dados isolados por usuário: Contas e Categorias têm `UsuarioId`; Transações herdam isolamento via `ContaId`.

---

## Status Atual

- **Back-end no Azure:** API .NET 10 implantada no Azure App Service (`https://finsync-api.azurewebsites.net`), integrada ao banco PostgreSQL remoto no Supabase. CORS liberado para o domínio do Vercel e localhost.
- **Front-end no Vercel:** Configuração SPA criada com `vercel.json` e `VITE_API_BASE_URL` direcionado para a API de produção.
- **Testes:** 43 testes xUnit (.NET) e 58 testes Vitest (React) 100% aprovados.
- **Auth & Segurança:** JWT Bearer com chaves isoladas em variáveis de ambiente, senhas com BCrypt, sessões isoladas por usuário, Google OAuth 2.0 (Google Identity Services + backend validation), rate limiting com `AddRateLimiter`, mitigação de timing attack e headers HTTP de segurança.

---

## Débitos Técnicos Conhecidos (Ordem de Prioridade)

1. **Gerenciamento Incompleto de Contas Arquivadas**:
   - O endpoint `PATCH /api/contas/{id}/arquivar` existe, mas `GET /api/contas` filtra estaticamente `!c.Arquivada`. Suportar `incluirArquivadas=true` na API e UI no front-end para listar e desarquivar contas.
2. **Cobertura de Testes Front-End Expandida**:
   - Testes unitários e de integração de `Extrato`, `AjustesPage`, `LancamentosPage`, `LoginPage`, `usePreferencias`, `api` e `formatters` implementados (58 testes no frontend e 43 no backend).
3. **Vulnerabilidades de Dependências NuGet (Alerta NU1903)**:
   - Pacotes `Microsoft.OpenApi` e `SQLitePCLRaw.lib.e_sqlite3` apresentam avisos de vulnerabilidade conhecidos que devem ser atualizados.
4. **Exportação só em CSV (PDF não implementado)**:
   - A UI exibe opção de PDF, mas a API retorna `BadRequest("Formato não suportado.")`. Necessário implementar exportação em PDF ou remover a opção temporariamente da interface.
5. **Notificações são apenas Toggles Locais**:
   - Não há lógica de disparo em background (ex.: lembrete diário de lançamentos ou alerta de saldo baixo ao cadastrar transação).
6. **Google Fonts carregada externamente**:
   - `@import url('https://fonts.googleapis.com/css2...')` ainda é carregada em `client/src/index.css`. Self-host via pacotes `@fontsource` é recomendado para estabilidade e performance offline.
7. **Ausência de TypeScript / PropTypes nos componentes compartilhados**:
   - Componentes como `SummaryCard`, `ChartContainer`, `TransactionTable`, `PeriodoPicker` não têm validação estrita de tipos de props.

---

## Próximos Passos (Ordem Sugerida)

1. **Push do Git e Deploy Automático no Vercel**: Commitar as mudanças para acionar a build do frontend no Vercel.
2. **Suportar Contas Arquivadas na API e Front**: Permitir listar e restaurar contas arquivadas (`incluirArquivadas=true`).
3. **Expandir testes no Front-End**: Cobrir `LancamentosPage` e `LoginPage` com React Testing Library.
4. **Atualizar pacotes NuGet** para sanar os avisos de segurança NU1903.
5. **Exportação em PDF** e notificações inteligentes.

---

## Convenções de Código

- **Backend:** métodos async sempre com sufixo `Async`; `Nullable` habilitado; primary constructors nos Services (`public class X(Y y)`); enums em vez de strings soltas; DTOs separados por Create/Update/Response
- **Frontend:** tipos de transação sempre via `TIPO_TRANSACAO` de `utils/constants.js` — nunca comparar string literal diretamente (`'Entrada'`/`'Saida'`, atenção ao acento: o backend serializa **sem acento**); tema sempre via `usePreferencias.js`, nunca acessar `localStorage` diretamente em outro lugar
- **Ambos:** ao alterar algo que impacta contrato de API (DTO, enum, rota), atualizar os dois lados na mesma tarefa
- **Segurança:** nunca salvar senha ou token em `localStorage` (usar `sessionStorage`); nunca commitar credenciais reais ou `appsettings.Development.json`

---

## URLs do Projeto

- API Produção (Azure): `https://finsync-api.azurewebsites.net`
- Documentação Scalar (Dev local): `http://localhost:5154/scalar/v1`
- Front-end Produção (Vercel): `https://fin-sync-tan.vercel.app`
- Front-end Local: `http://localhost:5173`

---

*Última atualização: 23/08/2026*