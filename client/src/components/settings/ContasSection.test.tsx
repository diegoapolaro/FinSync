import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import ContasSection from './ContasSection';
import { formatarUltimaSincronizacao } from '../../utils/formatarSincronizacao';
import { ToastProvider } from '../../contexts/ToastContext';
import * as api from '../../services/api';
import type { ContaDto } from '@/types';

vi.mock('../../services/api', () => ({
  createConta: vi.fn(),
  updateConta: vi.fn(),
  deleteConta: vi.fn(),
  sincronizarConta: vi.fn(),
  sincronizarTodasContas: vi.fn(),
  desconectarOpenFinance: vi.fn(),
  listarInstituicoesOpenFinance: vi.fn(),
  conectarOpenFinance: vi.fn(),
}));

const agora = new Date();

const contasMock: ContaDto[] = [
  {
    id: 1,
    nome: 'Conta Comercial Itaú',
    tipo: 'Comercial',
    arquivada: false,
    provedor: 'MockSandbox',
    statusSincronizacao: 'Sincronizado',
    instituicaoNome: 'Itaú Unibanco S.A.',
    instituicaoCodigo: '341',
    agencia: '0942',
    numeroConta: '20491-8',
    chavePix: 'financeiro@empresa.com',
    saldo: 12500.5,
    ultimaSincronizacaoEm: new Date(agora.getTime() - 5 * 60_000).toISOString(),
  },
  {
    id: 2,
    nome: 'Pessoal Nubank',
    tipo: 'Pessoal',
    arquivada: false,
    provedor: 'Pluggy',
    statusSincronizacao: 'Falha',
    instituicaoNome: 'Nu Pagamentos S.A.',
    instituicaoCodigo: '260',
    mensagemErroSincronizacao: 'Credencial expirada',
    saldo: 3200,
  },
  {
    id: 3,
    nome: 'Carteira Manual',
    tipo: 'Pessoal',
    arquivada: false,
    provedor: 'Manual',
    statusSincronizacao: 'Manual',
  },
];

describe('ContasSection — Open Finance', () => {
  const setContas = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.setItem(
      'finsync_preferencias',
      JSON.stringify({
        moeda: 'Real Brasileiro (BRL - R$)',
        idioma: 'Português (Brasil)',
        formatoData: 'dd/mm/aaaa',
        tema: 'claro',
      }),
    );
    vi.mocked(api.listarInstituicoesOpenFinance).mockResolvedValue([]);
  });

  function renderSection(contas = contasMock) {
    return render(
      <ToastProvider>
        <ContasSection contas={contas} setContas={setContas} />
      </ToastProvider>,
    );
  }

  it('formata o texto relativo da última sincronização', () => {
    const base = new Date('2026-11-17T14:30:00');
    expect(
      formatarUltimaSincronizacao(new Date(base.getTime() - 5 * 60_000).toISOString(), base),
    ).toBe('há 5 min');
    expect(
      formatarUltimaSincronizacao(new Date(base.getTime() - 3 * 3_600_000).toISOString(), base),
    ).toBe('hoje às 11:30');
    expect(formatarUltimaSincronizacao(null, base)).toBe('');
  });

  it('renderiza os metadados bancários reais e o status relativo de cada conta', () => {
    renderSection();

    expect(
      screen.getByText(
        /Itaú Unibanco S.A. \(341\) • Ag 0942 • CC 20491-8 • Pix financeiro@empresa.com/,
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Sincronizado há 5 min/)).toBeInTheDocument();
    expect(screen.getByText('Nu Pagamentos S.A. (260)')).toBeInTheDocument();
    expect(screen.getByText('Falha na sincronização')).toHaveAttribute(
      'title',
      'Credencial expirada',
    );
    expect(screen.getByText('Registro manual sem Open Finance')).toBeInTheDocument();
    expect(screen.getAllByText('Manual').length).toBeGreaterThan(0);
  });

  it('chama sincronizarTodasContas, exibe loading e toast rico e atualiza a lista local', async () => {
    let resolver!: (valor: any) => void;
    vi.mocked(api.sincronizarTodasContas).mockReturnValue(
      new Promise((resolve) => {
        resolver = resolve;
      }) as any,
    );

    renderSection();
    fireEvent.click(screen.getByRole('button', { name: /Sincronizar Todas/i }));

    expect(screen.getByRole('button', { name: /Sincronizando\.\.\./i })).toBeDisabled();
    expect(api.sincronizarTodasContas).toHaveBeenCalledTimes(1);

    const agoraIso = new Date().toISOString();
    await act(async () => {
      resolver({
        totalContas: 2,
        contasSincronizadas: 2,
        contasComFalha: 0,
        totalNovasTransacoes: 7,
        tempoTotalMs: 210,
        resultados: [
          {
            contaId: 1,
            contaNome: 'Conta Comercial Itaú',
            sucesso: true,
            novasTransacoes: 5,
            transacoesDuplicadasIgnoradas: 0,
            saldoConsolidado: 13000,
            tempoRespostaMs: 100,
            sincronizadoEm: agoraIso,
          },
          {
            contaId: 2,
            contaNome: 'Pessoal Nubank',
            sucesso: false,
            novasTransacoes: 2,
            transacoesDuplicadasIgnoradas: 0,
            saldoConsolidado: 3200,
            tempoRespostaMs: 110,
            mensagemErro: 'Credencial expirada',
            sincronizadoEm: agoraIso,
          },
        ],
        geradoEm: agoraIso,
      });
    });

    await waitFor(() => {
      expect(
        screen.getByText(
          'Sincronização concluída! 2 conta(s) sincronizada(s) e 7 novos lançamentos importados.',
        ),
      ).toBeInTheDocument();
    });

    const updater = setContas.mock.calls.at(-1)?.[0];
    const atualizadas = updater(contasMock);
    expect(atualizadas[0].statusSincronizacao).toBe('Sincronizado');
    expect(atualizadas[0].saldo).toBe(13000);
    expect(atualizadas[1].statusSincronizacao).toBe('Falha');
  });

  it('sincroniza uma conta individual com spinner localizado e atualiza o status', async () => {
    vi.mocked(api.sincronizarConta).mockResolvedValue({
      contaId: 1,
      contaNome: 'Conta Comercial Itaú',
      sucesso: true,
      novasTransacoes: 3,
      transacoesDuplicadasIgnoradas: 1,
      saldoConsolidado: 13000,
      tempoRespostaMs: 120,
      sincronizadoEm: new Date().toISOString(),
    });

    renderSection();
    fireEvent.click(screen.getAllByTitle('Sincronizar conta')[0]);

    expect(api.sincronizarConta).toHaveBeenCalledWith(1);
    await waitFor(() => {
      expect(
        screen.getByText(/Conta Comercial Itaú: 3 novo\(s\) lançamento\(s\) importado\(s\)\./),
      ).toBeInTheDocument();
    });
  });

  it('desconecta o Open Finance após confirmação informando que os lançamentos serão preservados', async () => {
    vi.mocked(api.desconectarOpenFinance).mockResolvedValue({
      ...contasMock[0],
      provedor: 'Manual',
      statusSincronizacao: 'Manual',
    });

    renderSection();
    fireEvent.click(screen.getAllByTitle('Mais ações')[0]);
    fireEvent.click(screen.getByRole('button', { name: /Desconectar Open Finance/i }));

    expect(screen.getByText(/Os lançamentos já importados serão preservados/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Desconectar' }));

    await waitFor(() => {
      expect(api.desconectarOpenFinance).toHaveBeenCalledWith(1);
      expect(
        screen.getByText(/Open Finance desconectado\. Seus lançamentos foram preservados\./),
      ).toBeInTheDocument();
    });
  });

  it('abre o modal de conexão Open Finance ao clicar na chamada de nova instituição', async () => {
    renderSection();
    fireEvent.click(
      screen.getByRole('button', {
        name: /Conectar Nova Instituição Financeira via Open Finance/i,
      }),
    );

    expect(
      screen.getByRole('heading', { name: 'Conectar Instituição Financeira' }),
    ).toBeInTheDocument();
    expect(api.listarInstituicoesOpenFinance).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.queryByTestId('instituicoes-loading')).not.toBeInTheDocument();
    });
  });
});
