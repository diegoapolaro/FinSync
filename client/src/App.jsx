import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  createTransacao,
  deleteTransacao,
  getCategorias,
  getContas,
  getResumoConta,
  getTransacoes,
} from './services/api';
import Ajustes from './components/Ajustes';

const resumoInicial = {
  totalEntradas: 0,
  totalSaidas: 0,
  saldo: 0,
  totalEntradasHoje: 0,
  totalSaidasHoje: 0,
  saldoDiario: 0,
  totalEntradasMes: 0,
  totalSaidasMes: 0,
  saldoMensal: 0,
  quantidadeTransacoes: 0,
};

const formInicial = {
  descricao: '',
  valor: '',
  tipo: 'Entrada',
  data: new Date().toISOString().slice(0, 10),
};

function App() {
  const [contas, setContas] = useState([]);
  const [contaSelecionadaId, setContaSelecionadaId] = useState('');
  const [transacoes, setTransacoes] = useState([]);
  const [resumo, setResumo] = useState(resumoInicial);
  const [form, setForm] = useState(formInicial);
  const [formAberto, setFormAberto] = useState(false);
  const [categorias, setCategorias] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [pagina, setPagina] = useState('extrato');

  useEffect(() => {
    async function carregarContas() {
      setCarregando(true);
      const contasDaApi = await getContas();
      setContas(contasDaApi);

      if (contasDaApi.length > 0) {
        setContaSelecionadaId(String(contasDaApi[0].id));
      }

      setCarregando(false);
    }

    carregarContas().catch((error) => {
      setErro(error.message);
      setCarregando(false);
    });

    getCategorias()
      .then(setCategorias)
      .catch(() => {});
  }, []);

  const carregarDadosDaConta = useCallback(async () => {
    const [transacoesDaApi, resumoDaApi] = await Promise.all([
      getTransacoes(contaSelecionadaId),
      getResumoConta(contaSelecionadaId),
    ]);

    setTransacoes(transacoesDaApi);
    setResumo({ ...resumoInicial, ...resumoDaApi });
  }, [contaSelecionadaId]);

  useEffect(() => {
    if (!contaSelecionadaId) {
      setTransacoes([]);
      setResumo(resumoInicial);
      return;
    }

    carregarDadosDaConta().catch((error) => setErro(error.message));
  }, [contaSelecionadaId, carregarDadosDaConta]);

  async function handleSubmit(event) {
    event.preventDefault();
    setErro('');

    if (!contaSelecionadaId) {
      return;
    }

    const transacao = {
      descricao: form.descricao.trim(),
      valor: Number(form.valor),
      tipo: form.tipo,
      data: form.data || new Date().toISOString().slice(0, 10),
      contaId: Number(contaSelecionadaId),
    };

    await createTransacao(transacao);
    await carregarDadosDaConta();
    setForm({ descricao: '', valor: '', data: new Date().toISOString().slice(0, 10), tipo: form.tipo });
  }

  async function handleDelete(id) {
    setErro('');
    await deleteTransacao(id);
    await carregarDadosDaConta();
  }

  function abrirLancamento(tipo) {
    setForm((formAtual) => ({ ...formAtual, tipo }));
    setFormAberto(true);
  }

  const transacoesDeHoje = useMemo(() => {
    const hoje = new Date().toDateString();
    return transacoes.filter(
      (transacao) =>
        new Date(`${transacao.data}T12:00:00`).toDateString() === hoje
    );
  }, [transacoes]);

  const transacoesVisiveis =
    transacoesDeHoje.length > 0 ? transacoesDeHoje : transacoes;
  const tituloLista = transacoesDeHoje.length > 0 ? 'HOJE' : 'RECENTES';

  const temTransacoes = transacoes.length > 0;

  return (
    <div className="bg-surface-container-high text-on-surface antialiased min-h-screen flex flex-col items-center">
      <MobileTopBar />

      <DesktopSidebar
        contas={contas}
        contaSelecionadaId={contaSelecionadaId}
        onSelectConta={setContaSelecionadaId}
        pagina={pagina}
        setPagina={setPagina}
      />

      <main className="w-full max-w-receipt-width bg-background min-h-screen md:min-h-[819px] shadow-lg md:my-8 flex flex-col relative pb-24 md:pb-8 md:ml-64">
        <div className="w-full h-4 receipt-edge-top bg-surface-container-high absolute top-0 left-0 -translate-y-full hidden md:block" />

        <DesktopHeader pagina={pagina} setPagina={setPagina} />

        {pagina === 'ajustes' ? (
          <Ajustes
            contas={contas}
            onContasChange={setContas}
            categorias={categorias}
            onCategoriasChange={setCategorias}
          />
        ) : (
          <>
            {formAberto && (
              <TransactionForm
                form={form}
                setForm={setForm}
                handleSubmit={handleSubmit}
                setFormAberto={setFormAberto}
              />
            )}

            {carregando && (
              <p className="font-body-lg text-body-lg text-on-surface-variant text-center py-12">
                Carregando lançamentos...
              </p>
            )}

            {erro && (
              <p className="bg-error-container text-on-error-container font-body-sm text-body-sm text-center py-3 px-gutter border-b border-dashed border-error">
                {erro}
              </p>
            )}

            {!carregando && contas.length === 0 && (
              <EmptyState message="Nenhuma conta cadastrada. Crie uma conta pela API para começar." />
            )}

            {!carregando && contas.length > 0 && !temTransacoes && (
              <EmptyStateComAcoes
                resumo={resumo}
                abrirLancamento={abrirLancamento}
              />
            )}

            {!carregando && temTransacoes && (
              <>
                <SummarySection resumo={resumo} />

                <TransactionList
                  titulo={tituloLista}
                  transacoes={transacoesVisiveis}
                  handleDelete={handleDelete}
                />

                <ActionArea abrirLancamento={abrirLancamento} />
              </>
            )}
          </>
        )}
      </main>

      <BottomNav
        abrirLancamento={abrirLancamento}
        resumo={resumo}
        temTransacoes={temTransacoes}
        pagina={pagina}
        setPagina={setPagina}
      />

      {pagina === 'extrato' && temTransacoes && <MobileBalanceBar resumo={resumo} />}
    </div>
  );
}

function MobileTopBar() {
  return (
    <header className="md:hidden bg-background flex flex-col items-center w-full max-w-receipt-width mx-auto pt-margin-page pb-stack-base px-gutter sticky top-0 z-40 border-b border-dashed border-outline-variant">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-headline-lg font-headline-lg uppercase tracking-tighter text-primary">
          FINSYNC
        </h1>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary cursor-pointer">
            ios_share
          </span>
        </div>
      </div>
    </header>
  );
}

function DesktopHeader({ pagina, setPagina }) {
  const hoje = new Date();
  const mes = hoje
    .toLocaleDateString('pt-BR', { month: 'short' })
    .toUpperCase();
  const dataRange = `${hoje.getDate()} ${mes} ${hoje.getFullYear()}`;

  const tabs = [
    { id: 'extrato', label: 'EXTRATO' },
    { id: 'relatorios', label: 'RELATÓRIOS' },
    { id: 'ajustes', label: 'AJUSTES' },
  ];

  return (
    <>
      <div className="hidden md:flex justify-between items-center px-gutter pt-margin-page pb-stack-base border-b border-dashed border-line">
        <h1 className="text-headline-lg font-headline-lg uppercase tracking-tighter text-primary">
          FINSYNC
        </h1>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary cursor-pointer">
            account_balance_wallet
          </span>
          <span className="material-symbols-outlined text-primary cursor-pointer">
            receipt_long
          </span>
        </div>
      </div>
      <nav className="hidden md:flex w-full justify-between items-end px-gutter pt-margin-page pb-stack-base border-b border-dashed border-line">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setPagina(tab.id)}
              className={
                pagina === tab.id
                  ? 'font-label-caps text-label-caps text-primary font-bold underline decoration-2 hover:bg-surface-variant transition-colors duration-75 p-2 rounded'
                  : 'font-label-caps text-label-caps text-secondary hover:bg-surface-variant transition-colors duration-75 p-2 rounded'
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        {pagina === 'extrato' && (
          <p className="font-label-caps text-label-caps text-secondary mb-2">
            {dataRange}
          </p>
        )}
      </nav>
    </>
  );
}

function DesktopSidebar({ contas, contaSelecionadaId, onSelectConta, pagina, setPagina }) {
  return (
    <nav className="hidden md:flex flex-col gap-stack-base p-gutter bg-surface fixed left-0 top-0 h-full w-64 border-r-2 border-primary z-50">
      <div className="mb-8">
        <h1 className="font-headline-md text-headline-md text-primary tracking-tighter uppercase mb-2">
          FINSYNC
        </h1>
        <p className="font-label-caps text-label-caps text-outline">CONTAS</p>
        <p className="font-label-caps text-label-caps text-outline opacity-70">
          SELECIONE O LIVRO
        </p>
      </div>

      {contas.length === 0 && (
        <p className="font-label-caps text-label-caps text-outline">
          Sem contas cadastradas
        </p>
      )}

      <div className="flex flex-col gap-stack-base">
        {contas.map((conta) => {
          const selecionada = String(conta.id) === contaSelecionadaId;
          return (
            <button
              key={conta.id}
              type="button"
              onClick={() => {
                onSelectConta(String(conta.id));
                setPagina('extrato');
              }}
              className={
                selecionada
                  ? 'flex items-center gap-2 -rotate-3 border-2 border-stamp-accent text-stamp-accent bg-tertiary-fixed-dim/20 p-4 font-bold scale-105 transition-transform duration-200 ease-in-out stamp-bg'
                  : 'flex items-center gap-2 p-4 text-outline border-2 border-transparent opacity-50 hover:bg-secondary-container transition-transform duration-200 ease-in-out'
              }
            >
              <span className="material-symbols-outlined" style={selecionada ? { fontVariationSettings: "'FILL' 1" } : undefined}>
                {conta.tipo === 'Comercial' ? 'storefront' : 'person'}
              </span>
              <span className="font-label-caps text-label-caps text-left">
                {conta.nome}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-auto pt-stack-base border-t border-dashed border-outline-variant">
        <button
          type="button"
          onClick={() => setPagina('ajustes')}
          className={
            pagina === 'ajustes'
              ? 'flex items-center gap-2 w-full p-3 -rotate-3 border-2 border-stamp-accent text-stamp-accent bg-tertiary-fixed-dim/20 font-bold scale-105 transition-transform duration-200 ease-in-out stamp-bg'
              : 'flex items-center gap-2 w-full p-3 text-outline border-2 border-transparent opacity-50 hover:bg-secondary-container transition-transform duration-200 ease-in-out'
          }
        >
          <span className="material-symbols-outlined">settings</span>
          <span className="font-label-caps text-label-caps text-left">Ajustes</span>
        </button>
      </div>
    </nav>
  );
}

function EmptyState({ message }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-gutter text-center">
      <div className="mb-stack-loose relative">
        <div className="w-32 h-32 border-4 border-outline/20 rounded-full flex items-center justify-center -rotate-12 border-dashed">
          <span
            className="material-symbols-outlined text-outline/40"
            style={{ fontSize: '64px', fontVariationSettings: "'wght' 200" }}
          >
            receipt_long
          </span>
        </div>
        <div className="absolute -bottom-2 -right-2 bg-background border-2 border-outline/50 w-12 h-12 flex items-center justify-center rotate-6">
          <span className="font-headline-md text-headline-md text-outline/60">
            ?
          </span>
        </div>
      </div>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[280px]">
        {message}
      </p>
    </div>
  );
}

function EmptyStateComAcoes({ resumo, abrirLancamento }) {
  return (
    <>
      <div className="p-gutter border-b border-dashed border-outline-variant bg-surface-container-lowest">
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => abrirLancamento('Entrada')}
            className="flex-1 border-2 border-primary py-3 uppercase font-label-caps text-label-caps font-bold text-primary hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            Entrada
          </button>
          <button
            type="button"
            onClick={() => abrirLancamento('Saida')}
            className="flex-1 border-2 border-primary py-3 uppercase font-label-caps text-label-caps font-bold text-primary hover:bg-primary hover:text-on-primary transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-lg">remove</span>
            Saída
          </button>
        </div>
      </div>

      <div className="px-gutter py-4 border-b-2 border-primary flex justify-between items-end bg-surface-container-lowest">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">
            HOJE
          </h2>
          <p className="font-label-caps text-label-caps text-outline">
            {formatDisplayDate(new Date())}
          </p>
        </div>
        <div className="text-right">
          <span className="font-value-lg text-value-lg text-primary block">
            {formatCurrency(resumo.saldoDiario)}
          </span>
          <span className="font-label-caps text-label-caps text-outline block">
            SALDO DIÁRIO
          </span>
        </div>
      </div>

      <EmptyState message="Nenhum lançamento ainda. Registre a primeira entrada ou saída acima." />
    </>
  );
}

function SummarySection({ resumo }) {
  return (
    <section className="px-gutter py-stack-base flex flex-col gap-stack-tight border-b border-dashed border-line">
      <div className="flex justify-between items-center py-2">
        <span className="font-body-lg text-body-lg text-on-surface">
          ENTRADAS
        </span>
        <span className="font-value-lg text-value-lg text-entrada">
          + {formatCurrency(resumo.totalEntradasMes)}
        </span>
      </div>
      <div className="flex justify-between items-center py-2">
        <span className="font-body-lg text-body-lg text-on-surface">
          SAÍDAS
        </span>
        <span className="font-value-lg text-value-lg text-saida">
          - {formatCurrency(resumo.totalSaidasMes)}
        </span>
      </div>
    </section>
  );
}

function TransactionForm({
  form,
  setForm,
  handleSubmit,
  setFormAberto,
}) {
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-surface-container border-b border-dashed border-outline-variant p-gutter flex flex-col gap-3"
    >
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setForm({ ...form, tipo: 'Entrada' })}
          className={
            form.tipo === 'Entrada'
              ? 'flex-1 border-2 border-stamp-accent bg-tertiary-fixed-dim/20 text-stamp-accent py-3 uppercase font-label-caps text-label-caps font-bold transition-colors flex items-center justify-center gap-2'
              : 'flex-1 border-2 border-outline text-outline py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-primary hover:text-on-primary hover:border-primary transition-colors flex items-center justify-center gap-2'
          }
        >
          <span className="material-symbols-outlined text-lg">add</span>
          Entrada
        </button>
        <button
          type="button"
          onClick={() => setForm({ ...form, tipo: 'Saida' })}
          className={
            form.tipo === 'Saida'
              ? 'flex-1 border-2 border-stamp-accent bg-tertiary-fixed-dim/20 text-stamp-accent py-3 uppercase font-label-caps text-label-caps font-bold transition-colors flex items-center justify-center gap-2'
              : 'flex-1 border-2 border-outline text-outline py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-primary hover:text-on-primary hover:border-primary transition-colors flex items-center justify-center gap-2'
          }
        >
          <span className="material-symbols-outlined text-lg">remove</span>
          Saída
        </button>
      </div>
      <label className="flex flex-col gap-2 font-label-caps text-label-caps text-outline">
        Descrição
        <input
          placeholder="Ex: Venda de pizza"
          value={form.descricao}
          onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          required
          className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
        />
      </label>
      <div className="flex gap-3">
        <label className="flex flex-col gap-2 font-label-caps text-label-caps text-outline flex-1">
          Valor
          <input
            min="0.01"
            step="0.01"
            type="number"
            placeholder="0,00"
            value={form.valor}
            onChange={(e) => setForm({ ...form, valor: e.target.value })}
            required
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          />
        </label>
        <label className="flex flex-col gap-2 font-label-caps text-label-caps text-outline flex-1">
          Data
          <input
            type="date"
            value={form.data}
            onChange={(e) => setForm({ ...form, data: e.target.value })}
            className="bg-surface-container-lowest border border-outline-variant text-on-surface font-body-lg text-body-lg p-3 focus:border-primary focus:outline-2 focus:outline-primary/10"
          />
        </label>
      </div>
      <div className="flex gap-3 mt-2">
        <button
          type="button"
          onClick={() => setFormAberto(false)}
          className="flex-1 border-2 border-outline text-outline py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-primary hover:text-on-primary hover:border-primary transition-colors"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 border-2 border-primary bg-primary text-on-primary py-3 uppercase font-label-caps text-label-caps font-bold hover:bg-ink transition-colors"
        >
          Registrar {form.tipo.toLowerCase()}
        </button>
      </div>
    </form>
  );
}

function TransactionList({ titulo, transacoes, handleDelete }) {
  return (
    <section className="flex-grow mt-4">
      <div className="px-gutter pb-2 border-b border-dashed border-line">
        <h2 className="font-label-caps text-label-caps text-secondary uppercase">
          {titulo}
        </h2>
      </div>

      {transacoes.map((transacao) => {
        const tipo = transacao.tipo.toLowerCase();
        return (
          <div
            key={transacao.id}
            className="flex items-center px-gutter py-stack-base border-b border-dashed border-line group hover:bg-surface-variant transition-colors duration-75"
          >
            <div
              className={`w-1 h-12 bg-${tipo} mr-4 rounded-sm flex-shrink-0`}
              style={{ backgroundColor: tipo === 'entrada' ? '#105137' : '#ba1a1a' }}
            />
            <div className="flex-grow flex flex-col min-w-0">
              <span className="font-body-lg text-body-lg text-ink truncate">
                {transacao.descricao}
              </span>
              <span className="font-label-caps text-label-caps text-secondary mt-1">
                {formatDisplayDate(transacao.data)}
              </span>
            </div>
            <div className="text-right flex flex-col items-end gap-1 ml-3">
              <span
                className={`font-value-lg text-value-lg whitespace-nowrap ${tipo === 'entrada' ? 'text-entrada' : 'text-saida'}`}
              >
                {transacao.tipo === 'Entrada' ? '+' : '-'}
                {formatCurrency(transacao.valor)}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(transacao.id)}
                className="font-label-caps text-label-caps text-outline hover:text-error transition-colors opacity-0 group-hover:opacity-100"
              >
                Excluir
              </button>
            </div>
          </div>
        );
      })}
    </section>
  );
}

function ActionArea({ abrirLancamento }) {
  return (
    <div className="px-gutter py-margin-page flex justify-center">
      <button
        type="button"
        onClick={() => abrirLancamento('Entrada')}
        className="border-2 border-ink text-ink font-label-caps text-label-caps px-8 py-4 uppercase tracking-widest hover:bg-ink hover:text-paper transition-colors duration-150 flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-sm">add_circle</span>
        NOVO LANÇAMENTO
      </button>
    </div>
  );
}

function BottomNav({ abrirLancamento, resumo, temTransacoes, pagina, setPagina }) {
  const navItems = [
    { id: 'extrato', label: 'Extrato', icon: 'list_alt' },
    { id: 'novo', label: 'Novo', icon: 'add_box', isButton: true },
    { id: 'relatorios', label: 'Relatórios', icon: 'analytics' },
    { id: 'ajustes', label: 'Ajustes', icon: 'settings' },
  ];

  return (
    <nav className="fixed bottom-0 w-full flex justify-between items-center py-4 bg-background border-t border-dashed border-outline-variant md:border-t-2 md:border-primary z-50 max-w-receipt-width md:max-w-none left-1/2 md:left-0 -translate-x-1/2 md:translate-x-0 md:pl-64">
      <div className="flex gap-4 md:gap-8 flex-grow justify-around md:justify-start px-4">
        {navItems.map((item) => {
          const isActive = pagina === item.id;

          if (item.isButton) {
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPagina('extrato');
                  abrirLancamento('Entrada');
                }}
                className="flex flex-col items-center justify-center text-secondary opacity-60 active:translate-y-0.5 hover:opacity-100"
              >
                <span className="material-symbols-outlined mb-1">{item.icon}</span>
                <span className="font-label-caps text-label-caps">{item.label}</span>
              </button>
            );
          }

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setPagina(item.id)}
              className={
                isActive
                  ? 'flex flex-col items-center justify-center text-primary font-bold underline decoration-2 active:translate-y-0.5 hover:invert relative'
                  : 'flex flex-col items-center justify-center text-secondary opacity-60 active:translate-y-0.5 hover:opacity-100'
              }
            >
              {isActive && item.id === 'ajustes' && (
                <div className="absolute inset-0 bg-tertiary-fixed-dim/20 -rotate-3 -m-2 -z-10 stamp-bg border-2 border-on-tertiary-container rounded-sm" />
              )}
              <span className="material-symbols-outlined mb-1" style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}>{item.icon}</span>
              <span className="font-label-caps text-label-caps">{item.label}</span>
            </button>
          );
        })}
      </div>

      {pagina === 'extrato' && temTransacoes && (
        <div className="hidden md:flex flex-col items-end border-l-2 border-primary pl-4 mr-4">
          <span className="font-label-caps text-label-caps text-outline uppercase text-sm">
            Saldo do Mês
          </span>
          <span className="font-value-lg text-value-lg text-ink font-bold">
            {formatCurrency(resumo.saldoMensal)}
          </span>
        </div>
      )}
    </nav>
  );
}

function MobileBalanceBar({ resumo }) {
  return (
    <div className="md:hidden fixed bottom-[72px] w-full bg-surface-variant flex justify-between items-center py-2 px-gutter border-t border-b border-dashed border-line z-40 max-w-receipt-width left-1/2 -translate-x-1/2">
      <span className="font-label-caps text-label-caps text-outline uppercase text-sm">
        Saldo do Mês
      </span>
      <span className="font-value-lg text-value-lg text-ink font-bold">
        {formatCurrency(resumo.saldoMensal)}
      </span>
    </div>
  );
}

function formatCurrency(value) {
  return Number(value ?? 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function formatDisplayDate(value) {
  if (!value) return '';
  const date =
    typeof value === 'string'
      ? value.includes('T')
        ? new Date(value)
        : new Date(`${value}T12:00:00`)
      : new Date(value);
  if (isNaN(date.getTime())) return String(value);
  return date
    .toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
    .toUpperCase();
}

export default App;
