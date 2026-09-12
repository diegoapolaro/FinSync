import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PeriodoPicker from './PeriodoPicker';
import { TemaProvider } from '../../contexts/ThemeContext';

describe('PeriodoPicker component', () => {
  const defaultProps = {
    filtroTipo: 'mes',
    setFiltroTipo: vi.fn(),
    dataSelecionada: new Date(2026, 8, 12, 12, 0, 0),
    setDataSelecionada: vi.fn(),
    dataInicio: new Date(2026, 8, 1, 12, 0, 0),
    setDataInicio: vi.fn(),
    dataFim: new Date(2026, 8, 30, 12, 0, 0),
    setDataFim: vi.fn(),
    mesReferencia: new Date(2026, 8, 1, 12, 0, 0),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  function renderPicker(props = {}) {
    return render(
      <TemaProvider>
        <PeriodoPicker {...defaultProps} {...props} />
      </TemaProvider>,
    );
  }

  it('deve renderizar o gatilho (trigger) com o rótulo do período e tag do modo', () => {
    renderPicker();

    // Trigger deve conter a tag do modo e o texto do período
    expect(screen.getByRole('button', { name: /Selecionar período/i })).toBeInTheDocument();
    expect(screen.getByText('Mês')).toBeInTheDocument();
    expect(screen.getByText(/Setembro de 2026/i)).toBeInTheDocument();
  });

  it('deve abrir o painel ao clicar no botão gatilho', () => {
    renderPicker();

    const trigger = screen.getByRole('button', { name: /Selecionar período/i });
    fireEvent.click(trigger);

    expect(screen.getByRole('dialog', { name: /Painel de seleção de datas/i })).toBeInTheDocument();
    expect(screen.getByText('Selecionar Período')).toBeInTheDocument();
  });

  it('deve permitir trocar entre os modos Mês, Dia e Período', () => {
    const setFiltroTipo = vi.fn();
    renderPicker({ setFiltroTipo });

    const trigger = screen.getByRole('button', { name: /Selecionar período/i });
    fireEvent.click(trigger);

    const btnDia = screen.getByRole('button', { name: /^Dia$/i });
    fireEvent.click(btnDia);
    expect(setFiltroTipo).toHaveBeenCalledWith('dia');

    const btnPeriodo = screen.getByRole('button', { name: /^Período$/i });
    fireEvent.click(btnPeriodo);
    expect(setFiltroTipo).toHaveBeenCalledWith('periodo');
  });

  it('deve aplicar preset de Hoje corretamente', () => {
    const setFiltroTipo = vi.fn();
    const setDataSelecionada = vi.fn();

    renderPicker({ setFiltroTipo, setDataSelecionada });

    const trigger = screen.getByRole('button', { name: /Selecionar período/i });
    fireEvent.click(trigger);

    // Clicar no atalho "Hoje"
    const btnHoje = screen.getAllByRole('button', { name: /^Hoje$/i })[0];
    fireEvent.click(btnHoje);

    expect(setFiltroTipo).toHaveBeenCalledWith('dia');
    expect(setDataSelecionada).toHaveBeenCalledWith(expect.any(Date));
  });

  it('deve aplicar preset de 7 dias alterando para período e definindo datas de início e fim', () => {
    const setFiltroTipo = vi.fn();
    const setDataInicio = vi.fn();
    const setDataFim = vi.fn();

    renderPicker({ setFiltroTipo, setDataInicio, setDataFim });

    const trigger = screen.getByRole('button', { name: /Selecionar período/i });
    fireEvent.click(trigger);

    const btn7dias = screen.getByRole('button', { name: /^7 dias$/i });
    fireEvent.click(btn7dias);

    expect(setFiltroTipo).toHaveBeenCalledWith('periodo');
    expect(setDataInicio).toHaveBeenCalledWith(expect.any(Date));
    expect(setDataFim).toHaveBeenCalledWith(expect.any(Date));
  });

  it('deve exibir a grade de meses quando no modo mes e permitir selecionar outro mês', () => {
    const setFiltroTipo = vi.fn();
    const setDataInicio = vi.fn();
    const setDataFim = vi.fn();

    renderPicker({ filtroTipo: 'mes', setFiltroTipo, setDataInicio, setDataFim });

    const trigger = screen.getByRole('button', { name: /Selecionar período/i });
    fireEvent.click(trigger);

    // Grade de 12 meses deve estar visível
    expect(screen.getByRole('button', { name: /^Jan$/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^Mar$/i })).toBeInTheDocument();

    // Clicar em Janeiro
    const btnJan = screen.getByRole('button', { name: /^Jan$/i });
    fireEvent.click(btnJan);

    expect(setFiltroTipo).toHaveBeenCalled();
  });

  it('deve permitir limpar a seleção no modo período pelo botão Limpar', () => {
    renderPicker({ filtroTipo: 'periodo' });

    const trigger = screen.getByRole('button', { name: /Selecionar período/i });
    fireEvent.click(trigger);

    // O botão Limpar deve existir no banner De/Até
    const btnLimpar = screen.getByRole('button', { name: /Limpar seleção atual/i });
    expect(btnLimpar).toBeInTheDocument();

    fireEvent.click(btnLimpar);

    // Deve mostrar "De: Selecione" e "Até: Selecione"
    expect(screen.getByText('De: Selecione')).toBeInTheDocument();
    expect(screen.getByText('Até: Selecione')).toBeInTheDocument();
  });
});
