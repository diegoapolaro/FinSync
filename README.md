# FinSync

Sistema web full-stack de controle financeiro (entradas e saídas), multiusuário, com suporte à **gestão comercial** (ex: pequenas empresas, comércio, pizzaria) e **gestão financeira pessoal**. Inspirado no visual fintech moderno (*Copilot Money style*) com design responsivo cinemático, alta densidade de dados, projeções de parcelamento/recorrência e segurança robusta.

---

## 🌐 URLs do Projeto

- **Frontend (Produção - Vercel):** [https://fin-sync-tan.vercel.app](https://fin-sync-tan.vercel.app)
- **API Backend (Produção - Azure):** [https://finsync-api.azurewebsites.net](https://finsync-api.azurewebsites.net)
- **Documentação Interativa da API (Dev Local - Scalar):** `http://localhost:5154/scalar/v1`

---

## 🛠️ Stack Tecnológico

### Back-End
- **Linguagem & Framework:** C# / ASP.NET Core Web API (.NET 10)
- **Banco de Dados:** PostgreSQL (Supabase / local) via Entity Framework Core & Npgsql
- **Autenticação & Segurança:** JWT Bearer, senhas com BCrypt, Google OAuth 2.0 (Google Identity Services com validação de token backend), Rate Limiting (`AddRateLimiter`), mitigação de timing attack e Security Headers
- **Documentação de API:** OpenAPI + Scalar (`Scalar.AspNetCore` em `/scalar/v1`)
- **Hospedagem:** Azure App Service Linux (.NET 10 runtime)

### Front-End
- **Framework:** React 19 + Vite
- **Estilização:** Tailwind CSS + Radix UI / Shadcn UI primitives + Lucide React
- **Roteamento:** react-router-dom
- **Gerenciamento de Estado/Tema:** Context API (`AuthContext`, `ThemeContext`, `ToastContext`), `usePreferencias` (fonte única de verdade do tema e preferências)
- **Lint / Formatação:** Oxlint + Prettier
- **Hospedagem:** Vercel

### Testes Automatizados
- **Backend:** xUnit + Entity Framework In-Memory (**61 testes aprovados**)
- **Frontend:** Vitest + React Testing Library (**83 testes aprovados**)

---

## 📁 Estrutura do Projeto

```
FinSync/
├── Program.cs                    → Configuração de DI, CORS, JWT, Rate Limit, DbContext e Scalar
├── FinSync.csproj                → Definição de pacotes e versão .NET 10
├── appsettings.json              → Configurações de ambiente (ConnectionStrings, JWT, Google OAuth)
├── vercel.json                   → Configuração de SPA rewrites e headers para Vercel
├── Features/                     → Vertical slices por domínio (Model + DTOs + Service + Controller)
│   ├── Auth/                     → Autenticação local (BCrypt + JWT), Google OAuth e gestão de senhas
│   │   ├── Usuario.cs            → Entidade Usuario (Id, Nome, Email, SenhaHash, DataCriacao, GoogleId)
│   │   ├── AuthDtos.cs           → DTOs de login, registro, Google token e alteração/definição de senha
│   │   ├── AuthService.cs        → Regras de autenticação, provisionamento inicial e validação Google
│   │   └── AuthController.cs     → POST /api/auth/registrar, /login, /google, PUT /alterar-senha, /definir-senha
│   ├── Transacoes/               → Lançamentos financeiros com categorização, parcelas e status
│   │   ├── Transacao.cs          → Entidade Transacao (Descricao, Valor, Tipo, Data, Status, ParcelamentoId, RecorrenciaId)
│   │   ├── TransacaoDtos.cs      → DTOs de CRUD, paginação, resumo, detalhamento e atualização de status
│   │   ├── TransacaoService.cs   → CRUD + parcelamento + recorrência + paginação + exportação CSV + toggle status
│   │   └── TransacoesController.cs → Endpoints de transações, resumo, detalhamento, exportação e PATCH status
│   ├── Recorrencias/             → Regras de recorrência periódica e projeção financeira futura
│   │   ├── Recorrencia.cs        → Entidade Recorrencia (Frequencia, Valor, StatusPadrao, Ativo, Periodos)
│   │   ├── RecorrenciaDtos.cs    → DTOs de criação, edição, listagem e métricas consolidadas
│   │   ├── RecorrenciaService.cs → CRUD + projeção de 12 meses + cálculo de impacto mensal + toggle ativo
│   │   └── RecorrenciasController.cs → Endpoints de regras recorrentes, resumo e processamento em lote
│   ├── Contas/                   → Carteiras e livros contábeis (Comercial / Pessoal)
│   │   ├── Conta.cs              → Entidade Conta (Nome, Tipo, Arquivada, UsuarioId)
│   │   ├── ContaDtos.cs          → DTOs de criação, atualização e resposta de Conta
│   │   ├── ContaService.cs       → CRUD, cálculo de saldo consolidado e arquivamento
│   │   └── ContasController.cs   → Endpoints de gestão de contas e resumo de saldo
│   └── Categorias/               → Categorias financeiras isoladas por usuário
│       ├── Categoria.cs          → Entidade Categoria (Nome, Cor, Tipo, UsuarioId)
│       ├── CategoriaDtos.cs      → DTOs de Categoria
│       ├── CategoriaService.cs   → CRUD isolado por usuário logado
│       └── CategoriasController.cs → Endpoints de categorias
├── Shared/
│   └── Enums/
│       ├── TipoTransacao.cs          → Enum: Entrada / Saida
│       ├── TipoConta.cs              → Enum: Comercial / Pessoal
│       ├── StatusTransacao.cs        → Enum: Pago / Pendente
│       └── FrequenciaRecorrencia.cs  → Enum: Semanal / Quinzenal / Mensal / Anual
├── Data/
│   ├── FinSyncDbContext.cs       → DbContext do EF Core com índices e isolamento por usuário
│   └── DbSeeder.cs               → Seed inicial do ambiente
├── Handlers/
│   └── GlobalExceptionHandler.cs → Tratamento centralizado de erros em padrão ProblemDetails
├── Helpers/
│   └── DateRangeHelper.cs        → Utilitários de cálculo de intervalos de datas
├── Migrations/                   → Migrações gerenciadas pelo EF Core para PostgreSQL
├── tests/
│   └── FinSync.Tests/            → Testes unitários e de integração xUnit do backend (61 testes)
└── client/                       → Frontend React 19 (Vite)
    ├── package.json              → Dependências e scripts de teste / build (83 testes Vitest)
    ├── vite.config.js            → Configuração do Vite e proxy reverso local
    └── src/
        ├── pages/                → DashboardPage, Extrato, LancamentosPage, RelatoriosPage, AjustesPage, LoginPage
        ├── components/           → Componentes divididos por domínio (layout, transactions, reports, settings, common, ui)
        ├── contexts/             → AuthContext, ThemeContext, ToastContext
        ├── hooks/usePreferencias.js → Gerenciador central de preferências e tema escuro/claro
        ├── services/api.js        → Cliente HTTP com injeção automática de JWT e tratamento de erros
        └── utils/                → Formatadores monetários, constantes, filtros de data
```

---

## 🚀 Como Executar Localmente

### Pré-requisitos
- [.NET 10 SDK](https://dotnet.microsoft.com/download/dotnet/10.0)
- [Node.js 20+](https://nodejs.org/) e npm
- Instância PostgreSQL (local ou Supabase)

### 1. Configurar o Back-End

Crie ou edite o arquivo `appsettings.Development.json` (ou ajuste as variáveis em `appsettings.json`):

```json
{
  "ConnectionStrings": {
    "FinSync": "Host=localhost;Port=5432;Database=finsync;Username=postgres;Password=suasenha"
  },
  "Jwt": {
    "Key": "sua-chave-secreta-jwt-de-pelo-menos-32-caracteres-para-dev",
    "Issuer": "FinSync",
    "Audience": "FinSync"
  },
  "Google": {
    "ClientId": "seu-google-client-id.apps.googleusercontent.com"
  }
}
```

Inicie a API:

```bash
dotnet run
```

- A API rodará em `http://localhost:5154`.
- Acesse a documentação interativa em `http://localhost:5154/scalar/v1`.
- Na inicialização, as migrações do PostgreSQL são aplicadas automaticamente.

### 2. Iniciar o Front-End

Em outro terminal:

```bash
cd client
npm install
npm run dev
```

- A aplicação estará disponível em `http://localhost:5173`.
- O Vite faz proxy automático das requisições `/api/*` para o backend local.

---

## 🧪 Executando os Testes

```bash
# Testes do Back-End (xUnit — 61 testes)
dotnet test

# Testes do Front-End (Vitest — 83 testes)
cd client
npm test -- --run
```

---

## 📡 Endpoints da API

### Autenticação (`/api/auth`)

| Método | Endpoint | Autenticado? | Descrição |
| --- | --- | :---: | --- |
| `POST` | `/api/auth/registrar` | Não | Cadastro de novo usuário com provisionamento automático inicial |
| `POST` | `/api/auth/login` | Não | Autenticação local, retorna token JWT |
| `POST` | `/api/auth/google` | Não | Autenticação / cadastro via Google OAuth 2.0 |
| `PUT` | `/api/auth/alterar-senha` | Sim | Alteração de senha da conta |
| `PUT` | `/api/auth/definir-senha` | Sim | Definição de senha para contas originadas via Google |

*Todos os demais endpoints exigem o cabeçalho `Authorization: Bearer <token>`.*

### Transações (`/api/transacoes`)

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/transacoes` | Lista transações com paginação no servidor (`page`, `pageSize`, `contaId`, `data`, `dataInicio`, `dataFim`, `categoriaId`, `status`) |
| `GET` | `/api/transacoes/{id}` | Busca transação por ID |
| `POST` | `/api/transacoes` | Cria transação única ou gera compras parceladas (2x a 72x) |
| `PUT` | `/api/transacoes/{id}` | Atualiza uma transação existente |
| `PATCH` | `/api/transacoes/{id}/status` | Alterna status entre `Pago` e `Pendente` |
| `DELETE` | `/api/transacoes/{id}` | Remove transação (suporta exclusão em lote de parcelas/recorrências) |
| `GET` | `/api/transacoes/resumo-periodo` | Totais de entradas, saídas e balanço consolidado no período |
| `GET` | `/api/transacoes/detalhamento` | Agrupamento por categoria com valores e percentuais para relatórios |
| `GET` | `/api/transacoes/exportar` | Exportação de transações em CSV (`contaId`, `dataInicio`, `dataFim`, `formato=csv`) |

### Recorrências (`/api/recorrencias`)

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/recorrencias` | Lista todas as regras de recorrência do usuário com projeção de 12 meses |
| `GET` | `/api/recorrencias/{id}` | Busca regra de recorrência por ID |
| `POST` | `/api/recorrencias` | Cria nova regra de recorrência periódica |
| `PUT` | `/api/recorrencias/{id}` | Atualiza dados e frequência da recorrência |
| `PATCH` | `/api/recorrencias/{id}/toggle-ativo` | Ativa ou pausa uma regra de recorrência |
| `DELETE` | `/api/recorrencias/{id}` | Exclui regra (com opção de manter ou excluir lançamentos gerados) |
| `GET` | `/api/recorrencias/resumo` | Retorna métricas consolidadas mensais (comprometimento fixo da renda) |
| `POST` | `/api/recorrencias/processar` | Processa e gera lançamentos pendentes para a competência atual |

### Contas (`/api/contas`)

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/contas` | Lista todas as contas ativas do usuário |
| `GET` | `/api/contas/{id}` | Busca conta específica por ID |
| `POST` | `/api/contas` | Cria nova conta (Comercial ou Pessoal) |
| `PUT` | `/api/contas/{id}` | Atualiza nome e dados da conta |
| `PATCH` | `/api/contas/{id}/arquivar` | Alterna status de arquivamento da conta |
| `DELETE` | `/api/contas/{id}` | Remove conta (apenas se não houver transações vinculadas) |
| `GET` | `/api/contas/{id}/resumo` | Retorna o saldo consolidado da conta |

### Categorias (`/api/categorias`)

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/categorias` | Lista categorias do usuário logado |
| `GET` | `/api/categorias/{id}` | Busca categoria por ID |
| `POST` | `/api/categorias` | Cria categoria com cor hexadecimal e tipo (`Entrada`/`Saida`) |
| `PUT` | `/api/categorias/{id}` | Atualiza nome, cor ou tipo da categoria |
| `DELETE` | `/api/categorias/{id}` | Exclui categoria |

---

## 📊 Modelos de Dados Principais

### Transação
```json
{
  "id": 1,
  "descricao": "Notebook Dell (1/10)",
  "valor": 450.00,
  "tipo": "Saida",
  "status": "Pago",
  "data": "2026-08-28",
  "contaId": 1,
  "contaNome": "Pessoal",
  "categoriaId": 3,
  "categoriaNome": "Equipamentos",
  "categoriaCor": "#1C6CFF",
  "parcelamentoId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "numeroParcela": 1,
  "totalParcelas": 10,
  "recorrenciaId": null
}
```

### Regra de Recorrência
```json
{
  "id": 1,
  "descricao": "Assinatura Internet",
  "valor": 129.90,
  "tipo": "Saida",
  "frequencia": "Mensal",
  "dataInicio": "2026-01-01",
  "dataFim": null,
  "statusPadrao": "Pendente",
  "ativo": true,
  "contaId": 1,
  "categoriaId": 2
}
```

---

## ✅ Funcionalidades Implementadas

- [x] **Autenticação & Segurança:** Registro e login via JWT com BCrypt, rate limiting, Google OAuth 2.0 e cabeçalhos de segurança.
- [x] **Onboarding Zero-Atrito:** Auto-provisionamento de conta `"Pessoal"` e catálogo de 10 categorias essenciais no cadastro do usuário.
- [x] **Modal Rápido de Contas (`NovaContaModal`):** Criação instantânea de contas/livros pela barra lateral e dashboard.
- [x] **Gestão de Recorrências & Parcelamentos:** Divisão automática de compras parceladas (2x a 72x) e regras periódicas com projeção de faturas futuras (até 12 meses).
- [x] **Status de Transação (Pago/Pendente):** Controle de liquidação com toggle rápido de 1 clique e alertas de contas a vencer.
- [x] **Dashboard Cinemático:** Indicadores em tempo real (Entradas, Saídas, Saldo, Taxa de Poupança), gráfico Donut de categorias e Evolução Semanal do fluxo de caixa.
- [x] **Empty States Inteligentes:** Welcome Hero e CTAs contextuais para registrar a primeira entrada/despesa.
- [x] **Relatórios Avançados & PDF:** Balanço Patrimonial, Comparativo de Períodos e Exportação em PDF e CSV.
- [x] **Isolamento Multiusuário:** Dados de contas, categorias, transações e recorrências 100% isolados por `UsuarioId`.
- [x] **Design Fintech:** Interface responsiva moderna inspirada no estilo Copilot Money com tema escuro/claro nativo persistido.
- [x] **Infraestrutura em Produção:** API hospedada no Azure App Service com PostgreSQL no Supabase e frontend na Vercel.
- [x] **Cobertura Abrangente de Testes:** 61 testes xUnit (backend) e 83 testes Vitest/Testing Library (frontend).
