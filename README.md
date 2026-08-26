# FinSync

Sistema web full-stack de controle financeiro (entradas e saídas), multiusuário, com suporte à **gestão comercial** (ex: pequenas empresas, pizzaria) e **gestão financeira pessoal**. Inspirado no visual fintech moderno (*Copilot Money style*) com design responsivo, gráficos analíticos e segurança robusta.

---

## 🌐 URLs do Projeto

- **Frontend (Produção - Vercel):** [https://fin-sync-tan.vercel.app](https://fin-sync-tan.vercel.app)
- **API Backend (Produção - Azure):** [https://finsync-api.azurewebsites.net](https://finsync-api.azurewebsites.net)
- **Documentação Interativa da API (Dev Local - Scalar):** `http://localhost:5154/scalar/v1`

---

## 🛠️ Stack Tecnológico

### Back-End
- **Linguagem & Framework:** C# / ASP.NET Core Web API (.NET 10)
- **Banco de Dados:** PostgreSQL (Supabase) via Entity Framework Core & Npgsql
- **Autenticação & Segurança:** JWT Bearer, BCrypt, Google OAuth 2.0 (Google Identity Services com validação de token backend), Rate Limiting (`AddRateLimiter`) e Security Headers
- **Documentação de API:** OpenAPI + Scalar (`Scalar.AspNetCore`)
- **Hospedagem:** Azure App Service Linux

### Front-End
- **Framework:** React 19 + Vite
- **Estilização:** Tailwind CSS + Radix UI / Shadcn UI primitives + Lucide React
- **Roteamento:** react-router-dom
- **Gerenciamento de Estado/Tema:** Context API (`AuthContext`, `ThemeContext`, `ToastContext`), `usePreferencias`
- **Lint / Formatação:** Oxlint + Prettier
- **Hospedagem:** Vercel

### Testes Automatizados
- **Backend:** xUnit + Entity Framework In-Memory (43 testes aprovados)
- **Frontend:** Vitest + React Testing Library (58 testes aprovados)

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
│   │   ├── Usuario.cs            → Entidade Usuario (Id, Nome, Email, SenhaHash, DataCriacao)
│   │   ├── AuthDtos.cs           → DTOs de login, registro, Google token e alteração de senha
│   │   ├── AuthService.cs        → Regras de autenticação, geração de JWT e validação Google
│   │   └── AuthController.cs     → POST /api/auth/registrar, /login, /google, PUT /alterar-senha
│   ├── Transacoes/               → Lançamentos financeiros com categorização e vínculos de conta
│   │   ├── Transacao.cs          → Entidade Transacao (Descricao, Valor, Tipo, Data, ContaId, CategoriaId)
│   │   ├── TransacaoDtos.cs      → DTOs de CRUD, paginação, resumo do período e detalhamento
│   │   ├── TransacaoService.cs   → CRUD, paginação no servidor, agregações e exportação CSV
│   │   └── TransacoesController.cs → Endpoints de transações, resumo, detalhamento e exportação
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
│       ├── TipoTransacao.cs      → Enum: Entrada / Saida
│       └── TipoConta.cs          → Enum: Comercial / Pessoal
├── Data/
│   ├── FinSyncDbContext.cs       → DbContext do EF Core com índices e isolamento por usuário
│   └── DbSeeder.cs               → Seed inicial automático de contas e categorias padrão
├── Handlers/
│   └── GlobalExceptionHandler.cs → Tratamento centralizado de erros em padrão ProblemDetails
├── Helpers/
│   └── DateRangeHelper.cs        → Utilitários de cálculo de intervalos de datas
├── Migrations/                   → Migrações gerenciadas pelo EF Core para PostgreSQL
├── tests/
│   └── FinSync.Tests/            → Testes unitários e de integração xUnit do backend
└── client/                       → Frontend React (Vite)
    ├── package.json              → Dependências e scripts de teste / build
    ├── vite.config.js            → Configuração do Vite e proxy reverso local
    └── src/
        ├── pages/                → Extrato, LancamentosPage, RelatoriosPage, AjustesPage, LoginPage
        ├── components/           → Componentes divididos por domínio (layout, transactions, settings, etc.)
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
  }
}
```

Inicie a API:

```bash
dotnet run
```

- A API rodará em `http://localhost:5154`.
- Acesse a documentação interativa em `http://localhost:5154/scalar/v1`.
- Na inicialização, as migrações do PostgreSQL são aplicadas e as categorias/contas padrão são populadas.

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
# Testes do Back-End (xUnit — 43 testes)
cd tests/FinSync.Tests
dotnet test

# Testes do Front-End (Vitest — 58 testes)
cd client
npm test
```

---

## 📡 Endpoints da API

### Autenticação (`/api/auth`)

| Método | Endpoint | Autenticado? | Descrição |
| --- | --- | :---: | --- |
| `POST` | `/api/auth/registrar` | Não | Cadastro de novo usuário |
| `POST` | `/api/auth/login` | Não | Autenticação local, retorna token JWT |
| `POST` | `/api/auth/google` | Não | Autenticação / cadastro via Google OAuth 2.0 |
| `PUT` | `/api/auth/alterar-senha` | Sim | Alteração de senha da conta |
| `PUT` | `/api/auth/definir-senha` | Sim | Definição de senha para contas originadas via Google |

*Todos os demais endpoints exigem o cabeçalho `Authorization: Bearer <token>`.*

### Transações (`/api/transacoes`)

| Método | Endpoint | Descrição |
| --- | --- | --- |
| `GET` | `/api/transacoes` | Lista transações com paginação no servidor (`page`, `pageSize`, `contaId`, `data`, `dataInicio`, `dataFim`, `categoriaId`) |
| `GET` | `/api/transacoes/{id}` | Busca transação por ID |
| `POST` | `/api/transacoes` | Cria uma nova transação |
| `PUT` | `/api/transacoes/{id}` | Atualiza uma transação existente |
| `DELETE` | `/api/transacoes/{id}` | Remove uma transação |
| `GET` | `/api/transacoes/resumo-periodo` | Totais de entradas, saídas e balanço consolidado no período |
| `GET` | `/api/transacoes/detalhamento` | Agrupamento por categoria com valores e percentuais para relatórios |
| `GET` | `/api/transacoes/exportar` | Exportação de transações em CSV (`contaId`, `periodo`, `formato=csv`) |

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
  "descricao": "Venda no Balcão",
  "valor": 120.50,
  "tipo": "Entrada",
  "data": "2026-08-26",
  "contaId": 1,
  "contaNome": "Comercial",
  "categoriaId": 3,
  "categoriaNome": "Vendas",
  "categoriaCor": "#1C6CFF"
}
```

### Conta
```json
{
  "id": 1,
  "nome": "Conta Principal",
  "tipo": "Comercial",
  "arquivada": false,
  "saldo": 3450.00
}
```

### Categoria
```json
{
  "id": 1,
  "nome": "Alimentação",
  "cor": "#FF4433",
  "tipo": "Saida"
}
```

---

## ✅ Funcionalidades Implementadas

- [x] **Autenticação Segura:** Registro e login via JWT com BCrypt, rate limiting e Google OAuth 2.0.
- [x] **Isolamento Multiusuário:** Dados de contas, categorias e transações 100% isolados por `UsuarioId`.
- [x] **Gestão de Contas:** Separação entre contas Comerciais e Pessoais, com cálculo de saldo e opção de arquivamento.
- [x] **Categorização Flexível:** Categorias personalizadas com cores e vínculo ao tipo (Entrada / Saída).
- [x] **CRUD Completo de Transações:** Filtros avançados por data, conta, categoria e tipo com paginação no servidor.
- [x] **Relatórios & Analytics:** Gráficos interativos de evolução semanal e detalhamento proporcional de despesas por categoria.
- [x] **Exportação de Dados:** Geração de extrato detalhado em arquivo `.csv`.
- [x] **Design & Experiência Fintech:** Interface responsiva moderna com suporte a tema escuro/claro nativo persistido.
- [x] **Infraestrutura em Produção:** API hospedada no Azure App Service com PostgreSQL no Supabase e frontend na Vercel.
- [x] **Cobertura de Testes:** 43 testes xUnit (backend) e 58 testes Vitest/Testing Library (frontend).

## 🔮 Funcionalidades Planejadas

- [ ] Interface visual dedicada para gerenciar e restaurar contas arquivadas (`incluirArquivadas=true`).
- [ ] Exportação de relatórios e extratos em formato PDF.
- [ ] Lançamentos recorrentes e parcelados com agendamento automático.
- [ ] Notificações inteligentes em background (alertas de saldo baixo e lembretes de lançamentos).
- [ ] Self-hosting das fontes tipográficas via `@fontsource/inter`.
