import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, render, screen, fireEvent, waitFor } from '@testing-library/react';
import OpenFinanceConnectModal from './OpenFinanceConnectModal';
import { ToastProvider } from '../../contexts/ToastContext';
import * as api from '../../services/api';
import type { ConectarContaOpenFinanceResponse, InstituicaoBancariaDto } from '@/types';

vi.mock('../../services/api', () => ({
  listarInstituicoesOpenFinance: vi.fn(),
  conectarOpenFinance: vi.fn(),
}));

const instituicoes: InstituicaoBancariaDto[] = [
  {
    codigo: '341',
    nome: 'Itaú',
    nomeOficial: 'Itaú Unibanco S.A.',
    cor: '#EC7000',
    logoUrl: '',
    disponivel: true,
  },
  {
    codigo: '260',
    nome: 'Nubank',
    nomeOficial: 'Nu Pagamentos S.A.',
    cor: '#820AD1',
    logoUrl: '',
    disponivel: true,
  },
  {
    codigo: '001',
    nome: 'Banco do Brasil',
    nomeOficial: 'Banco do Brasil S.A.',
    cor: '#FFCD00',
    logoUrl: '',
    disponivel: true,
  },
  {
    codigo: '237',
    nome: 'Bradesco',
    nomeOficial: 'Banco Bradesco S.A.',
    cor: '#CC092F',
    logoUrl: '',
    disponivel: true,
  },
  {
    codigo: '077',
    nome: 'Inter',
    nomeOficial: 'Banco Inter S.A.',
    cor: '#FF7A00',
    logoUrl: '',
    disponivel: true,
  },
  {
    codigo: '033',
    nome: 'Santander',
    nomeOficial: 'Banco Santander (Brasil) S.A.',
    cor: '#EC0000',
    logoUrl: '',
    disponivel: true,
  },
  {
    codigo: '104',
    nome: 'Caixa',
    nomeOficial: 'Caixa Econômica Federal',
    cor: '#005CA9',
    logoUrl: '',
    disponivel: true,
  },
  {
    codigo: '208',
    nome: 'BTG Pactual',
    nomeOficial: 'Banco BTG Pactual S.A.',
    cor: '#0B3D91',
    logoUrl: '',
    disponivel: true,
  },
  {
    codigo: '336',
    nome: 'C6 Bank',
    nomeOficial: 'Banco C6 S.A.',
    cor: '#1A1A1A',
    logoUrl: '',
    disponivel: true,
  },
];

const respostaConexao: ConectarContaOpenFinanceResponse = {
  conta: {
    id: 9,
    nome: 'Conta PJ Itaú',
    tipo: 'Comercial',
    arquivada: false,
    provedor: 'MockSandbox',
    statusSincronizacao: 'Sincronizado',
    instituicaoNome: 'Itaú Unibanco S.A.',
    instituicaoCodigo: '341',
  },
  sincronizacao: {
    contaId: 9,
    contaNome: 'Conta PJ Itaú',
    sucesso: true,
    novasTransacoes: 12,
    transacoesDuplicadasIgnoradas: 0,
    saldoConsolidado: 1000,
    tempoRespostaMs: 120,
    sincronizadoEm: new Date().toISOString(),
  },
  instituicao: instituicoes[0],
  transacoesImportadas: [],
  provedor: 'MockSandbox',
};

describe('OpenFinanceConnectModal', () => {
  const onOpenChange = vi.fn();
  const onContaConectada = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(api.listarInstituicoesOpenFinance).mockResolvedValue(instituicoes);
    vi.mocked(api.conectarOpenFinance).mockResolvedValue(respostaConexao);
  });

  function renderModal(open = true) {
    return render(
      <ToastProvider>
        <OpenFinanceConnectModal
          open={open}
          onOpenChange={onOpenChange}
          onContaConectada={onContaConectada}
        />
      </ToastProvider>,
    );
  }

  it('não renderiza quando fechado', () => {
    renderModal(false);
    expect(screen.queryByText('Conectar Instituição Financeira')).not.toBeInTheDocument();
    expect(api.listarInstituicoesOpenFinance).not.toHaveBeenCalled();
  });

  it('carrega e lista as instituições suportadas ao abrir', async () => {
    renderModal();

    expect(
      screen.getByRole('heading', { name: 'Conectar Instituição Financeira' }),
    ).toBeInTheDocument();
    await waitFor(() => {
      expect(api.listarInstituicoesOpenFinance).toHaveBeenCalledTimes(1);
      expect(screen.getByText('Itaú Unibanco S.A.')).toBeInTheDocument();
      expect(screen.getByText('Nu Pagamentos S.A.')).toBeInTheDocument();
      expect(screen.getByText('Banco do Brasil S.A.')).toBeInTheDocument();
      expect(screen.getByText('C6 Bank')).toBeInTheDocument();
    });
  });

  it('seleciona banco, preenche os dados e submete a conexão com o payload correto', async () => {
    renderModal();

    await waitFor(() => expect(screen.getByText('Itaú Unibanco S.A.')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Itaú/ }));
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    expect(screen.getByText('Consentimento regulado pelo BACEN')).toBeInTheDocument();
    expect(screen.getByText(/Criptografia de ponta a ponta/)).toBeInTheDocument();
    expect(screen.getByText(/Validade de 12 meses/)).toBeInTheDocument();
    expect(screen.getByText(/Acesso somente leitura de extrato e saldo/)).toBeInTheDocument();
    expect(
      screen.getByText(/Nenhuma movimentação, pagamento ou transferência/),
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('Nome da Conta'), {
      target: { value: 'Conta PJ Itaú' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Comercial' }));
    fireEvent.click(screen.getByRole('button', { name: /Movimentação Comercial Intensa/i }));
    fireEvent.click(screen.getByRole('button', { name: /Conectar via Open Finance/i }));

    await waitFor(() => {
      expect(api.conectarOpenFinance).toHaveBeenCalledWith({
        instituicaoCodigo: '341',
        tipoConta: 'Comercial',
        nomePersonalizado: 'Conta PJ Itaú',
        agencia: null,
        numeroConta: null,
        chavePix: null,
        cenarioSandbox: true,
      });
      expect(onContaConectada).toHaveBeenCalledWith(respostaConexao);
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(
        screen.getByText(/Conta conectada com sucesso! 12 lançamento\(s\) importado\(s\)\./),
      ).toBeInTheDocument();
    });
  });

  it('não conecta nem fecha ao avançar para a etapa de configuração', async () => {
    renderModal();

    await waitFor(() => expect(screen.getByText('Itaú Unibanco S.A.')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Itaú/ }));
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    // A etapa 2 deve apenas abrir — a conexão exige clique explícito no botão final.
    expect(screen.getByText('Consentimento regulado pelo BACEN')).toBeInTheDocument();
    expect(api.conectarOpenFinance).not.toHaveBeenCalled();
    expect(onContaConectada).not.toHaveBeenCalled();
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('envia agência, número da conta e chave Pix preenchidos', async () => {
    renderModal();

    await waitFor(() => expect(screen.getByText('Nubank')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Nubank/ }));
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));

    fireEvent.change(screen.getByLabelText('Agência'), { target: { value: '1234' } });
    fireEvent.change(screen.getByLabelText('Número da Conta'), { target: { value: '56789-0' } });
    fireEvent.change(screen.getByLabelText(/Chave Pix/), {
      target: { value: 'financeiro@empresa.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Conectar via Open Finance/i }));

    await waitFor(() => {
      expect(api.conectarOpenFinance).toHaveBeenCalledWith({
        instituicaoCodigo: '260',
        tipoConta: 'Pessoal',
        nomePersonalizado: null,
        agencia: '1234',
        numeroConta: '56789-0',
        chavePix: 'financeiro@empresa.com',
        cenarioSandbox: false,
      });
    });
  });

  it('exibe feedback animado de autorização e importação enquanto conecta', async () => {
    let resolver!: (valor: ConectarContaOpenFinanceResponse) => void;
    vi.mocked(api.conectarOpenFinance).mockReturnValue(
      new Promise((resolve) => {
        resolver = resolve;
      }) as any,
    );

    renderModal();
    await waitFor(() => expect(screen.getByText('Nubank')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Nubank/ }));
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Conectar via Open Finance/i }));

    expect(screen.getByRole('status')).toHaveTextContent('Autorizando consentimento...');
    expect(screen.getByRole('button', { name: /Conectando/i })).toBeDisabled();

    await act(async () => {
      resolver(respostaConexao);
    });

    await waitFor(() => expect(onContaConectada).toHaveBeenCalledWith(respostaConexao));
  });

  it('exibe toast de erro quando a conexão falha', async () => {
    vi.mocked(api.conectarOpenFinance).mockRejectedValue(
      new Error('Consentimento negado pelo banco'),
    );

    renderModal();
    await waitFor(() => expect(screen.getByText('Itaú')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /Itaú/ }));
    fireEvent.click(screen.getByRole('button', { name: /Continuar/i }));
    fireEvent.click(screen.getByRole('button', { name: /Conectar via Open Finance/i }));

    await waitFor(() => {
      expect(screen.getByText('Consentimento negado pelo banco')).toBeInTheDocument();
      expect(onContaConectada).not.toHaveBeenCalled();
    });
  });
});
