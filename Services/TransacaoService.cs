using FinSync.Data;
using FinSync.Dtos;
using FinSync.Helpers;
using FinSync.Models;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Services;

public class TransacaoService(FinSyncDbContext context)
{
    public async Task<PagedResponse<TransacaoDto>> GetAllAsync(
        int usuarioId,
        int? contaId,
        DateOnly? data = null,
        DateOnly? dataInicio = null,
        DateOnly? dataFim = null,
        int? categoriaId = null,
        int page = 1,
        int pageSize = 20)
    {
        var query = context.Transacoes
            .Include(t => t.Conta)
            .Include(t => t.Categoria)
            .Where(t => t.Conta != null && t.Conta.UsuarioId == usuarioId)
            .AsQueryable();

        if (contaId is not null)
        {
            query = query.Where(t => t.ContaId == contaId);
        }

        if (categoriaId is not null)
        {
            query = query.Where(t => t.CategoriaId == categoriaId);
        }

        if (data is not null)
        {
            query = query.Where(t => t.Data == data);
        }

        if (dataInicio is not null)
        {
            query = query.Where(t => t.Data >= dataInicio);
        }

        if (dataFim is not null)
        {
            query = query.Where(t => t.Data <= dataFim);
        }

        var total = await query.CountAsync();
        var totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)pageSize));

        var items = await query
            .OrderByDescending(t => t.Data)
            .ThenByDescending(t => t.Id)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
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

        return new PagedResponse<TransacaoDto>
        {
            Data = items,
            Total = total,
            Page = page,
            PageSize = pageSize,
            TotalPages = totalPages
        };
    }

    public async Task<TransacaoDto?> GetByIdAsync(int id, int usuarioId)
    {
        var t = await context.Transacoes
            .Include(t => t.Conta)
            .Include(t => t.Categoria)
            .FirstOrDefaultAsync(t => t.Id == id && t.Conta != null && t.Conta.UsuarioId == usuarioId);

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

    public async Task<(TransacaoDto? Dto, string? Error)> CreateAsync(CreateTransacaoDto dto, int usuarioId)
    {
        var contaExiste = await context.Contas
            .AnyAsync(c => c.Id == dto.ContaId && c.UsuarioId == usuarioId);
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

    public async Task<(bool Found, string? Error)> UpdateAsync(int id, UpdateTransacaoDto dto, int usuarioId)
    {
        var transacao = await context.Transacoes
            .Include(t => t.Conta)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (transacao is null) return (false, null);

        if (transacao.Conta?.UsuarioId != usuarioId)
        {
            return (false, "Transação não encontrada.");
        }

        var contaExiste = await context.Contas
            .AnyAsync(c => c.Id == dto.ContaId && c.UsuarioId == usuarioId);
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

    public async Task<bool> DeleteAsync(int id, int usuarioId)
    {
        var transacao = await context.Transacoes
            .Include(t => t.Conta)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (transacao is null || transacao.Conta?.UsuarioId != usuarioId) return false;

        context.Transacoes.Remove(transacao);
        await context.SaveChangesAsync();
        return true;
    }

    public async Task<List<DetalhamentoCategoriaDto>> GetDetalhamentoAsync(int? contaId, DateOnly dataInicio, DateOnly dataFim, int usuarioId)
    {
        var query = context.Transacoes
            .Where(t => t.Conta != null && t.Conta.UsuarioId == usuarioId)
            .Where(t => t.Data >= dataInicio && t.Data <= dataFim);

        if (contaId is not null)
        {
            query = query.Where(t => t.ContaId == contaId);
        }

        var grouped = await query
            .GroupBy(t => t.CategoriaId)
            .Select(g => new
            {
                CategoriaId = g.Key,
                Total = g.Sum(t => t.Tipo == TipoTransacao.Entrada ? t.Valor : -t.Valor)
            })
            .ToListAsync();

        var categorias = new Dictionary<int, (string Nome, string Cor)>();
        var idsComCategoria = grouped
            .Where(g => g.CategoriaId.HasValue)
            .Select(g => g.CategoriaId!.Value)
            .Distinct()
            .ToList();

        if (idsComCategoria.Count != 0)
        {
            categorias = await context.Categorias
                .Where(c => idsComCategoria.Contains(c.Id))
                .ToDictionaryAsync(c => c.Id, c => (c.Nome, c.Cor));
        }

        return grouped
            .Select(g => new DetalhamentoCategoriaDto
            {
                CategoriaId = g.CategoriaId,
                CategoriaNome = g.CategoriaId.HasValue && categorias.TryGetValue(g.CategoriaId.Value, out var cat) ? cat.Nome : "Sem Categoria",
                CategoriaCor = g.CategoriaId.HasValue && categorias.TryGetValue(g.CategoriaId.Value, out var cat2) ? cat2.Cor : "#747874",
                Total = g.Total
            })
            .OrderByDescending(d => Math.Abs(d.Total))
            .ToList();
    }

    public async Task<object> GetResumoPeriodoAsync(int? contaId, DateOnly dataInicio, DateOnly dataFim, int usuarioId)
    {
        var query = context.Transacoes
            .Where(t => t.Conta != null && t.Conta.UsuarioId == usuarioId)
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

    public async Task<byte[]> ExportarCsvAsync(int? contaId, string periodo, int usuarioId)
    {
        var query = context.Transacoes
            .Where(t => t.Conta != null && t.Conta.UsuarioId == usuarioId)
            .AsQueryable();

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