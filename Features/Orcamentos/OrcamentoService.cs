using FinSync.Data;
using FinSync.Enums;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Features.Orcamentos;

public class OrcamentoService(FinSyncDbContext context) : IOrcamentoService
{
    public async Task<List<OrcamentoDto>> GetAllAsync(int usuarioId)
    {
        return await context.Orcamentos
            .Where(o => o.UsuarioId == usuarioId)
            .Select(o => new OrcamentoDto
            {
                Id = o.Id,
                CategoriaId = o.CategoriaId,
                ValorLimite = o.ValorLimite,
                Mes = o.Mes,
                Ano = o.Ano
            })
            .ToListAsync();
    }

    public async Task<OrcamentoDto?> GetByIdAsync(int id, int usuarioId)
    {
        var orcamento = await context.Orcamentos
            .FirstOrDefaultAsync(o => o.Id == id && o.UsuarioId == usuarioId);

        if (orcamento is null) return null;

        return new OrcamentoDto
        {
            Id = orcamento.Id,
            CategoriaId = orcamento.CategoriaId,
            ValorLimite = orcamento.ValorLimite,
            Mes = orcamento.Mes,
            Ano = orcamento.Ano
        };
    }

    public async Task<(OrcamentoDto? Dto, string? Error)> CreateAsync(CreateOrcamentoDto dto, int usuarioId)
    {
        var existing = await context.Orcamentos
            .AnyAsync(o => o.UsuarioId == usuarioId && o.CategoriaId == dto.CategoriaId && o.Mes == dto.Mes && o.Ano == dto.Ano);
        
        if (existing) return (null, "Orçamento para esta categoria neste mês/ano já existe.");

        var orcamento = new Orcamento
        {
            CategoriaId = dto.CategoriaId,
            ValorLimite = dto.ValorLimite,
            Mes = dto.Mes,
            Ano = dto.Ano,
            UsuarioId = usuarioId
        };

        context.Orcamentos.Add(orcamento);
        await context.SaveChangesAsync();

        return (new OrcamentoDto
        {
            Id = orcamento.Id,
            CategoriaId = orcamento.CategoriaId,
            ValorLimite = orcamento.ValorLimite,
            Mes = orcamento.Mes,
            Ano = orcamento.Ano
        }, null);
    }

    public async Task<(bool Found, string? Error)> UpdateAsync(int id, UpdateOrcamentoDto dto, int usuarioId)
    {
        var orcamento = await context.Orcamentos
            .FirstOrDefaultAsync(o => o.Id == id && o.UsuarioId == usuarioId);
        
        if (orcamento is null) return (false, null);

        orcamento.ValorLimite = dto.ValorLimite;
        await context.SaveChangesAsync();

        return (true, null);
    }

    public async Task<bool> DeleteAsync(int id, int usuarioId)
    {
        var orcamento = await context.Orcamentos
            .FirstOrDefaultAsync(o => o.Id == id && o.UsuarioId == usuarioId);
        
        if (orcamento is null) return false;

        context.Orcamentos.Remove(orcamento);
        await context.SaveChangesAsync();
        
        return true;
    }

    public async Task<List<StatusOrcamentoDto>> ObterResumoOrcamentosAsync(int usuarioId, int mes, int ano)
    {
        var orcamentos = await context.Orcamentos
            .Where(o => o.UsuarioId == usuarioId && o.Mes == mes && o.Ano == ano)
            .ToListAsync();

        if (orcamentos.Count == 0) return [];

        var categoriaIds = orcamentos.Select(o => o.CategoriaId).ToHashSet();

        var gastosPorCategoria = await context.Transacoes
            .Where(t => t.Conta!.UsuarioId == usuarioId 
                     && t.Data.Month == mes 
                     && t.Data.Year == ano 
                     && t.Tipo == TipoTransacao.Saida
                     && t.CategoriaId != null
                     && categoriaIds.Contains(t.CategoriaId.Value))
            .GroupBy(t => t.CategoriaId)
            .Select(g => new { CategoriaId = g.Key, TotalGasto = g.Sum(t => t.Valor) })
            .ToDictionaryAsync(x => x.CategoriaId!.Value, x => x.TotalGasto);

        var resultado = orcamentos.Select(o => new StatusOrcamentoDto
        {
            Id = o.Id,
            CategoriaId = o.CategoriaId,
            ValorLimite = o.ValorLimite,
            Mes = o.Mes,
            Ano = o.Ano,
            TotalGasto = gastosPorCategoria.GetValueOrDefault(o.CategoriaId, 0)
        }).ToList();

        return resultado;
    }
}
