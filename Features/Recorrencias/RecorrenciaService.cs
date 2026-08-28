using FinSync.Data;
using FinSync.Enums;
using FinSync.Features.Transacoes;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Features.Recorrencias;

public class RecorrenciaService(FinSyncDbContext context) : IRecorrenciaService
{
    public async Task<List<RecorrenciaDto>> GetAllAsync(int usuarioId)
    {
        var recorrencias = await context.Recorrencias
            .Include(r => r.Conta)
            .Include(r => r.Categoria)
            .Include(r => r.Transacoes)
            .Where(r => r.UsuarioId == usuarioId)
            .OrderByDescending(r => r.Ativo)
            .ThenBy(r => r.Descricao)
            .ToListAsync();

        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);

        return recorrencias.Select(r =>
        {
            var proximoVencimento = r.Transacoes
                .Where(t => t.Data >= hoje)
                .OrderBy(t => t.Data)
                .Select(t => (DateOnly?)t.Data)
                .FirstOrDefault();

            return new RecorrenciaDto
            {
                Id = r.Id,
                Descricao = r.Descricao,
                Valor = r.Valor,
                Tipo = r.Tipo,
                Frequencia = r.Frequencia,
                DataInicio = r.DataInicio,
                DataFim = r.DataFim,
                StatusPadrao = r.StatusPadrao,
                Ativo = r.Ativo,
                ProximoVencimento = proximoVencimento ?? r.DataInicio,
                ContaId = r.ContaId,
                ContaNome = r.Conta?.Nome ?? string.Empty,
                CategoriaId = r.CategoriaId,
                CategoriaNome = r.Categoria?.Nome ?? string.Empty,
                CategoriaCor = r.Categoria?.Cor ?? string.Empty,
                TotalTransacoesGeradas = r.Transacoes.Count
            };
        }).ToList();
    }

    public async Task<ResumoRecorrenciasDto> GetResumoAsync(int usuarioId)
    {
        var recorrencias = await context.Recorrencias
            .Where(r => r.UsuarioId == usuarioId)
            .ToListAsync();

        decimal totalReceitasFixas = 0;
        decimal totalDespesasFixas = 0;
        int totalAtivas = 0;
        int totalPausadas = 0;

        foreach (var r in recorrencias)
        {
            if (r.Ativo)
            {
                totalAtivas++;
                // Normalizar valor para base mensal para métricas consistentes
                var valorMensal = r.Frequencia switch
                {
                    FrequenciaRecorrencia.Semanal => r.Valor * 4.33m,
                    FrequenciaRecorrencia.Quinzenal => r.Valor * 2m,
                    FrequenciaRecorrencia.Mensal => r.Valor,
                    FrequenciaRecorrencia.Anual => r.Valor / 12m,
                    _ => r.Valor
                };

                if (r.Tipo == TipoTransacao.Entrada)
                    totalReceitasFixas += valorMensal;
                else
                    totalDespesasFixas += valorMensal;
            }
            else
            {
                totalPausadas++;
            }
        }

        return new ResumoRecorrenciasDto
        {
            TotalReceitasFixas = Math.Round(totalReceitasFixas, 2),
            TotalDespesasFixas = Math.Round(totalDespesasFixas, 2),
            TotalAtivas = totalAtivas,
            TotalPausadas = totalPausadas
        };
    }

    public async Task<RecorrenciaDto?> GetByIdAsync(int id, int usuarioId)
    {
        var r = await context.Recorrencias
            .Include(r => r.Conta)
            .Include(r => r.Categoria)
            .Include(r => r.Transacoes)
            .FirstOrDefaultAsync(r => r.Id == id && r.UsuarioId == usuarioId);

        if (r is null) return null;

        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
        var proximoVencimento = r.Transacoes
            .Where(t => t.Data >= hoje)
            .OrderBy(t => t.Data)
            .Select(t => (DateOnly?)t.Data)
            .FirstOrDefault();

        return new RecorrenciaDto
        {
            Id = r.Id,
            Descricao = r.Descricao,
            Valor = r.Valor,
            Tipo = r.Tipo,
            Frequencia = r.Frequencia,
            DataInicio = r.DataInicio,
            DataFim = r.DataFim,
            StatusPadrao = r.StatusPadrao,
            Ativo = r.Ativo,
            ProximoVencimento = proximoVencimento ?? r.DataInicio,
            ContaId = r.ContaId,
            ContaNome = r.Conta?.Nome ?? string.Empty,
            CategoriaId = r.CategoriaId,
            CategoriaNome = r.Categoria?.Nome ?? string.Empty,
            CategoriaCor = r.Categoria?.Cor ?? string.Empty,
            TotalTransacoesGeradas = r.Transacoes.Count
        };
    }

    public async Task<(RecorrenciaDto? Dto, string? Error)> CreateAsync(CreateRecorrenciaDto dto, int usuarioId)
    {
        var contaExiste = await context.Contas
            .AnyAsync(c => c.Id == dto.ContaId && c.UsuarioId == usuarioId);
        if (!contaExiste)
            return (null, $"A conta com id {dto.ContaId} não existe.");

        if (dto.CategoriaId is not null)
        {
            var categoriaExiste = await context.Categorias
                .AnyAsync(c => c.Id == dto.CategoriaId && c.UsuarioId == usuarioId);
            if (!categoriaExiste)
                return (null, $"A categoria com id {dto.CategoriaId} não existe.");
        }

        var recorrencia = new Recorrencia
        {
            Descricao = dto.Descricao.Trim(),
            Valor = dto.Valor,
            Tipo = dto.Tipo,
            Frequencia = dto.Frequencia,
            DataInicio = dto.DataInicio,
            DataFim = dto.DataFim,
            StatusPadrao = dto.StatusPadrao,
            Ativo = true,
            ContaId = dto.ContaId,
            CategoriaId = dto.CategoriaId,
            UsuarioId = usuarioId
        };

        context.Recorrencias.Add(recorrencia);
        await context.SaveChangesAsync();

        // Gerar transações projetadas para a janela de 12 meses
        await GerarTransacoesProjetadasAsync(recorrencia);
        await context.SaveChangesAsync();

        await context.Entry(recorrencia).Reference(r => r.Conta).LoadAsync();
        await context.Entry(recorrencia).Reference(r => r.Categoria).LoadAsync();
        await context.Entry(recorrencia).Collection(r => r.Transacoes).LoadAsync();

        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
        var proximoVencimento = recorrencia.Transacoes
            .Where(t => t.Data >= hoje)
            .OrderBy(t => t.Data)
            .Select(t => (DateOnly?)t.Data)
            .FirstOrDefault();

        return (new RecorrenciaDto
        {
            Id = recorrencia.Id,
            Descricao = recorrencia.Descricao,
            Valor = recorrencia.Valor,
            Tipo = recorrencia.Tipo,
            Frequencia = recorrencia.Frequencia,
            DataInicio = recorrencia.DataInicio,
            DataFim = recorrencia.DataFim,
            StatusPadrao = recorrencia.StatusPadrao,
            Ativo = recorrencia.Ativo,
            ProximoVencimento = proximoVencimento ?? recorrencia.DataInicio,
            ContaId = recorrencia.ContaId,
            ContaNome = recorrencia.Conta?.Nome ?? string.Empty,
            CategoriaId = recorrencia.CategoriaId,
            CategoriaNome = recorrencia.Categoria?.Nome ?? string.Empty,
            CategoriaCor = recorrencia.Categoria?.Cor ?? string.Empty,
            TotalTransacoesGeradas = recorrencia.Transacoes.Count
        }, null);
    }

    public async Task<(bool Found, string? Error)> UpdateAsync(int id, UpdateRecorrenciaDto dto, int usuarioId)
    {
        var recorrencia = await context.Recorrencias
            .Include(r => r.Transacoes)
            .FirstOrDefaultAsync(r => r.Id == id && r.UsuarioId == usuarioId);

        if (recorrencia is null) return (false, "Recorrência não encontrada.");

        var contaExiste = await context.Contas
            .AnyAsync(c => c.Id == dto.ContaId && c.UsuarioId == usuarioId);
        if (!contaExiste)
            return (true, $"A conta com id {dto.ContaId} não existe.");

        if (dto.CategoriaId is not null)
        {
            var categoriaExiste = await context.Categorias
                .AnyAsync(c => c.Id == dto.CategoriaId && c.UsuarioId == usuarioId);
            if (!categoriaExiste)
                return (true, $"A categoria com id {dto.CategoriaId} não existe.");
        }

        recorrencia.Descricao = dto.Descricao.Trim();
        recorrencia.Valor = dto.Valor;
        recorrencia.Tipo = dto.Tipo;
        recorrencia.Frequencia = dto.Frequencia;
        recorrencia.DataInicio = dto.DataInicio;
        recorrencia.DataFim = dto.DataFim;
        recorrencia.StatusPadrao = dto.StatusPadrao;
        recorrencia.Ativo = dto.Ativo;
        recorrencia.ContaId = dto.ContaId;
        recorrencia.CategoriaId = dto.CategoriaId;

        if (dto.AtualizarTransacoesFuturas)
        {
            var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
            var transacoesFuturasPendentes = recorrencia.Transacoes
                .Where(t => t.Data >= hoje && t.Status == StatusTransacao.Pendente)
                .ToList();

            foreach (var t in transacoesFuturasPendentes)
            {
                t.Descricao = dto.Descricao.Trim();
                t.Valor = dto.Valor;
                t.Tipo = dto.Tipo;
                t.ContaId = dto.ContaId;
                t.CategoriaId = dto.CategoriaId;
            }
        }

        await context.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool Found, string? Error)> ToggleAtivoAsync(int id, int usuarioId)
    {
        var recorrencia = await context.Recorrencias
            .FirstOrDefaultAsync(r => r.Id == id && r.UsuarioId == usuarioId);

        if (recorrencia is null) return (false, "Recorrência não encontrada.");

        recorrencia.Ativo = !recorrencia.Ativo;
        await context.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool Found, string? Error)> DeleteAsync(int id, bool excluirTransacoesFuturas, int usuarioId)
    {
        var recorrencia = await context.Recorrencias
            .Include(r => r.Transacoes)
            .FirstOrDefaultAsync(r => r.Id == id && r.UsuarioId == usuarioId);

        if (recorrencia is null) return (false, "Recorrência não encontrada.");

        if (excluirTransacoesFuturas)
        {
            var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
            var transacoesFuturas = recorrencia.Transacoes
                .Where(t => t.Data >= hoje && t.Status == StatusTransacao.Pendente)
                .ToList();

            context.Transacoes.RemoveRange(transacoesFuturas);
        }

        context.Recorrencias.Remove(recorrencia);
        await context.SaveChangesAsync();
        return (true, null);
    }

    public async Task<int> ProcessarRecorrenciasAsync(int usuarioId)
    {
        var recorrencias = await context.Recorrencias
            .Include(r => r.Transacoes)
            .Where(r => r.UsuarioId == usuarioId && r.Ativo)
            .ToListAsync();

        var totalNovas = 0;
        foreach (var r in recorrencias)
        {
            totalNovas += await GerarTransacoesProjetadasAsync(r);
        }

        if (totalNovas > 0)
        {
            await context.SaveChangesAsync();
        }

        return totalNovas;
    }

    private async Task<int> GerarTransacoesProjetadasAsync(Recorrencia recorrencia)
    {
        var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
        var limiteProjecao = hoje.AddMonths(12);

        if (recorrencia.DataFim.HasValue && recorrencia.DataFim.Value < limiteProjecao)
        {
            limiteProjecao = recorrencia.DataFim.Value;
        }

        var datasExistentes = recorrencia.Transacoes
            .Select(t => t.Data)
            .ToHashSet();

        var dataAtual = recorrencia.DataInicio;
        var diaBase = recorrencia.DataInicio.Day;
        var novasTransacoes = new List<Transacao>();

        while (dataAtual <= limiteProjecao)
        {
            if (dataAtual >= recorrencia.DataInicio && !datasExistentes.Contains(dataAtual))
            {
                var status = (dataAtual <= hoje && novasTransacoes.Count == 0 && datasExistentes.Count == 0)
                    ? recorrencia.StatusPadrao
                    : StatusTransacao.Pendente;

                novasTransacoes.Add(new Transacao
                {
                    Descricao = recorrencia.Descricao,
                    Valor = recorrencia.Valor,
                    Tipo = recorrencia.Tipo,
                    Status = status,
                    Data = dataAtual,
                    ContaId = recorrencia.ContaId,
                    CategoriaId = recorrencia.CategoriaId,
                    RecorrenciaId = recorrencia.Id
                });
            }

            dataAtual = CalcularProximaData(dataAtual, recorrencia.Frequencia, diaBase);
        }

        if (novasTransacoes.Count > 0)
        {
            context.Transacoes.AddRange(novasTransacoes);
            recorrencia.UltimaDataGerada = novasTransacoes.Max(t => t.Data);
        }

        return await Task.FromResult(novasTransacoes.Count);
    }

    public static DateOnly CalcularProximaData(DateOnly data, FrequenciaRecorrencia frequencia, int diaBase)
    {
        return frequencia switch
        {
            FrequenciaRecorrencia.Semanal => data.AddDays(7),
            FrequenciaRecorrencia.Quinzenal => data.AddDays(14),
            FrequenciaRecorrencia.Mensal => AddMesSeguro(data, 1, diaBase),
            FrequenciaRecorrencia.Anual => AddAnoSeguro(data, 1, diaBase),
            _ => data.AddMonths(1)
        };
    }

    private static DateOnly AddMesSeguro(DateOnly data, int meses, int diaBase)
    {
        var proximoAnoMes = data.AddMonths(meses);
        var diasNoMes = DateTime.DaysInMonth(proximoAnoMes.Year, proximoAnoMes.Month);
        var dia = Math.Min(diaBase, diasNoMes);
        return new DateOnly(proximoAnoMes.Year, proximoAnoMes.Month, dia);
    }

    private static DateOnly AddAnoSeguro(DateOnly data, int anos, int diaBase)
    {
        var proximoAno = data.Year + anos;
        var diasNoMes = DateTime.DaysInMonth(proximoAno, data.Month);
        var dia = Math.Min(diaBase, diasNoMes);
        return new DateOnly(proximoAno, data.Month, dia);
    }
}
