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
- **Banco de Dados:** PostgreSQL (ou SQL Server)
- **Documentação API:** OpenAPI com Scalar.AspNetCore (visualização)

### Front-End
- **Framework:** React
- **Linguagem:** JavaScript/TypeScript

### Ambiente de Desenvolvimento
- **Editor:** Visual Studio Code
- **Extensão:** C# Dev Kit (Microsoft)
- **.NET SDK Version:** 10.0.300
- **Terminal:** Integrado no VS Code
- **Front-end (design/geração):** Google Stitch
- **Back-end/integração (AI assistant no VS Code):** opencode

### ⚠️ Bugs conhecidos no Front-end (identificados em 01/07/2026)
- Navegação duplicada (abas no topo + barra inferior fazendo a mesma função)
- Elemento "SAIDA" (seletor Entrada/Saída) sobrepondo o cabeçalho — deveria estar 
  isolado dentro do formulário de Novo Lançamento
- Saldo total flutuando fora da barra de navegação inferior, desalinhado
- Bug de "Invalid Date" no card de transações recentes — problema de código 
  (formatação de data em JS/React), não de design

---

## 📁 Estrutura do Projeto (em desenvolvimento)

```
FinSync/
├── Program.cs                    → Ponto de entrada, configuração
├── FinSync.csproj               → Arquivo de configuração do projeto
├── appsettings.json             → Configurações (strings de conexão, etc)
├── Properties/
│   └── launchSettings.json      → Configurações de execução local
├── Models/
│   └── Transacao.cs             → Classe Transacao com enum TipoTransacao
├── Controllers/                 → Endpoints da API (em construção)
└── Data/                        → Configuração do banco (planejado)
```

---

## 🗂️ Modelos de Dados Planejados

### Classes Essenciais (planejadas)
1. **Transacao** ✅ (criada)
   - Id (int)
   - Descricao (string)
   - Valor (decimal)
   - Tipo (enum: Entrada/Saida)
   - Data (DateTime)

2. **Conta** (planejada)
   - Id (int)
   - Nome (string)
   - Saldo (decimal)
   - TipoConta (enum: Pessoal/Comercial)
   - UsuarioId (int)

3. **Categoria** (planejada)
   - Id (int)
   - Nome (string)
   - Tipo (enum: Entrada/Saida)

4. **Usuario** (planejada)
   - Id (int)
   - Nome (string)
   - Email (string)
   - Senha (hash)
   - DataCriacao (DateTime)

5. **Relatorio** (planejada)
   - Saldo total
   - Gráficos por categoria
   - Comparação período a período
   - Filtros customizáveis

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

## ✅ Status Atual (Atualizado)

- ✅ Model `Transacao.cs` criado (com enum `TipoTransacao`)
- ✅ Controller de Transacao criado e funcionando (CRUD básico testável via Scalar)
- ✅ `Program.cs` configurado corretamente
- ✅ Conexão Front-End (React) ↔ Back-End (API) **funcionando** — front-end já iniciado, ainda muito básico
- ✅ Back-end rodando e respondendo requisições

**Fase atual:** Site funcional mas extremamente básico — hora de expandir funcionalidades.

## 🚀 Próximos Passos (Ordem sugerida)

- ✅ Entity Framework Core + DbContext (`FinSyncDbContext`) já configurado e funcionando
- ✅ `TransacoesController` com CRUD completo usando EF Core (async/await, `SaveChangesAsync`)

1. **🔵 EM ANDAMENTO: Criar Model + Controller de Conta** (separar "Pizzaria" de "Pessoal") + relacionamento 1-N com Transacao
2. **Criar Model + Controller de Categoria** (organizar transações por tipo de gasto/receita)
3. **Endpoint de resumo/dashboard** (total de entradas, saídas, saldo por Conta)
4. **Criar Model + Controller de Usuario + Autenticação (JWT)**
5. **Melhorar visual do Front-End em React** (cards, cores por tipo, seletor de conta)
6. **Filtros e relatórios** (por data, categoria, conta)

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

*Última atualização: 01 de Julho de 2026*  
*Status: MVP básico funcionando (front + back conectados) - Expandindo funcionalidades*