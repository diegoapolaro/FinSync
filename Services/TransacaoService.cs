using FinSync.Data;
using FinSync.Dtos;
using FinSync.Helpers;
using FinSync.Models;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Services;

public class TransacaoService(FinSyncDbContext context)
{
    public async Task<List<TransacaoDto>> GetAllAsync(int? contaId, DateOnly? data = null)
    {
        var query = context.Transacoes
            .Include(t => t.Conta)
            .Include(t => t.Categoria)
            .AsQueryable();

        if (contaId is not null)
        {
            query = query.Where(t => t.ContaId == contaId);
        }

        if (data is not null)
        {
            query = query.Where(t => t.Data == data);
        }

        return await query
            .OrderByDescending(t => t.Data)
            .Select(t => new TransacaoDto
            {
                Id = t.Id,
                Descricao = t.Descricao,
                Valor = t.Valor,
                Tipo = t.Tipo,
                Data = t.Data,
                ContaId = t.ContaId,
                ContaNome = t.Conta != null ? t.Conta.Nome : string.Empty,
                CategoriaId = t.CategoriaId,
                CategoriaNome = t.Categoria != null ? t.Categoria.Nome : string.Empty,
                CategoriaCor = t.Categoria != null ? t.Categoria.Cor : string.Empty
            })
            .ToListAsync();
    }

    public async Task<TransacaoDto?> GetByIdAsync(int id)
    {
        var t = await context.Transacoes
            .Include(t => t.Conta)
            .Include(t => t.Categoria)
            .FirstOrDefaultAsync(t => t.Id == id);

        if (t is null) return null;

        return new TransacaoDto
        {
            Id = t.Id,
            Descricao = t.Descricao,
            Valor = t.Valor,
            Tipo = t.Tipo,
            Data = t.Data,
            ContaId = t.ContaId,
            ContaNome = t.Conta?.Nome ?? string.Empty,
            CategoriaId = t.CategoriaId,
            CategoriaNome = t.Categoria?.Nome ?? string.Empty,
            CategoriaCor = t.Categoria?.Cor ?? string.Empty
        };
    }

    public async Task<(TransacaoDto? Dto, string? Error)> CreateAsync(CreateTransacaoDto dto)
    {
        var contaExiste = await context.Contas.AnyAsync(c => c.Id == dto.ContaId);
        if (!contaExiste)
        {
            return (null, $"A conta com id {dto.ContaId} nao existe.");
        }

        var transacao = new Transacao
        {
            Descricao = dto.Descricao,
            Valor = dto.Valor,
            Tipo = dto.Tipo,
            Data = dto.Data,
            ContaId = dto.ContaId,
            CategoriaId = dto.CategoriaId
        };

        context.Transacoes.Add(transacao);
        await context.SaveChangesAsync();

        await context.Entry(transacao).Reference(t => t.Conta).LoadAsync();

        await context.Entry(transacao).Reference(t => t.Categoria).LoadAsync();

        return (new TransacaoDto
        {
            Id = transacao.Id,
            Descricao = transacao.Descricao,
            Valor = transacao.Valor,
            Tipo = transacao.Tipo,
            Data = transacao.Data,
            ContaId = transacao.ContaId,
            ContaNome = transacao.Conta?.Nome ?? string.Empty,
            CategoriaId = transacao.CategoriaId,
            CategoriaNome = transacao.Categoria?.Nome ?? string.Empty,
            CategoriaCor = transacao.Categoria?.Cor ?? string.Empty
        }, null);
    }

    public async Task<(bool Found, string? Error)> UpdateAsync(int id, UpdateTransacaoDto dto)
    {
        var transacao = await context.Transacoes.FindAsync(id);
        if (transacao is null) return (false, null);

        var contaExiste = await context.Contas.AnyAsync(c => c.Id == dto.ContaId);
        if (!contaExiste)
        {
            return (true, $"A conta com id {dto.ContaId} nao existe.");
        }

        transacao.Descricao = dto.Descricao;
        transacao.Valor = dto.Valor;
        transacao.Tipo = dto.Tipo;
        transacao.Data = dto.Data;
        transacao.ContaId = dto.ContaId;
        transacao.CategoriaId = dto.CategoriaId;

        await context.SaveChangesAsync();
        return (true, null);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var transacao = await context.Transacoes.FindAsync(id);
        if (transacao is null) return false;

        context.Transacoes.Remove(transacao);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<List<DetalhamentoCategoriaDto>> GetDetalhamentoAsync(int? contaId, DateOnly dataInicio, DateOnly dataFim)
    {
        var query = context.Transacoes
            .Include(t => t.Categoria)
            .Where(t => t.Data >= dataInicio && t.Data <= dataFim)
            .AsQueryable();

        if (contaId is not null)
        {
            query = query.Where(t => t.ContaId == contaId);
        }

        return await query
            .GroupBy(t => new { t.CategoriaId, Nome = t.Categoria != null ? t.Categoria.Nome : "Sem Categoria", Cor = t.Categoria != null ? t.Categoria.Cor : "#747874" })
            .Select(g => new DetalhamentoCategoriaDto
            {
                CategoriaId = g.Key.CategoriaId,
                CategoriaNome = g.Key.Nome,
                CategoriaCor = g.Key.Cor,
                Total = g.Sum(t => t.Tipo == TipoTransacao.Entrada ? t.Valor : -t.Valor)
            })
            .OrderByDescending(d => Math.Abs(d.Total))
            .ToListAsync();
    }

    public async Task<object> GetResumoPeriodoAsync(int? contaId, DateOnly dataInicio, DateOnly dataFim)
    {
        var query = context.Transacoes
            .Where(t => t.Data >= dataInicio && t.Data <= dataFim)
            .AsQueryable();

        if (contaId is not null)
        {
            query = query.Where(t => t.ContaId == contaId);
        }

        var totalEntradas = await query.Where(t => t.Tipo == TipoTransacao.Entrada).SumAsync(t => t.Valor);
        var totalSaidas = await query.Where(t => t.Tipo == TipoTransacao.Saida).SumAsync(t => t.Valor);

        return new
        {
            TotalEntradas = totalEntradas,
            TotalSaidas = totalSaidas,
            Saldo = totalEntradas - totalSaidas
        };
    }

    public async Task<byte[]> ExportarCsvAsync(int? contaId, string periodo)
    {
        var query = context.Transacoes.AsQueryable();

        if (contaId is not null)
        {
            query = query.Where(t => t.ContaId == contaId);
        }

        var (inicio, fim) = DateRangeHelper.GetPeriodo(periodo);
        query = query.Where(t => t.Data >= inicio && t.Data < fim);
        query = query.OrderByDescending(t => t.Data);

        var transacoes = await query.ToListAsync();

        var sb = new System.Text.StringBuilder();
        sb.AppendLine("Id,Descricao,Valor,Tipo,Data,ContaId");

        foreach (var t in transacoes)
        {
            sb.AppendLine($"{t.Id},\"{t.Descricao}\",{t.Valor.ToString(System.Globalization.CultureInfo.InvariantCulture)},{t.Tipo},{t.Data:yyyy-MM-dd},{t.ContaId}");
        }

        return System.Text.Encoding.UTF8.GetBytes(sb.ToString());
    }
}