import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CheckCircle2,
  Loader2,
  Lock,
  ShieldCheck,
  Store,
  User,
} from 'lucide-react';
import { conectarOpenFinance, listarInstituicoesOpenFinance } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import { Dialog, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { cn } from '@/lib/utils';
import type { ConectarContaOpenFinanceResponse, InstituicaoBancariaDto, TipoConta } from '@/types';

type CenarioId = 'comercial' | 'pessoal' | 'padrao';

interface CenarioSandbox {
  id: CenarioId;
  titulo: string;
  descricao: string;
  tipo: TipoConta;
  nomeSugerido: string;
  cenarioSandbox: boolean;
}

const CENARIOS: CenarioSandbox[] = [
  {
    id: 'comercial',
    titulo: 'Movimentação Comercial Intensa',
    descricao: 'Vendas, fornecedores, folha e impostos',
    tipo: 'Comercial',
    nomeSugerido: 'Conta Comercial (Open Finance)',
    cenarioSandbox: true,
  },
  {
    id: 'pessoal',
    titulo: 'Gastos Pessoais & Assinaturas',
    descricao: 'Cartão, mercado e assinaturas recorrentes',
    tipo: 'Pessoal',
    nomeSugerido: 'Gastos Pessoais (Open Finance)',
    cenarioSandbox: true,
  },
  {
    id: 'padrao',
    titulo: 'Extrato Padrão',
    descricao: 'Movimentação mista para conferência',
    tipo: 'Pessoal',
    nomeSugerido: 'Conta Open Finance',
    cenarioSandbox: false,
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onContaConectada?: (response: ConectarContaOpenFinanceResponse) => void;
}

function siglaBanco(nome: string): string {
  const partes = nome
    .replace(/^Banco\s+/i, '')
    .split(/\s+/)
    .filter((parte) => parte && !/^(do|da|de|e)$/i.test(parte));
  if (partes.length >= 2) return (partes[0][0] + partes[1][0]).toUpperCase();
  return nome.slice(0, 2).toUpperCase();
}

export default function OpenFinanceConnectModal({ open, onOpenChange, onContaConectada }: Props) {
  const { addToast } = useToast();

  const [instituicoes, setInstituicoes] = useState<InstituicaoBancariaDto[]>([]);
  const [carregandoBancos, setCarregandoBancos] = useState(false);
  const [erroBancos, setErroBancos] = useState<string | null>(null);
  const [etapa, setEtapa] = useState<1 | 2>(1);
  const [codigoSelecionado, setCodigoSelecionado] = useState<string | null>(null);
  const [nomeConta, setNomeConta] = useState('');
  const [agencia, setAgencia] = useState('');
  const [numeroConta, setNumeroConta] = useState('');
  const [chavePix, setChavePix] = useState('');
  const [tipoConta, setTipoConta] = useState<TipoConta>('Pessoal');
  const [cenario, setCenario] = useState<CenarioId>('padrao');
  const [conectando, setConectando] = useState(false);
  const [mensagemConexao, setMensagemConexao] = useState('Autorizando consentimento...');

  const carregarInstituicoes = useCallback(async (ativo: () => boolean) => {
    setCarregandoBancos(true);
    setErroBancos(null);
    try {
      const dados = await listarInstituicoesOpenFinance();
      if (ativo()) setInstituicoes(Array.isArray(dados) ? dados : []);
    } catch (err: any) {
      if (ativo()) {
        setErroBancos(err?.message || 'Não foi possível carregar as instituições.');
      }
    } finally {
      if (ativo()) setCarregandoBancos(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return;
    let ativo = true;
    setEtapa(1);
    setCodigoSelecionado(null);
    setNomeConta('');
    setAgencia('');
    setNumeroConta('');
    setChavePix('');
    setTipoConta('Pessoal');
    setCenario('padrao');
    setConectando(false);
    carregarInstituicoes(() => ativo);
    return () => {
      ativo = false;
    };
  }, [open, carregarInstituicoes]);

  function fechar() {
    if (conectando) return;
    onOpenChange(false);
  }

  function selecionarCenario(id: CenarioId) {
    const selecionado = CENARIOS.find((item) => item.id === id);
    if (!selecionado) return;
    setCenario(id);
    setTipoConta(selecionado.tipo);
    setNomeConta((atual) => (atual.trim() ? atual : selecionado.nomeSugerido));
  }

  async function handleConnect() {
    // A conexão só pode ocorrer por clique explícito na etapa 2. Sem <form>,
    // um submit implícito (Enter ou clique acidental no botão que troca de
    // lugar com "Continuar") não pode criar a conta sozinho.
    if (etapa !== 2 || !codigoSelecionado || conectando) return;

    const selecionado = CENARIOS.find((item) => item.id === cenario) ?? CENARIOS[2];
    setConectando(true);
    setMensagemConexao('Autorizando consentimento...');
    const timer = window.setTimeout(
      () => setMensagemConexao('Importando primeiro extrato...'),
      900,
    );

    try {
      const response = await conectarOpenFinance({
        instituicaoCodigo: codigoSelecionado,
        tipoConta,
        nomePersonalizado: nomeConta.trim() || null,
        agencia: agencia.trim() || null,
        numeroConta: numeroConta.trim() || null,
        chavePix: chavePix.trim() || null,
        cenarioSandbox: selecionado.cenarioSandbox,
      });
      const importadas = response?.sincronizacao?.novasTransacoes ?? 0;
      addToast(`Conta conectada com sucesso! ${importadas} lançamento(s) importado(s).`, 'success');
      onContaConectada?.(response);
      onOpenChange(false);
    } catch (err: any) {
      addToast(err?.message || 'Não foi possível conectar à instituição.', 'error');
    } finally {
      window.clearTimeout(timer);
      setConectando(false);
    }
  }

  const instituicaoSelecionada = instituicoes.find((item) => item.codigo === codigoSelecionado);

  return (
    <Dialog open={open} onOpenChange={fechar}>
      <div className="space-y-5">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-forest-ink text-lime-voltage flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 stroke-[2.25]" />
            </div>
            <div>
              <DialogTitle>Conectar Instituição Financeira</DialogTitle>
              <DialogDescription>
                Open Finance 3.0 · consentimento regulado pelo Banco Central
              </DialogDescription>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <span
              className={cn(
                'px-3 py-1 rounded-full text-[11px] font-bold font-mono border',
                etapa === 1
                  ? 'bg-forest-ink text-lime-voltage border-forest-ink'
                  : 'bg-linen-mist text-forest-ink border-linen-mist dark:bg-spruce dark:text-lime-voltage dark:border-spruce',
              )}
            >
              1 · Instituição
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-pebble" />
            <span
              className={cn(
                'px-3 py-1 rounded-full text-[11px] font-bold font-mono border',
                etapa === 2
                  ? 'bg-forest-ink text-lime-voltage border-forest-ink'
                  : 'bg-fog/60 text-muted-foreground border-border/60 dark:bg-spruce/40',
              )}
            >
              2 · Configuração
            </span>
          </div>
        </DialogHeader>

        {etapa === 1 ? (
          <div className="space-y-3">
            <div>
              <h3 className="text-sm font-bold text-foreground font-sans">Escolha seu banco</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Selecionamos a instituição e preparamos o consentimento de leitura.
              </p>
            </div>

            {carregandoBancos && (
              <div
                data-testid="instituicoes-loading"
                className="grid grid-cols-2 sm:grid-cols-3 gap-3"
              >
                {Array.from({ length: 6 }, (_, index) => (
                  <div
                    key={index}
                    className="h-24 rounded-2xl bg-fog/70 dark:bg-spruce/40 animate-pulse"
                  />
                ))}
              </div>
            )}

            {!carregandoBancos && erroBancos && (
              <div className="rounded-2xl border border-alarm-red/30 bg-alarm-red/5 p-5 text-center space-y-3">
                <p className="text-xs font-semibold text-alarm-red">{erroBancos}</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="rounded-full"
                  onClick={() => carregarInstituicoes(() => true)}
                >
                  Tentar novamente
                </Button>
              </div>
            )}

            {!carregandoBancos && !erroBancos && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[46vh] overflow-y-auto pr-1 custom-scrollbar">
                {instituicoes.map((banco) => {
                  const selecionado = banco.codigo === codigoSelecionado;
                  return (
                    <button
                      key={banco.codigo}
                      type="button"
                      disabled={!banco.disponivel}
                      aria-pressed={selecionado}
                      onClick={() => setCodigoSelecionado(banco.codigo)}
                      className={cn(
                        'relative flex flex-col items-start gap-2 p-3 rounded-2xl border text-left transition-all duration-200 active:scale-[0.98]',
                        selecionado
                          ? 'border-forest-ink dark:border-lime-voltage bg-linen-mist dark:bg-spruce shadow-sm ring-2 ring-lime-voltage/30'
                          : 'border-border/80 bg-card hover:-translate-y-0.5 hover:shadow-card hover:border-forest-ink/30',
                        !banco.disponivel && 'opacity-50 cursor-not-allowed',
                      )}
                    >
                      <div
                        className="w-9 h-9 rounded-xl border flex items-center justify-center text-xs font-black font-mono"
                        style={{
                          color: banco.cor,
                          borderColor: `${banco.cor}55`,
                          backgroundColor: `${banco.cor}14`,
                        }}
                      >
                        {siglaBanco(banco.nome)}
                      </div>
                      <div className="min-w-0 w-full">
                        <span className="block text-xs font-bold text-foreground truncate">
                          {banco.nome}
                        </span>
                        <span className="block text-[10px] text-muted-foreground truncate">
                          {banco.nomeOficial}
                        </span>
                      </div>
                      <span className="absolute top-3 right-3 text-[10px] font-mono font-bold text-muted-foreground bg-fog/70 dark:bg-spruce/70 px-1.5 py-0.5 rounded-full">
                        {banco.codigo}
                      </span>
                      {selecionado && (
                        <span className="absolute bottom-2 right-2 w-5 h-5 rounded-full bg-forest-ink text-lime-voltage flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-5">
            <button
              type="button"
              onClick={() => setEtapa(1)}
              disabled={conectando}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-forest-ink dark:text-lime-voltage hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Alterar instituição
            </button>

            {instituicaoSelecionada && (
              <div className="flex items-center gap-3 p-3 rounded-2xl bg-linen-mist dark:bg-spruce border border-lime-voltage/30">
                <div
                  className="w-10 h-10 rounded-xl border flex items-center justify-center text-xs font-black font-mono"
                  style={{
                    color: instituicaoSelecionada.cor,
                    borderColor: `${instituicaoSelecionada.cor}55`,
                    backgroundColor: `${instituicaoSelecionada.cor}14`,
                  }}
                >
                  {siglaBanco(instituicaoSelecionada.nome)}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">
                    {instituicaoSelecionada.nomeOficial}
                  </p>
                  <p className="text-[11px] font-mono text-charcoal dark:text-pebble">
                    Código {instituicaoSelecionada.codigo} · conexão criptografada
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="nome-conta-open-finance"
                className="text-xs font-bold text-foreground uppercase tracking-wider block"
              >
                Nome da Conta
              </label>
              <Input
                id="nome-conta-open-finance"
                value={nomeConta}
                onChange={(event) => setNomeConta(event.target.value)}
                placeholder="Ex: Conta Comercial Itaú"
                disabled={conectando}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label
                  htmlFor="agencia-open-finance"
                  className="text-xs font-bold text-foreground uppercase tracking-wider block"
                >
                  Agência
                </label>
                <Input
                  id="agencia-open-finance"
                  value={agencia}
                  onChange={(event) => setAgencia(event.target.value)}
                  placeholder="Ex: 0000"
                  inputMode="numeric"
                  disabled={conectando}
                />
              </div>
              <div className="space-y-1.5">
                <label
                  htmlFor="numero-conta-open-finance"
                  className="text-xs font-bold text-foreground uppercase tracking-wider block"
                >
                  Número da Conta
                </label>
                <Input
                  id="numero-conta-open-finance"
                  value={numeroConta}
                  onChange={(event) => setNumeroConta(event.target.value)}
                  placeholder="Ex: 00000-0"
                  disabled={conectando}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="chave-pix-open-finance"
                className="text-xs font-bold text-foreground uppercase tracking-wider block"
              >
                Chave Pix{' '}
                <span className="normal-case font-normal text-muted-foreground">(opcional)</span>
              </label>
              <Input
                id="chave-pix-open-finance"
                value={chavePix}
                onChange={(event) => setChavePix(event.target.value)}
                placeholder="CPF, e-mail, telefone ou chave aleatória"
                disabled={conectando}
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Tipo de Conta
              </span>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  disabled={conectando}
                  aria-pressed={tipoConta === 'Pessoal'}
                  onClick={() => setTipoConta('Pessoal')}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all',
                    tipoConta === 'Pessoal'
                      ? 'border-forest-ink bg-linen-mist dark:border-lime-voltage dark:bg-spruce shadow-sm'
                      : 'border-border/80 hover:bg-secondary/50',
                  )}
                >
                  <span className="w-8 h-8 rounded-xl bg-lime-voltage text-forest-ink flex items-center justify-center">
                    <User className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-foreground">Pessoal</span>
                </button>
                <button
                  type="button"
                  disabled={conectando}
                  aria-pressed={tipoConta === 'Comercial'}
                  onClick={() => setTipoConta('Comercial')}
                  className={cn(
                    'flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all',
                    tipoConta === 'Comercial'
                      ? 'border-forest-ink bg-linen-mist dark:border-lime-voltage dark:bg-spruce shadow-sm'
                      : 'border-border/80 hover:bg-secondary/50',
                  )}
                >
                  <span className="w-8 h-8 rounded-xl bg-forest-ink text-lime-voltage flex items-center justify-center">
                    <Store className="w-4 h-4" />
                  </span>
                  <span className="text-xs font-bold text-foreground">Comercial</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-bold text-foreground uppercase tracking-wider block">
                Cenário Sandbox
              </span>
              <div className="grid grid-cols-1 gap-2">
                {CENARIOS.map((item) => {
                  const selecionado = item.id === cenario;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      disabled={conectando}
                      aria-pressed={selecionado}
                      onClick={() => selecionarCenario(item.id)}
                      className={cn(
                        'flex items-center justify-between gap-3 p-3 rounded-2xl border text-left transition-all',
                        selecionado
                          ? 'border-forest-ink bg-linen-mist dark:border-lime-voltage dark:bg-spruce shadow-sm'
                          : 'border-border/80 hover:bg-secondary/50',
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block text-xs font-bold text-foreground">
                          {item.titulo}
                        </span>
                        <span className="block text-[11px] text-muted-foreground truncate">
                          {item.descricao}
                        </span>
                      </span>
                      <span
                        className={cn(
                          'w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center',
                          selecionado
                            ? 'bg-forest-ink border-forest-ink text-lime-voltage dark:bg-lime-voltage dark:border-lime-voltage dark:text-forest-ink'
                            : 'border-pebble/50',
                        )}
                      >
                        {selecionado && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-lime-voltage/40 bg-linen-mist/70 dark:bg-spruce/40 p-4 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-forest-ink dark:text-lime-voltage" />
                <span className="text-xs font-bold text-forest-ink dark:text-lime-voltage">
                  Consentimento regulado pelo BACEN
                </span>
              </div>
              <ul className="grid grid-cols-1 gap-1.5">
                {[
                  'Criptografia de ponta a ponta em todos os dados transmitidos',
                  'Validade de 12 meses, renovável a qualquer momento',
                  'Acesso somente leitura de extrato e saldo',
                  'Nenhuma movimentação, pagamento ou transferência é permitida',
                ].map((texto) => (
                  <li
                    key={texto}
                    className="flex items-start gap-2 text-[11px] leading-relaxed text-charcoal dark:text-pebble"
                  >
                    <Lock className="w-3 h-3 mt-0.5 shrink-0 text-forest-ink dark:text-lime-voltage" />
                    {texto}
                  </li>
                ))}
              </ul>
            </div>

            {conectando && (
              <div
                role="status"
                className="flex items-center gap-3 rounded-2xl bg-forest-ink text-lime-voltage px-4 py-3"
              >
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                <span className="text-xs font-bold font-mono">{mensagemConexao}</span>
              </div>
            )}
          </div>
        )}

        <DialogFooter className="pt-2">
          <Button type="button" variant="outline" onClick={fechar} disabled={conectando}>
            Cancelar
          </Button>
          {etapa === 1 ? (
            <Button
              type="button"
              disabled={!codigoSelecionado || carregandoBancos}
              onClick={() => setEtapa(2)}
              className="bg-forest-ink text-lime-voltage hover:bg-spruce font-bold gap-2"
            >
              Continuar
              <ArrowRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleConnect}
              disabled={conectando || !codigoSelecionado}
              className="bg-lime-voltage text-forest-ink hover:bg-lime-voltage/90 font-bold gap-2"
            >
              {conectando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Conectando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
                  Conectar via Open Finance
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </div>
    </Dialog>
  );
}
