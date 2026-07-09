using FinSync.Data;
using FinSync.Dtos;
using FinSync.Helpers;
using FinSync.Models;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Services;

public class ContaService(FinSyncDbContext context)
{
    public async Task<List<ContaDto>> GetAllAsync()
    {
        return await context.Contas
            .Where(c => !c.Arquivada)
            .OrderBy(c => c.Nome)
            .Select(c => new ContaDto
            {
                Id = c.Id,
                Nome = c.Nome,
                Tipo = c.Tipo,
                Arquivada = c.Arquivada
            })
            .ToListAsync();
    }

    public async Task<ContaDto?> GetByIdAsync(int id)
    {
        var conta = await context.Contas.FindAsync(id);
        if (conta is null) return null;

        return new ContaDto
        {
            Id = conta.Id,
            Nome = conta.Nome,
            Tipo = conta.Tipo,
            Arquivada = conta.Arquivada
        };
    }

    public async Task<bool> ExistsAsync(int id)
    {
        return await context.Contas.AnyAsync(c => c.Id == id);
    }

    public async Task<ContaDto> CreateAsync(CreateContaDto dto)
    {
        var conta = new Conta
        {
            Nome = dto.Nome,
            Tipo = dto.Tipo
        };

        context.Contas.Add(conta);
        await context.SaveChangesAsync();

        return new ContaDto
        {
            Id = conta.Id,
            Nome = conta.Nome,
            Tipo = conta.Tipo,
            Arquivada = conta.Arquivada
        };
    }

    public async Task<bool> UpdateAsync(int id, UpdateContaDto dto)
    {
        var conta = await context.Contas.FindAsync(id);
        if (conta is null) return false;

        conta.Nome = dto.Nome;
        conta.Tipo = dto.Tipo;
        conta.Arquivada = dto.Arquivada;

        await context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> ToggleArchiveAsync(int id)
    {
        var conta = await context.Contas.FindAsync(id);
        if (conta is null) return false;

        conta.Arquivada = !conta.Arquivada;
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<(bool Success, string? Error)> DeleteAsync(int id)
    {
        var conta = await context.Contas.FindAsync(id);
        if (conta is null) return (false, null);

        var possuiTransacoes = await context.Transacoes.AnyAsync(t => t.ContaId == id);
        if (possuiTransacoes)
        {
            return (false, "Nao e possivel deletar uma conta que possui transacoes.");
        }

        context.Contas.Remove(conta);
        await context.SaveChangesAsync();
        return (true, null);
    }

    public async Task<object?> GetResumoAsync(int id)
    {
        var contaExiste = await context.Contas.AnyAsync(c => c.Id == id);
        if (!contaExiste) return null;

        var hoje = DateOnly.FromDateTime(DateTime.Today);
        var (inicioMes, fimMes) = DateRangeHelper.GetPeriodo("mes_atual");

        var agregado = await context.Transacoes
            .Where(t => t.ContaId == id)
            .GroupBy(t => 1)
            .Select(g => new
            {
                TotalEntradas = g.Where(t => t.Tipo == TipoTransacao.Entrada).Sum(t => t.Valor),
                TotalSaidas = g.Where(t => t.Tipo == TipoTransacao.Saida).Sum(t => t.Valor),
                TotalEntradasHoje = g.Where(t => t.Tipo == TipoTransacao.Entrada && t.Data == hoje).Sum(t => t.Valor),
                TotalSaidasHoje = g.Where(t => t.Tipo == TipoTransacao.Saida && t.Data == hoje).Sum(t => t.Valor),
                TotalEntradasMes = g.Where(t => t.Tipo == TipoTransacao.Entrada && t.Data >= inicioMes && t.Data < fimMes).Sum(t => t.Valor),
                TotalSaidasMes = g.Where(t => t.Tipo == TipoTransacao.Saida && t.Data >= inicioMes && t.Data < fimMes).Sum(t => t.Valor),
                QuantidadeTransacoes = g.Count()
            })
            .FirstOrDefaultAsync();

        if (agregado is null)
        {
            return new
            {
                TotalEntradas = 0m, TotalSaidas = 0m, Saldo = 0m,
                TotalEntradasHoje = 0m, TotalSaidasHoje = 0m, SaldoDiario = 0m,
                TotalEntradasMes = 0m, TotalSaidasMes = 0m, SaldoMensal = 0m,
                QuantidadeTransacoes = 0
            };
        }

        return new
        {
            agregado.TotalEntradas,
            agregado.TotalSaidas,
            Saldo = agregado.TotalEntradas - agregado.TotalSaidas,
            agregado.TotalEntradasHoje,
            agregado.TotalSaidasHoje,
            SaldoDiario = agregado.TotalEntradasHoje - agregado.TotalSaidasHoje,
            agregado.TotalEntradasMes,
            agregado.TotalSaidasMes,
            SaldoMensal = agregado.TotalEntradasMes - agregado.TotalSaidasMes,
            agregado.QuantidadeTransacoes
        };
    }
}