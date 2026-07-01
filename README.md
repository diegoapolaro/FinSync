# FinSync

A full-stack web app for tracking personal and business finances (income/expenses).

---

## Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Backend   | C#, ASP.NET Core Web API (.NET 10)  |
| Database  | SQLite (dev), PostgreSQL (planned)  |
| API Docs  | OpenAPI + Scalar                    |
| Frontend  | React 19 + Vite                     |

---

## Project Structure

```
FinSync/
├── Program.cs                    Entry point & configuration
├── FinSync.csproj                Project file
├── appsettings.json              App settings (DB connection, etc.)
├── Models/
│   ├── Transacao.cs              Transaction model
│   └── TipoTransacao.cs          Enum: Entrada / Saida
├── Controllers/
│   └── TransacoesController.cs   CRUD endpoints
├── Data/
│   └── FinSyncDbContext.cs       EF Core database context
├── Migrations/                   EF Core migrations
├── Properties/
│   └── launchSettings.json       Local dev settings
├── client/                       React frontend
│   ├── src/
│   │   ├── App.jsx               Main app (form + transaction list)
│   │   ├── services/api.js       API client
│   │   ├── App.css               Component styles
│   │   └── index.css             Global styles
│   └── vite.config.js            Vite config (proxy to API)
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
API docs available at `http://localhost:5154/scalar/v1`.

### 2. Start the Frontend

Open a second terminal:

```bash
cd client
cmd /c npm run dev        # if PowerShell blocks scripts
```

Or if you already fixed the execution policy:

```bash
cd client
npm run dev
```

The frontend runs at `http://localhost:5173` and proxies `/api/*` requests to the backend.

---

## API Endpoints

| Method | Endpoint                 | Description        |
| ------ | ------------------------ | ------------------ |
| GET    | `/api/transacoes`         | List all           |
| GET    | `/api/transacoes/{id}`    | Get by ID          |
| POST   | `/api/transacoes`         | Create             |
| PUT    | `/api/transacoes/{id}`    | Update             |
| DELETE | `/api/transacoes/{id}`    | Delete             |

---

## Data Model

```json
{
  "id": 1,
  "descricao": "Venda de pizzas",
  "valor": 89.90,
  "tipo": "Entrada",
  "data": "2026-07-01T00:00:00"
}
```

- `tipo`: `"Entrada"` (income) or `"Saida"` (expense)

---

## Planned Features

- Account management (personal / business)
- Categories for transactions
- User authentication (JWT)
- Reports & charts
- Monthly/yearly comparisons

---

## Learning Context

Built as a hands-on project to learn C#, OOP, ASP.NET Core, and React by building something real that can actually be used in a pizzeria. See `AGENTS.md` for the learning roadmap.
