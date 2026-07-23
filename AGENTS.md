# Projeto FinSync - Documentação do Projeto & Perfil do Desenvolvedor

## 📋 Informações do Desenvolvedor

**Nome:** [Não informado]  
**Localização:** São Paulo, SP, Brasil  
**Nível de Experiência:** Iniciante (reaprendendo C#, começando com OOP e React)  
**Estilo de Aprendizado:** "Vibecoding" - aprender praticando em projetos reais  
**Contexto Profissional:** Cuidando de uma pizzaria (caso de uso inicial)

---

## 🎯 Projeto FinSync

### Visão Geral
**Propósito Principal:**  
Sistema web para controle de entradas e saídas financeiras com dois contextos de uso:
1. **Gestão comercial** (ex: pizzaria) - rastreamento de receitas/despesas do negócio
2. **Gestão financeira pessoal** - controle de gastos e receitas pessoais

**Público Alvo:** Pequenas empresas + usuários que querem organizar finanças pessoais

---

## 🛠️ Stack Tecnológico

### Back-End
- **Linguagem:** C# 
- **Framework:** ASP.NET Core Web API (.NET 10)
- **Banco de Dados:** SQLite (`finsync.db`, local — migração pra PostgreSQL/SQL Server ainda planejada para produção)
- **ORM:** Entity Framework Core (migrations + seed automático de Contas/Categorias no startup)
- **Autenticação:** JWT (Bearer token) + BCrypt (hash de senha)
- **Documentação API:** OpenAPI com Scalar.AspNetCore (visualização)

### Front-End
- **Framework:** React 19 + Vite
- **Estilo:** Tailwind CSS
- **Roteamento:** react-router-dom
- **Lint:** Oxlint + Prettier
- **Testes:** Vitest + React Testing Library (client), xUnit (backend)

### Ambiente de Desenvolvimento
- **Editor:** Visual Studio Code
- **Extensão:** C# Dev Kit (Microsoft)
- **.NET SDK Version:** 10.0.300
- **Terminal:** Integrado no VS Code
- **Front-end (design/geração):** Google Stitch
- **Back-end/integração (AI assistant no VS Code):** opencode

## 🔬 Auditoria Técnica Completa (realizada em 09/07/2026 via opencode)

### 🔴 TOP 5 prioridades
1. **CRÍTICO — Dual source of truth do tema**: `ThemeContext.jsx` e `usePreferencias.js` escrevem ambos na mesma chave `finsync_preferencias` do localStorage, de forma independente. `alternarTema()` sobrescreve o objeto inteiro, **apagando nome/email salvos**. (~30min)
2. **CRÍTICO — Zero autenticação**: não existia Model `Usuario`, JWT, nem hash de senha. ✅ **RESOLVIDO** — AuthController, JWT e BCrypt implementados. Pendente: isolar dados por usuário. (~4-6h)
3. **Bug latente — comparação de tipo inconsistente**: `RelatoriosPage.jsx` compara `t.tipo === 'Saida' || t.tipo === 'Saída'` — o backend sempre retorna sem acento. Precisa de constantes centralizadas (`utils/constants.js`). (~30min)
4. **Zero testes de lógica de negócio**: só 2 testes de backend (testam modelo, não comportamento) e 1 teste de frontend frágil. ✅ **PARCIAL** — testes de serviço adicionados (TransacaoService, ContaService, CategoriaService). Pendente: testes de AuthService e frontend. (~3-4h)
5. **Sem paginação**: `GET /api/transacoes` retorna tudo de uma vez. ✅ **RESOLVIDO** — paginação server-side implementada.

### Outros achados relevantes
- **Segurança**: UI de "Alterar Senha" existe no front mas não tem backend por trás — deve ser escondida ou integrada ao Auth
- **Arquitetura**: separação Controller→Service→DTO bem feita (SRP respeitado), migrations limpas, `Outlet` pattern no React — base sólida
- **Performance**: índices no banco corretos, eager loading sem N+1, Google Fonts carregada externamente (self-host recomendado)
- **Front-end**: `AjustesPage.jsx` ainda grande (~500 linhas), precisa quebrar em `ContasSection.jsx`/`CategoriasSection.jsx`
- **Sem TypeScript**: PropTypes/TS evitariam bugs de comparação de string

### Honorable mentions
- Remover UI falsa de alterar senha (10min)
- Filtro por `categoriaId` no endpoint de transações (15min)
- PropTypes nos componentes compartilhados (30min)
- `.env.example` no front-end (5min)
- ✅ RESOLVIDO: navegação duplicada, sobreposição no cabeçalho, saldo flutuando fora da barra
- ✅ RESOLVIDO: bug de "Invalid Date" no card de transações
- ✅ RESOLVIDO: seletor Entrada/Saída travado em "Entrada"
- ✅ RESOLVIDO: senha sendo salva em texto puro no localStorage

### 🎨 Identidade Visual
- ✅ Logo criada em 2 versões: "Carimbo Verde" (#2F6B4F) e "Carimbo Preto" (#1F2421), monograma "FS" estilo carimbo de borracha
- ✅ Tela de Extrato funcional (layout limpo, dados reais, resumo de entradas/saídas)
- ✅ Tela de Ajustes completa e funcional (Perfil, Contas, Categorias, Preferências, Notificações, Exportar Dados CSV, Segurança)
- ✅ Tela de Relatórios criada (resumo mensal, gráfico por semana, maiores saídas)

### 🏗️ Fase 3 — Modernização do Front-end
- ✅ Roteamento real com react-router-dom — Extrato/Relatórios/Ajustes como páginas roteadas
- ✅ `App.jsx` desmontado em subcomponentes (MobileTopBar, DesktopHeader, DesktopSidebar, TransactionForm, TransactionList, BottomNav)
- ✅ `Ajustes.jsx` dividido em arquivos menores
- ✅ Base URL da API configurável via `import.meta.env`
- ✅ `services/api.js` com parsing de erros estruturados (ProblemDetails)
- ✅ Lógica de tema claro/escuro consolidada em `usePreferencias.js`
- ✅ Prettier configurado, dependências não usadas removidas
- ✅ Scaffolding de testes: Vitest + React Testing Library, projeto xUnit

---

## 📁 Estrutura do Projeto (atualizada em 23/07/2026)

```
FinSync/
├── Program.cs                    → Configuração, CORS, seed inicial, JWT
├── FinSync.csproj
├── appsettings.json              → Connection string SQLite + JWT config
├── finsync.db                    → Banco SQLite local
├── Models/
│   ├── Usuario.cs                → Id, Nome, Email, SenhaHash, DataCriacao
│   ├── Transacao.cs              → Id, Descricao, Valor, Tipo, Data, ContaId
│   ├── Conta.cs                  → Id, Nome, Tipo, Arquivada, Transacoes
│   ├── Categoria.cs              → Id, Nome, Cor, Tipo
│   ├── TipoTransacao.cs          → enum (Entrada, Saida)
│   └── TipoConta.cs              → enum (Comercial, Pessoal)
├── Data/
│   ├── FinSyncDbContext.cs       → DbSets + relacionamentos
│   └── DbSeeder.cs               → Seed automático de Contas/Categorias
├── Dtos/
│   ├── AuthDtos.cs               → RegistrarRequest, LoginRequest, AuthResponse
│   ├── TransacaoDtos.cs
│   ├── ContaDtos.cs
│   └── CategoriaDtos.cs
├── Services/
│   ├── AuthService.cs            → Registrar + Login com BCrypt + JWT
│   ├── TransacaoService.cs
│   ├── ContaService.cs
│   └── CategoriaService.cs
├── Controllers/
│   ├── AuthController.cs         → POST /api/auth/registrar, /api/auth/login
│   ├── TransacoesController.cs   → CRUD + GET /exportar (CSV)
│   ├── ContasController.cs       → CRUD + GET /{id}/resumo
│   └── CategoriasController.cs   → CRUD
├── Handlers/
│   └── GlobalExceptionHandler.cs → Tratamento global de erros
├── Helpers/
│   └── DateRangeHelper.cs
├── Migrations/                   → Migrations do EF Core
├── tests/
│   └── FinSync.Tests/            → xUnit (Helpers, Services)
└── client/                       → Front-end React (Vite + Tailwind)
    ├── src/
    │   ├── pages/                → Extrato, Relatórios, Ajustes, Login
    │   ├── components/
    │   │   ├── layout/           → MobileTopBar, DesktopHeader, DesktopSidebar, BottomNav
    │   │   ├── transactions/     → TransactionForm, TransactionList
    │   │   ├── reports/          → Componentes de relatórios
    │   │   ├── settings/         → Seções de configurações
    │   │   ├── ajustes/          → Subcomponentes de Ajustes
    │   │   └── common/           → Componentes compartilhados
    │   ├── contexts/
    │   │   └── ThemeContext.jsx   → Contexto de tema (sincronizado com usePreferencias)
    │   ├── hooks/
    │   │   └── usePreferencias.js → Fonte única de verdade do tema
    │   ├── services/
    │   │   └── api.js            → Base URL via import.meta.env, parsing de erros, token JWT
    │   ├── utils/
    │   │   └── constants.js      → Constantes centralizadas
    │   ├── styles/               → Estilos globais
    │   └── test/                 → Testes Vitest + React Testing Library
    └── package.json
```

**Autenticação:** JWT implementado (registro + login). Pendente: relacionar Transacoes/Contas/Categorias ao usuário logado.

---

## 🗂️ Modelos de Dados

### Implementados
1. **Usuario** ✅
   - Id, Nome, Email, SenhaHash, DataCriacao
2. **Transacao** ✅
   - Id, Descricao, Valor, Tipo (enum Entrada/Saida), Data (DateOnly), ContaId, Conta (navegação)
3. **Conta** ✅
   - Id, Nome, Tipo (enum Comercial/Pessoal), Arquivada, Transacoes (navegação)
4. **Categoria** ✅
   - Id, Nome, Cor (hex), Tipo (enum Entrada/Saida)

### Planejados
- Relacionar entidades ao usuário logado (adicionar UsuarioId em Transacao, Conta, Categoria)

---

## 🎓 Caminho de Aprendizado Definido

**Ordem de Estudo & Construção:**
1. ✅ Lógica em C#
2. ✅ **OOP em C# (aplicando no projeto)**
3. ✅ Banco de dados (Entity Framework, migrations)
4. ✅ Autenticação & segurança (JWT + BCrypt)
5. → React (consumindo a API)
6. → Deployment

**Metodologia:** Aprender na prática enquanto constrói o projeto (não apenas teoria)

---

## ✅ Status Atual (Atualizado em 23/07/2026)

- ✅ Back-end: 4 controllers (Auth, Transacoes, Contas, Categorias), EF Core + SQLite, seed automático, JWT + BCrypt, paginação, testes de serviço
- ✅ Front-end: Extrato, Relatórios, Ajustes e Login funcionais, com identidade visual própria (estilo recibo/carimbo)
- ✅ Estrutura modernizada: roteamento real, componentes desmontados, tema consolidado, constantes centralizadas

**Fase atual:** Produto funcional com autenticação JWT implementada. Pendente isolar dados por usuário.

## 🚀 Próximos Passos (Ordem sugerida)

1. ✅ ~~Criar Model + Controller de Usuario + Autenticação (JWT)~~ **Concluído**
2. **Isolar dados por usuário** — adicionar UsuarioId em Transacoes/Contas/Categorias e filtrar por usuário logado
3. **Migrar de SQLite para PostgreSQL** (ou manter SQLite se for uso pessoal/local só)
4. **Expandir cobertura de testes** — AuthService, testes de frontend
5. **Revisar CORS e variáveis de ambiente** antes de qualquer deploy real
6. **Considerar exportação em PDF** (hoje só CSV) na tela de Ajustes
7. **Notificações reais** (lembrete diário, alerta de saldo baixo) — hoje são só toggles salvos sem lógica de disparo

---

## 💾 URLs Importantes

- **Documentação API Local:** http://localhost:5154/scalar/v1 (quando rodando `dotnet run`)
- **OpenAPI JSON:** http://localhost:5154/openapi/v1.json

---

## 📝 Notas Importantes

- **Princípio Guia:** Vibecoding com fundamento — aprender fazendo, mas com estrutura correta desde o início
- **Padrões de Código:** Organizar em pastas/namespaces desde o início (Models, Controllers, Data, Services, Dtos)
- **Conceitos OOP Aplicados:** Encapsulamento, herança, polimorfismo, enums para tipos seguros, injeção de dependência
- **Mentoria:** Guia passo a passo, explicando conceitos conforme aparecem no código

---

## ✨ Diferencial do Projeto

Diferente de tutoriais genéricos, esse projeto é:
- **Real:** Pode ser usado de verdade na pizzaria
- **Extensível:** Funciona pra negócios e finanças pessoais
- **Educativo:** Aprende praticando, não memorizando
- **Full-stack:** Toca C#, banco, React, autenticação, deployment

---

*Última atualização: 23 de Julho de 2026*  
*Status: Produto funcional com autenticação JWT, 4 controllers, paginação e testes de serviço. Auditoria técnica completa realizada.*