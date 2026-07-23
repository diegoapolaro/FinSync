# FinSync

Full-stack web app for tracking personal and business finances (income/expenses). Built as a hands-on learning project — see `AGENTS.md` for the learning roadmap.

---

## Tech Stack

| Layer         | Technology                                           |
| ------------- | ---------------------------------------------------- |
| Backend       | C#, ASP.NET Core Web API (.NET 10)                   |
| Database      | SQLite (dev; PostgreSQL planned for production)      |
| ORM           | Entity Framework Core                                |
| API Docs      | OpenAPI + Scalar                                     |
| Frontend      | React 19 + Vite                                      |
| Styling       | Tailwind CSS                                         |
| Routing       | react-router-dom                                     |
| Testing       | Vitest + React Testing Library (client), xUnit (API) |
| Lint / Format | Oxlint + Prettier                                    |

---

## Project Structure

```
FinSync/
├── Program.cs                    Entry point, DI, CORS, migrations, seed
├── FinSync.csproj                Project file
├── appsettings.json              App settings (DB connection, CORS origins)
├── finsync.db                    SQLite database (local, not committed)
├── Models/                       Entity models
│   ├── Usuario.cs                User (Id, Nome, Email, SenhaHash, DataCriacao)
│   ├── Transacao.cs              Transaction (Descricao, Valor, Tipo, Data, ContaId)
│   ├── Conta.cs                  Account (Nome, Tipo, Arquivada)
│   ├── Categoria.cs              Category (Nome, Cor, Tipo)
│   ├── TipoTransacao.cs          Enum: Entrada / Saida
│   └── TipoConta.cs              Enum: Comercial / Pessoal
├── Data/
│   ├── FinSyncDbContext.cs       EF Core DbContext with relationships
│   └── DbSeeder.cs              Seeds default accounts & categories on startup
├── Dtos/                         Request/response DTOs for each entity
├── Services/                     Business logic layer
│   ├── AuthService.cs            Register + Login with BCrypt + JWT
│   ├── TransacaoService.cs
│   ├── ContaService.cs
│   └── CategoriaService.cs
├── Controllers/                  API endpoints
│   ├── AuthController.cs         POST /api/auth/registrar, /api/auth/login (JWT)
│   ├── TransacoesController.cs   CRUD + CSV export
│   ├── ContasController.cs       CRUD + /{id}/resumo (balance summary)
│   └── CategoriasController.cs   CRUD
├── Handlers/
│   └── GlobalExceptionHandler.cs ProblemDetails error handling
├── Helpers/
│   └── DateRangeHelper.cs        Date filtering utilities
├── Migrations/                   EF Core migrations (includes Usuario + Auth)
├── tests/
│   └── FinSync.Tests/            xUnit tests (Services, Helpers)
├── client/                       React frontend
│   ├── package.json
│   ├── vite.config.js            Vite config (proxy to API)
│   └── src/
│       ├── main.jsx              Entry point
│       ├── App.jsx               Root component with routing
│       ├── pages/                Route pages
│       │   ├── Extrato.jsx       Home / statement screen
│       │   ├── RelatoriosPage.jsx Reports & charts
│       │   ├── Login.jsx         Login / register screen
│       │   ├── AjustesPage.jsx   Settings (profile, accounts, categories, etc.)
│       │   └── LancamentosPage.jsx Transaction listing
│       ├── components/
│       │   ├── layout/           Layout components (sidebar, topbar, bottom nav, etc.)
│       │   ├── transactions/     Transaction form, list, cards, action area
│       │   ├── ajustes/          Settings sub-sections (ContasSection, CategoriasSection, etc.)
│       │   ├── common/           Shared UI (ErrorBanner, SummaryCard, FloatingActions, etc.)
│       │   └── reports/          Chart containers
│       ├── hooks/
│       │   └── usePreferencias.js Theme (dark/light) source of truth
│       ├── contexts/             ThemeContext
│       ├── services/
│       │   └── api.js            API client with error parsing
│       ├── utils/                Formatters, helpers
│       └── styles/               CSS variables & animations
└── README.md
```

---

## Running Locally

### Prerequisites

- .NET 10 SDK
- Node.js 24+
- npm 11+

### 1. Start the API

```bash
dotnet run
```

The API runs at `http://localhost:5154`.  
API docs at `http://localhost:5154/scalar/v1`.

On first run, migrations run automatically and default accounts + categories are seeded.

### 2. Start the Frontend

Open a second terminal:

```bash
cd client
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies `/api/*` to the backend.

### Running Tests

```bash
# Backend tests
cd tests/FinSync.Tests
dotnet test

# Frontend tests
cd client
npm test
```

---

## API Endpoints

### Auth

| Method | Endpoint                  | Description             |
| ------ | ------------------------- | ----------------------- |
| POST   | `/api/auth/registrar`      | Register new user       |
| POST   | `/api/auth/login`          | Login, returns JWT token |

All other endpoints require `Authorization: Bearer <token>` header.

### Transações

| Method | Endpoint                    | Description       |
| ------ | --------------------------- | ----------------- |
| GET    | `/api/transacoes`            | List (filterable) |
| GET    | `/api/transacoes/{id}`       | Get by ID         |
| POST   | `/api/transacoes`            | Create            |
| PUT    | `/api/transacoes/{id}`       | Update            |
| DELETE | `/api/transacoes/{id}`       | Delete            |
| GET    | `/api/transacoes/exportar`   | Export as CSV     |

Query params: `?pagina=1&tamanhoPagina=20&dataInicio=...&dataFim=...&tipo=Entrada|Saida&contaId=...&categoriaId=...`

### Contas

| Method | Endpoint                  | Description         |
| ------ | ------------------------- | ------------------- |
| GET    | `/api/contas`              | List all            |
| GET    | `/api/contas/{id}`         | Get by ID           |
| POST   | `/api/contas`              | Create              |
| PUT    | `/api/contas/{id}`         | Update              |
| DELETE | `/api/contas/{id}`         | Delete              |
| GET    | `/api/contas/{id}/resumo`  | Balance summary     |

### Categorias

| Method | Endpoint                | Description  |
| ------ | ----------------------- | ------------ |
| GET    | `/api/categorias`        | List all     |
| GET    | `/api/categorias/{id}`   | Get by ID    |
| POST   | `/api/categorias`        | Create       |
| PUT    | `/api/categorias/{id}`   | Update       |
| DELETE | `/api/categorias/{id}`   | Delete       |

---

## Data Model

### Transacao

```json
{
  "id": 1,
  "descricao": "Venda de pizzas",
  "valor": 89.90,
  "tipo": "Entrada",
  "data": "2026-07-01",
  "contaId": 1,
  "contaNome": "Pizzaria"
}
```

### Conta

```json
{
  "id": 1,
  "nome": "Pizzaria",
  "tipo": "Comercial",
  "arquivada": false,
  "saldo": 2500.00
}
```

### Categoria

```json
{
  "id": 1,
  "nome": "Alimentação",
  "cor": "#E53935",
  "tipo": "Saida"
}
```

---

## Implemented Features

- [x] User registration & login with JWT + BCrypt
- [x] Transaction CRUD with filtering by date, type, account, and category
- [x] Pagination on transaction listing
- [x] Account management (personal / business) with archive support
- [x] Categories with color coding and type binding (income / expense)
- [x] CSV export of transactions
- [x] Monthly reports with weekly breakdown and top expenses chart
- [x] Dark / light theme toggle (persisted in localStorage)
- [x] Responsive layout (mobile bottom nav + desktop sidebar)
- [x] Settings page: profile, accounts, categories, preferences, notifications, export, security
- [x] Server-side pagination
- [x] Backend service tests (xUnit)

## Planned Features

- [ ] Isolate data per user (UsuarioId in Transacoes/Contas/Categorias)
- [ ] PostgreSQL migration for production
- [ ] PDF export
- [ ] Recurring transactions
- [ ] Real notifications (low balance alerts, daily reminders)
- [ ] Frontend tests with Vitest + React Testing Library
