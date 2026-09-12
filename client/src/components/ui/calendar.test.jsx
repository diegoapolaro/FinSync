import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Calendar } from './calendar';

describe('Calendar component (Shadcn UI)', () => {
  it('deve renderizar o cabeçalho com mês e ano e dias da semana', () => {
    const dataBase = new Date(2026, 8, 12, 12, 0, 0); // Setembro 2026
    render(<Calendar selected={dataBase} />);

    expect(screen.getByText('Setembro')).toBeInTheDocument();
    expect(screen.getByText('2026')).toBeInTheDocument();
    expect(screen.getByText('Dom')).toBeInTheDocument();
    expect(screen.getByText('Seg')).toBeInTheDocument();
  });

  it('deve navegar entre meses usando os botões de chevron', () => {
    const dataBase = new Date(2026, 8, 1, 12, 0, 0); // Setembro 2026
    render(<Calendar selected={dataBase} />);

    expect(screen.getByText('Setembro')).toBeInTheDocument();

    const btnProximo = screen.getByLabelText('Próximo mês');
    fireEvent.click(btnProximo);
    expect(screen.getByText('Outubro')).toBeInTheDocument();

    const btnAnterior = screen.getByLabelText('Mês anterior');
    fireEvent.click(btnAnterior);
    expect(screen.getByText('Setembro')).toBeInTheDocument();
  });

  it('deve disparar onSelect ao clicar em um dia no modo single', () => {
    const dataBase = new Date(2026, 8, 15, 12, 0, 0);
    const onSelect = vi.fn();
    render(<Calendar mode="single" selected={dataBase} onSelect={onSelect} />);

    // Clicar no dia 20
    const btnDia20 = screen.getByRole('button', { name: /20\/09\/2026/i });
    fireEvent.click(btnDia20);

    expect(onSelect).toHaveBeenCalled();
    const dataChamada = onSelect.mock.calls[0][0];
    expect(dataChamada.getDate()).toBe(20);
    expect(dataChamada.getMonth()).toBe(8);
  });

  it('deve permitir seleção de intervalo no modo range', () => {
    const dataInicio = new Date(2026, 8, 10, 12, 0, 0);
    const dataFim = new Date(2026, 8, 15, 12, 0, 0);
    const onSelect = vi.fn();

    render(
      <Calendar
        mode="range"
        selected={{ from: dataInicio, to: dataFim }}
        onSelect={onSelect}
      />,
    );

    // Clicar no dia 5 para iniciar novo range
    const btnDia5 = screen.getByRole('button', { name: /05\/09\/2026/i });
    fireEvent.click(btnDia5);

    expect(onSelect).toHaveBeenCalledWith({
      from: expect.any(Date),
      to: null,
    });
  });

  it('deve desmarcar o dia inicial ao clicar novamente nele quando to for null', () => {
    const dataInicio = new Date(2026, 8, 10, 12, 0, 0);
    const onSelect = vi.fn();

    render(
      <Calendar
        mode="range"
        selected={{ from: dataInicio, to: null }}
        onSelect={onSelect}
      />,
    );

    // Clicar novamente no dia 10
    const btnDia10 = screen.getByRole('button', { name: /10\/09\/2026/i });
    fireEvent.click(btnDia10);

    expect(onSelect).toHaveBeenCalledWith({
      from: null,
      to: null,
    });
  });
});
