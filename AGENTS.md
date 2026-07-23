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
- **Documentação API:** OpenAPI com Scalar.AspNetCore (visualização)

### Front-End
- **Framework:** React 19 + Vite
- **Estilo:** Tailwind CSS
- **Roteamento:** react-router-dom (adicionado na Fase 3)
- **Lint:** Oxlint (+ Prettier adicionado na Fase 3)
- **Testes:** Vitest + React Testing Library (client), xUnit (backend) — scaffolding inicial da Fase 3

### Ambiente de Desenvolvimento
- **Editor:** Visual Studio Code
- **Extensão:** C# Dev Kit (Microsoft)
- **.NET SDK Version:** 10.0.300
- **Terminal:** Integrado no VS Code
- **Front-end (design/geração):** Google Stitch
- **Back-end/integração (AI assistant no VS Code):** opencode

## 🔬 Auditoria Técnica Completa (realizada em 09/07/2026 via opencode)

### 🔴 TOP 5 prioridades antes de qualquer nova feature
1. **CRÍTICO — Dual source of truth do tema**: `ThemeContext.jsx` e `usePreferencias.js` escrevem 
   ambos na mesma chave `finsync_preferencias` do localStorage, de forma independente. 
   `alternarTema()` sobrescreve o objeto inteiro, **apagando nome/email salvos**. (~30min pra corrigir)
2. **CRÍTICO — Zero autenticação**: não existe Model `Usuario`, JWT, nem hash de senha. 
   Qualquer pessoa com a URL da API acessa/edita/exclui todos os dados. Impossível ir 
   pra produção assim. (~4-6h)
3. **Bug latente — comparação de tipo inconsistente**: `RelatoriosPage.jsx` compara 
   `t.tipo === 'Saida' || t.tipo === 'Saída'` — o backend sempre retorna sem acento, 
   então o `||` é sintoma de um bug que já rondou o sistema. Precisa de constantes 
   centralizadas (`utils/constants.js`). (~30min)
4. **Zero testes de lógica de negócio**: só 2 testes de backend (testam modelo, não 
   comportamento) e 1 teste de frontend frágil (falha se a API não estiver rodando). 
   Nenhum Service (`TransacaoService`, `ContaService`, `CategoriaService`) é testado. (~3-4h)
5. **Sem paginação**: `GET /api/transacoes` retorna tudo de uma vez — funciona hoje, mas 
   não escala. (~1h)

**Total estimado do TOP 5:** ~9-12h

### Outros achados relevantes
- **Segurança**: UI de "Alterar Senha" existe no front mas não tem backend nenhum por trás — é enganosa, deveria ser escondida até JWT existir
- **Arquitetura**: já tem separação Controller→Service→DTO bem feita (SRP respeitado), migrations limpas, `Outlet` pattern no React evitando prop drilling — base é sólida
- **Performance**: índices no banco corretos, eager loading sem N+1, mas Google Fonts carregada externamente (self-host recomendado)
- **Front-end**: `AjustesPage.jsx` ainda grande (~500 linhas), precisa quebrar em `ContasSection.jsx`/`CategoriasSection.jsx`
- **Sem TypeScript**: PropTypes/TS evitariam a classe de bug do item 3 acima

### Honorable mentions (depois do TOP 5)
- Remover UI falsa de alterar senha (10min)
- Filtro por `categoriaId` no endpoint de transações (15min)
- PropTypes nos componentes compartilhados (30min)
- `.env.example` no front-end (5min)
- ✅ RESOLVIDO: navegação duplicada, sobreposição no cabeçalho, saldo flutuando fora da barra
- ✅ RESOLVIDO: bug de "Invalid Date" no card de transações
- ✅ RESOLVIDO: seletor Entrada/Saída travado em "Entrada" (ActionArea agora tem botões separados)
- ✅ RESOLVIDO: senha sendo salva em texto puro no localStorage (removido do AlterarSenhaModal)

### 🎨 Identidade Visual
- ✅ Logo criada em 2 versões: "Carimbo Verde" (#2F6B4F) e "Carimbo Preto" (#1F2421), 
  monograma "FS" estilo carimbo de borracha
- ✅ Tela de Extrato funcional (layout limpo, dados reais, resumo de entradas/saídas)
- ✅ Tela de Ajustes completa e funcional (Perfil, Contas, Categorias, Preferências, 
  Notificações, Exportar Dados CSV, Segurança)
- ✅ Tela de Relatórios criada (resumo mensal, gráfico por semana, maiores saídas)

### 🏗️ Fase 3 — Modernização da estrutura do Front-end (aplicada em 08/07/2026)
- ✅ Roteamento real com react-router-dom, substituindo o state manual `pagina` — 
  Extrato/Relatórios/Ajustes viraram páginas roteadas em `client/src/pages/`
- ✅ `App.jsx` desmontado: subcomponentes (MobileTopBar, DesktopHeader, DesktopSidebar, 
  TransactionForm, TransactionList, BottomNav) extraídos para `client/src/components/layout/`
- ✅ `Ajustes.jsx` (que estava grande) também dividido em arquivos menores
- ✅ Base URL da API configurável via `import.meta.env` — front-end não depende mais só 
  do proxy do Vite em dev, pronto pra build de produção
- ✅ `services/api.js` melhorado: parsing de erros estruturados (ProblemDetails) e 
  exibição de mensagens de erro centralizada
- ✅ Lógica de tema claro/escuro consolidada (antes duplicada entre `App.jsx` e 
  `hooks/usePreferencias.js`) — agora fonte única de verdade
- ✅ Prettier configurado ao lado do Oxlint; dependências `@types/react*` não usadas removidas
- ✅ Scaffolding de testes: Vitest + React Testing Library no client, projeto xUnit no backend

---

## 📁 Estrutura do Projeto (atualizada em 09/07/2026)

```
FinSync/
├── Program.cs                    → Configuração, CORS, seed inicial de Contas/Categorias
├── FinSync.csproj
├── appsettings.json               → Connection string SQLite (finsync.db)
├── finsync.db                     → Banco SQLite local (não deve ir pro git)
├── Migrations/                    → Migrations do EF Core
├── Models/
│   ├── Transacao.cs               → ContaId, navegação para Conta
│   ├── Conta.cs                   → Nome, Tipo, Arquivada, navegação para Transacoes
│   ├── Categoria.cs                → Nome, Cor, Tipo
│   ├── TipoTransacao.cs           → enum (Entrada, Saida)
│   └── TipoConta.cs               → enum (Comercial, Pessoal)
├── Data/
│   └── FinSyncDbContext.cs        → DbSets + relacionamento Transacao→Conta (Restrict on delete)
├── Controllers/
│   ├── TransacoesController.cs    → CRUD + endpoint /exportar (CSV)
│   ├── ContasController.cs        → CRUD + endpoint /{id}/resumo
│   └── CategoriasController.cs    → CRUD
└── client/                        → Front-end React (Vite + Tailwind)
    ├── src/
    │   ├── pages/                 → Extrato, Relatórios, Ajustes (rotas via react-router-dom)
    │   ├── components/
    │   │   └── layout/            → MobileTopBar, DesktopHeader, DesktopSidebar, 
    │   │                             TransactionForm, TransactionList, BottomNav
    │   ├── hooks/
    │   │   └── usePreferencias.js → fonte única de verdade do tema claro/escuro
    │   └── services/
    │       └── api.js             → base URL via import.meta.env, parsing de erros
    └── package.json
```

**Nota:** back-end ainda não tem entidade `Usuario`/autenticação — é single-user por enquanto.

---

## 🗂️ Modelos de Dados

### Implementados
1. **Transacao** ✅
   - Id, Descricao, Valor, Tipo (enum Entrada/Saida), Data (DateOnly), ContaId, Conta (navegação)
2. **Conta** ✅
   - Id, Nome, Tipo (enum Comercial/Pessoal), Arquivada, Transacoes (navegação)
3. **Categoria** ✅
   - Id, Nome, Cor (hex), Tipo (enum Entrada/Saida)

### Planejados
4. **Usuario** (ainda não iniciado)
   - Id, Nome, Email, Senha (hash), DataCriacao
   - Necessário para autenticação real (JWT) e sistema multiusuário

---

## 🎓 Caminho de Aprendizado Definido

**Ordem de Estudo & Construção:**
1. ✅ Lógica em C# (em progresso)
2. → **OOP em C# (aplicando no projeto)**
3. → Banco de dados (Entity Framework, migrations)
4. → Autenticação & segurança
5. → React (consumindo a API)
6. → Deployment

**Metodologia:** Aprender na prática enquanto constrói o projeto (não apenas teoria)

---

## ✅ Status Atual (Atualizado em 23/07/2026)

- ✅ Back-end: 3 controllers completos (Transacoes, Contas, Categorias), EF Core + SQLite, 
  seed automático, endpoint de resumo e de exportação CSV
- ✅ Front-end: Extrato, Relatórios e Ajustes funcionais, com identidade visual própria 
  (estilo recibo/carimbo) e logo definida
- ✅ Estrutura do front-end modernizada: roteamento real, componentes desmontados em 
  arquivos próprios, tema consolidado, scaffolding de testes

**Fase atual:** Produto funcional de ponta a ponta para uso pessoal/comercial básico. 
Próximo grande passo é autenticação (hoje é single-user, sem login).

## 🚀 Próximos Passos (Ordem sugerida)

1. **Criar Model + Controller de Usuario + Autenticação (JWT)** — hoje qualquer pessoa 
   com acesso à API vê todas as contas, sem isolamento por usuário
2. **Migrar de SQLite para PostgreSQL** (ou manter SQLite se for uso pessoal/local só)
3. **Rodar os testes scaffoldados na Fase 3** e expandir cobertura aos poucos
4. **Revisar CORS e variáveis de ambiente** antes de qualquer deploy real
5. **Considerar exportação em PDF** (hoje só CSV) na tela de Ajustes
6. **Notificações reais** (lembrete diário, alerta de saldo baixo) — hoje são só toggles 
   salvos sem lógica de disparo por trás

---

## 💾 URLs Importantes

- **Documentação API Local:** http://localhost:5154/scalar/v1 (quando rodando `dotnet run`)
- **OpenAPI JSON:** http://localhost:5154/openapi/v1.json

---

## 📝 Notas Importantes

- **Princípio Guia:** Vibecoding com fundamento — aprender fazendo, mas com estrutura correta desde o início
- **Padrões de Código:** Organizar em pastas/namespaces desde o início (Models, Controllers, Data)
- **Conceitos OOP Aplicados:** Encapsulamento, herança, polimorfismo, enums para tipos seguros
- **Mentoria:** Guia passo a passo, explicando conceitos conforme aparecem no código

---

## ✨ Diferencial do Projeto

Diferente de tutoriais genéricos, esse projeto é:
- **Real:** Pode ser usado de verdade na pizzaria
- **Extensível:** Funciona pra negócios e finanças pessoais
- **Educativo:** Aprende praticando, não memorizando
- **Full-stack:** Toca C#, banco, React, autenticação, deployment

---

*Última atualização: 09 de Julho de 2026*  
*Status: Produto funcional ponta a ponta (Extrato, Relatórios, Ajustes) — estrutura de front-end modernizada, autenticação ainda pendente. Auditoria técnica completa realizada — TOP 5 prioridades documentadas.*