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
- **Banco de Dados:** SQLite (`finsync.db`, local — migração pra PostgreSQL/SQL Server planejada para produção)
- **ORM:** Entity Framework Core (migrations + seed automático)
- **Autenticação:** JWT (Bearer token) + BCrypt (hash de senha)
- **Documentação API:** OpenAPI com Scalar.AspNetCore (`/scalar/v1` em dev)

### Front-End
- **Framework:** React 19 + Vite
- **Estilo:** Tailwind CSS
- **Roteamento:** react-router-dom
- **Lint/Format:** Oxlint + Prettier
- **Testes:** Vitest + React Testing Library (client), xUnit (backend)

### Ambiente
- **Editor:** VS Code (C# Dev Kit)
- **.NET SDK:** 10.0.300
- **Ferramentas de geração:** Google Stitch (design/front-end), opencode (assistente de código no VS Code)

---

## Identidade Visual

- Conceito: Linguagem inspirada na Wise — visual fintech escandinavo, limpo e sofisticado
- Logo: Monograma circular "FS" com acento verde Wise (`#9FE870`) e preto tinta (`#0E0F0C`)
- Paleta: Verde primário Wise (`#9FE870`), canvas sage (`#E8EBE6`), tinta preto quente (`#0E0F0C`), saídas/negativo (`#D03238`), entradas/positivo (`#2EAD4B`), alertas (`#FFD11A`)
- Geometria: Cards e botões em pill com raio de 24px (`rounded-3xl` / `rounded-[24px]`)
- Tipografia: Inter (display peso 900 para títulos, 600 para subdisplays, 400 para corpo) + IBM Plex Mono para valores/datas
- Componentes: Shadcn UI (`Button`, `Card`, `Input`, `Badge`, `Dialog`, `Table`, `Tabs`, `Switch`) + Lucide React
- Tema claro/escuro via CSS variables, fonte única de verdade em `usePreferencias.js`

---

## Estrutura do Projeto

```
FinSync/
├── Program.cs                    → Configuração, CORS, seed inicial, JWT
├── FinSync.csproj
├── appsettings.json               → Connection string SQLite + JWT config
├── finsync.db                     → Banco SQLite local (não versionar)
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
├── Migrations/                    → EF Core (InitialCreate única até o momento)
├── tests/FinSync.Tests/           → xUnit (Helpers, Services) — 36 testes passando
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
    └── package.json               → Vitest com 16 testes passando
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

- **Back-end:** 4 controllers (Auth, Transacoes, Contas, Categorias), EF Core + SQLite, seed automático, JWT + BCrypt, paginação server-side, filtros por data e `categoriaId`, 36 testes xUnit passando.
- **Front-end:** Extrato, Relatórios, Ajustes, Lançamentos e Login funcionais; roteamento real; componentes modulares; tema claro/escuro via Tailwind e variáveis CSS; 16 testes Vitest passando (utilitários de filtro, formatação e renderização de App).
- **Auth:** JWT implementado, persistência de sessão segura via `sessionStorage`, dados isolados por usuário (Contas/Categorias/Transações).

---

## Débitos Técnicos Conhecidos (Ordem de Prioridade)

1. **UI falsa de "Alterar Senha" em AjustesPage**:
   - O formulário em `AjustesPage.jsx` apenas exibe toast simulado de sucesso. Falta implementar o endpoint seguro no back-end (`PUT /api/auth/alterar-senha` ou `POST /api/auth/senha` com validação da senha atual via BCrypt) e conectar ao `services/api.js`.
2. **Modularização de `AjustesPage.jsx` (~826 linhas)**:
   - A página de ajustes concentra toda a lógica de Contas, Categorias, Modais e Formulários em um único arquivo. Necessário extrair em submódulos (`ContasSection.jsx`, `CategoriasSection.jsx`, `SegurancaSection.jsx`, `ExportarSection.jsx`, `NotificacoesSection.jsx`).
3. **Filtro por Categoria não exposto no Front-end**:
   - O back-end já aceita `categoriaId` em `GET /api/transacoes`, mas `client/src/services/api.js` não expõe o parâmetro e a tela `Extrato.jsx` não possui seletor/dropdown para filtrar transações por categoria.
4. **Preferências do Usuário Desconectadas em AjustesPage**:
   - Os seletores de Idioma, Moeda e switches de Notificações não estão vinculados ao `usePreferencias` (`atualizar`), perdendo as alterações do usuário ao recarregar a tela.
5. **Gerenciamento Incompleto de Contas Arquivadas**:
   - O endpoint `PATCH /api/contas/{id}/arquivar` existe, mas `GET /api/contas` filtra estaticamente `!c.Arquivada`. Não há suporte a `incluirArquivadas=true` na API nem UI no front-end para listar e desarquivar contas.
6. **Cobertura de Testes Front-End**:
   - Embora os testes unitários de utilitários e back-end estejam em dia (36 testes no backend), faltam testes de componentes e fluxos de tela (`AjustesPage`, `Extrato`, `LancamentosPage`, `LoginPage`).
7. **Vulnerabilidades de Dependências NuGet (Alerta NU1903)**:
   - Pacotes `Microsoft.OpenApi` e `SQLitePCLRaw.lib.e_sqlite3` apresentam avisos de vulnerabilidade conhecidos que devem ser atualizados.
8. **Exportação só em CSV (PDF não implementado)**:
   - A UI exibe opção de PDF, mas a API retorna `BadRequest("Formato não suportado.")`. Necessário implementar exportação em PDF ou remover a opção temporariamente da interface.
9. **Notificações são apenas Toggles Locais**:
   - Não há lógica de disparo em background (ex.: lembrete diário de lançamentos ou alerta de saldo baixo ao cadastrar transação).
10. **Google Fonts carregada externamente**:
    - `@import url('https://fonts.googleapis.com/css2...')` ainda é carregada em `client/src/index.css`. Self-host via pacotes `@fontsource` é recomendado para estabilidade e performance offline.
11. **Ausência de TypeScript / PropTypes nos componentes compartilhados**:
    - Componentes como `SummaryCard`, `ChartContainer`, `TransactionTable`, `PeriodoPicker` não têm validação estrita de tipos de props.
12. **SQLite em produção não escala com alta concorrência**:
    - Adequado para desenvolvimento local; avaliar migração para PostgreSQL antes de qualquer deploy em produção.

---

## Próximos Passos (Ordem Sugerida)

1. **Implementar "Alterar Senha" de ponta a ponta**: Criar endpoint no back-end com hash BCrypt e integrar com o formulário em `AjustesPage`.
2. **Modularizar `AjustesPage.jsx`**: Dividir o arquivo de 826 linhas em componentes de seção menores em `components/settings/`.
3. **Integrar Filtro de Categoria no Extrato**: Atualizar `services/api.js` e adicionar filtro na interface de `Extrato.jsx`.
4. **Persistir Preferências em AjustesPage**: Conectar Idioma, Moeda e Notificações ao `usePreferencias`.
5. **Suportar Contas Arquivadas na API e Front**: Permitir listar e restaurar contas arquivadas.
6. **Expandir testes no Front-End**: Testar componentes chave com React Testing Library.
7. **Atualizar pacotes NuGet** para sanar os avisos de segurança NU1903.
8. **Exportação em PDF** e notificações inteligentes.

---

## Convenções de Código

- **Backend:** métodos async sempre com sufixo `Async`; `Nullable` habilitado; primary constructors nos Services (`public class X(Y y)`); enums em vez de strings soltas; DTOs separados por Create/Update/Response
- **Frontend:** tipos de transação sempre via `TIPO_TRANSACAO` de `utils/constants.js` — nunca comparar string literal diretamente (`'Entrada'`/`'Saida'`, atenção ao acento: o backend serializa **sem acento**); tema sempre via `usePreferencias.js`, nunca acessar `localStorage` diretamente em outro lugar
- **Ambos:** ao alterar algo que impacta contrato de API (DTO, enum, rota), atualizar os dois lados na mesma tarefa
- **Segurança:** nunca salvar senha ou token em `localStorage` (usar `sessionStorage`); nunca commitar `finsync.db`, `appsettings.Development.json` ou `client/dist`

---

## URLs de Desenvolvimento

- API local: `http://localhost:5154`
- Documentação interativa: `http://localhost:5154/scalar/v1`
- OpenAPI JSON: `http://localhost:5154/openapi/v1.json`
- Front-end (Vite dev): `http://localhost:5173`

---

*Última atualização: 23/08/2026*