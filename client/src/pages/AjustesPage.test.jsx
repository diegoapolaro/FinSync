import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AjustesPage from './AjustesPage';
import { TemaProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../contexts/ToastContext';
import * as api from '../services/api';

const mockContas = [
  { id: 1, nome: 'Conta Corrente', tipo: 'Pessoal', arquivada: false },
  { id: 2, nome: 'Caixa Empresa', tipo: 'Comercial', arquivada: false },
];

const mockCategorias = [
  { id: 10, nome: 'Alimentação', tipo: 'Saida', cor: '#d03238' },
  { id: 20, nome: 'Salário', tipo: 'Entrada', cor: '#2ead4b' },
];

const mockSetContas = vi.fn();
const mockSetCategorias = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useOutletContext: () => ({
      contas: mockContas,
      setContas: mockSetContas,
      categorias: mockCategorias,
      setCategorias: mockSetCategorias,
    }),
  };
});

describe('AjustesPage.jsx and Settings Sections', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  function renderPage() {
    return render(
      <ToastProvider>
        <TemaProvider>
          <AjustesPage />
        </TemaProvider>
      </ToastProvider>
    );
  }

  it('deve renderizar todas as seções principais de ajustes', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: 'Perfil do Usuário' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Contas e Livros' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Categorias' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Preferências do Sistema' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Notificações e Alertas' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Exportação de Relatórios' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Segurança da Conta' })).toBeInTheDocument();
  });

  it('deve exibir contas existentes e permitir abrir formulário de nova conta', async () => {
    renderPage();

    expect(screen.getByText('Conta Corrente')).toBeInTheDocument();
    expect(screen.getByText('Caixa Empresa')).toBeInTheDocument();

    const btnNovaConta = screen.getByRole('button', { name: /Nova Conta/i });
    fireEvent.click(btnNovaConta);

    expect(screen.getByRole('heading', { name: 'Cadastrar Nova Conta' })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Nome da conta (ex: Caixa Principal, Pessoal...)')
    ).toBeInTheDocument();
  });

  it('deve exibir categorias existentes e permitir abrir formulário de nova categoria', async () => {
    renderPage();

    expect(screen.getByText('Alimentação')).toBeInTheDocument();
    expect(screen.getByText('Salário')).toBeInTheDocument();

    const btnNovaCategoria = screen.getByRole('button', { name: /Nova Categoria/i });
    fireEvent.click(btnNovaCategoria);

    expect(screen.getByRole('heading', { name: 'Nova Categoria' })).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Nome da categoria (ex: Vendas, Alimentação...)')
    ).toBeInTheDocument();
  });

  it('deve atualizar preferências (Idioma, Moeda, Formato de Data) e persistir no localStorage', async () => {
    renderPage();

    const selects = screen.getAllByRole('combobox');
    const selectIdioma = selects.find((s) => s.value === 'Português (Brasil)');
    expect(selectIdioma).toBeDefined();

    fireEvent.change(selectIdioma, { target: { value: 'English (US)' } });

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('finsync_preferencias'));
      expect(saved.idioma).toBe('English (US)');
    });

    const selectMoeda = selects.find((s) => s.value === 'Real Brasileiro (BRL - R$)');
    expect(selectMoeda).toBeDefined();
    fireEvent.change(selectMoeda, { target: { value: 'US Dollar (USD - $)' } });

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('finsync_preferencias'));
      expect(saved.moeda).toBe('US Dollar (USD - $)');
    });

    const selectData = selects.find((s) => s.value === 'dd/mm/aaaa');
    expect(selectData).toBeDefined();
    fireEvent.change(selectData, { target: { value: 'aaaa-mm-dd' } });

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('finsync_preferencias'));
      expect(saved.formatoData).toBe('aaaa-mm-dd');
    });
  });

  it('deve alternar e persistir switches de notificações', async () => {
    renderPage();

    const alertaSwitch = screen.getByRole('switch', { name: 'Alertas de Saldo Baixo' });
    expect(alertaSwitch).toBeInTheDocument();
    expect(alertaSwitch.getAttribute('aria-checked')).toBe('false');

    fireEvent.click(alertaSwitch);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('finsync_preferencias'));
      expect(saved.alertaSaldoBaixo).toBe(true);
    });

    const lembreteSwitch = screen.getByRole('switch', { name: 'Lembrete Diário de Lançamentos' });
    expect(lembreteSwitch).toBeInTheDocument();
    expect(lembreteSwitch.getAttribute('aria-checked')).toBe('true');

    fireEvent.click(lembreteSwitch);

    await waitFor(() => {
      const saved = JSON.parse(localStorage.getItem('finsync_preferencias'));
      expect(saved.lembreteDiario).toBe(false);
    });
  });

  it('deve abrir formulário de alteração de senha e chamar API de alteração', async () => {
    vi.spyOn(api, 'alterarSenha').mockResolvedValue();
    renderPage();

    const alterarSenhaCard = screen.getByText('Atualizar credencial de login');
    fireEvent.click(alterarSenhaCard);

    expect(screen.getByText('Alteração de Senha')).toBeInTheDocument();

    const inputAtual = screen.getByPlaceholderText('Senha atual');
    const inputNova = screen.getByPlaceholderText('Nova senha (mínimo 8 caracteres)');

    fireEvent.change(inputAtual, { target: { value: 'Senha@123' } });
    fireEvent.change(inputNova, { target: { value: 'NovaSenha@456' } });

    const btnSalvar = screen.getByRole('button', { name: /Salvar Nova Senha/i });
    fireEvent.click(btnSalvar);

    await waitFor(() => {
      expect(api.alterarSenha).toHaveBeenCalledWith('Senha@123', 'NovaSenha@456');
    });
  });

  it('deve permitir exportação de relatório', async () => {
    const mockBlob = new Blob(['csv data'], { type: 'text/csv' });
    vi.spyOn(api, 'exportarTransacoes').mockResolvedValue(mockBlob);
    window.URL.createObjectURL = vi.fn().mockReturnValue('blob:http://localhost/dummy');
    window.URL.revokeObjectURL = vi.fn();
    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    renderPage();

    const btnBaixar = screen.getByRole('button', { name: /Baixar Arquivo/i });
    fireEvent.click(btnBaixar);

    await waitFor(() => {
      expect(api.exportarTransacoes).toHaveBeenCalledWith(null, '30d', 'csv');
      expect(clickSpy).toHaveBeenCalled();
    });
  });
});
