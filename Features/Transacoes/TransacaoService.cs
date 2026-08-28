using FinSync.Data;
using FinSync.Enums;
using FinSync.Features.Categorias;
using FinSync.Features.Contas;
using FinSync.Features.Recorrencias;
using FinSync.Helpers;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Features.Transacoes;

public class TransacaoService(FinSyncDbContext context) : ITransacaoService
{
    public async Task<PagedResponse<TransacaoDto>> GetAllAsync(
        int usuarioId,
        int? contaId,
        DateOnly? data = null,
        DateOnly? dataInicio = null,
        DateOnly? dataFim = null,
        int? categoriaId = null,
        StatusTransacao? status = null,
        int page = 1,
        int pageSize = 20)
    {
        var query = context.Transacoes
            .Include(t => t.Conta)
            .Include(t => t.Categoria)
            .Include(t => t.Recorrencia)
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

        if (status is not null)
        {
            query = query.Where(t => t.Status == status);
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
                Status = t.Status,
                Data = t.Data,
                ContaId = t.ContaId,
                ContaNome = t.Conta != null ? t.Conta.Nome : string.Empty,
                CategoriaId = t.CategoriaId,
                CategoriaNome = t.Categoria != null ? t.Categoria.Nome : string.Empty,
                CategoriaCor = t.Categoria != null ? t.Categoria.Cor : string.Empty,
                ParcelamentoId = t.ParcelamentoId,
                NumeroParcela = t.NumeroParcela,
                TotalParcelas = t.TotalParcelas,
                RecorrenciaId = t.RecorrenciaId,
                FrequenciaRecorrencia = t.Recorrencia != null ? t.Recorrencia.Frequencia : null
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
            .Include(t => t.Recorrencia)
            .FirstOrDefaultAsync(t => t.Id == id && t.Conta != null && t.Conta.UsuarioId == usuarioId);

        if (t is null) return null;

        return new TransacaoDto
        {
            Id = t.Id,
            Descricao = t.Descricao,
            Valor = t.Valor,
            Tipo = t.Tipo,
            Status = t.Status,
            Data = t.Data,
            ContaId = t.ContaId,
            ContaNome = t.Conta?.Nome ?? string.Empty,
            CategoriaId = t.CategoriaId,
            CategoriaNome = t.Categoria?.Nome ?? string.Empty,
            CategoriaCor = t.Categoria?.Cor ?? string.Empty,
            ParcelamentoId = t.ParcelamentoId,
            NumeroParcela = t.NumeroParcela,
            TotalParcelas = t.TotalParcelas,
            RecorrenciaId = t.RecorrenciaId,
            FrequenciaRecorrencia = t.Recorrencia?.Frequencia
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

        if (dto.CategoriaId is not null)
        {
            var categoriaExiste = await context.Categorias
                .AnyAsync(c => c.Id == dto.CategoriaId && c.UsuarioId == usuarioId);
            if (!categoriaExiste)
            {
                return (null, $"A categoria com id {dto.CategoriaId} nao existe.");
            }
        }

        // 1. Cenário: Lançamento Parcelado
        if (dto.Parcelado && dto.TotalParcelas.HasValue && dto.TotalParcelas.Value >= 2)
        {
            var totalParcelas = dto.TotalParcelas.Value;
            var parcelamentoId = Guid.NewGuid();
            var modoParcela = string.Equals(dto.ModoValorParcelamento, "Parcela", StringComparison.OrdinalIgnoreCase);

            decimal valorPrimeiraParcela;
            decimal valorDemaisParcelas;

            if (modoParcela)
            {
                valorPrimeiraParcela = dto.Valor;
                valorDemaisParcelas = dto.Valor;
            }
            else
            {
                var valorBase = Math.Floor((dto.Valor / totalParcelas) * 100m) / 100m;
                var resto = dto.Valor - (valorBase * totalParcelas);
                valorPrimeiraParcela = valorBase + resto;
                valorDemaisParcelas = valorBase;
            }

            var listaParcelas = new List<Transacao>();
            var diaBase = dto.Data.Day;

            for (int i = 1; i <= totalParcelas; i++)
            {
                var valorParcela = (i == 1) ? valorPrimeiraParcela : valorDemaisParcelas;
                var dataParcela = AddMesSeguro(dto.Data, i - 1, diaBase);
                var statusParcela = (i == 1) ? dto.Status : StatusTransacao.Pendente;

                var transacaoParcelada = new Transacao
                {
                    Descricao = $"{dto.Descricao.Trim()} ({i:D2}/{totalParcelas:D2})",
                    Valor = valorParcela,
                    Tipo = dto.Tipo,
                    Status = statusParcela,
                    Data = dataParcela,
                    ContaId = dto.ContaId,
                    CategoriaId = dto.CategoriaId,
                    ParcelamentoId = parcelamentoId,
                    NumeroParcela = i,
                    TotalParcelas = totalParcelas
                };

                listaParcelas.Add(transacaoParcelada);
            }

            context.Transacoes.AddRange(listaParcelas);
            await context.SaveChangesAsync();

            var primeira = listaParcelas.First();
            await context.Entry(primeira).Reference(t => t.Conta).LoadAsync();
            await context.Entry(primeira).Reference(t => t.Categoria).LoadAsync();

            return (new TransacaoDto
            {
                Id = primeira.Id,
                Descricao = primeira.Descricao,
                Valor = primeira.Valor,
                Tipo = primeira.Tipo,
                Status = primeira.Status,
                Data = primeira.Data,
                ContaId = primeira.ContaId,
                ContaNome = primeira.Conta?.Nome ?? string.Empty,
                CategoriaId = primeira.CategoriaId,
                CategoriaNome = primeira.Categoria?.Nome ?? string.Empty,
                CategoriaCor = primeira.Categoria?.Cor ?? string.Empty,
                ParcelamentoId = primeira.ParcelamentoId,
                NumeroParcela = primeira.NumeroParcela,
                TotalParcelas = primeira.TotalParcelas
            }, null);
        }

        // 2. Cenário: Tornar Recorrente
        if (dto.TornarRecorrente)
        {
            var frequencia = dto.FrequenciaRecorrencia ?? FrequenciaRecorrencia.Mensal;
            var recorrencia = new Recorrencia
            {
                Descricao = dto.Descricao.Trim(),
                Valor = dto.Valor,
                Tipo = dto.Tipo,
                Frequencia = frequencia,
                DataInicio = dto.Data,
                DataFim = dto.DataFimRecorrencia,
                StatusPadrao = dto.Status,
                Ativo = true,
                ContaId = dto.ContaId,
                CategoriaId = dto.CategoriaId,
                UsuarioId = usuarioId
            };

            context.Recorrencias.Add(recorrencia);
            await context.SaveChangesAsync();

            // Gerar projeções de 12 meses
            var hoje = DateOnly.FromDateTime(DateTime.UtcNow);
            var limiteProjecao = hoje.AddMonths(12);
            if (recorrencia.DataFim.HasValue && recorrencia.DataFim.Value < limiteProjecao)
            {
                limiteProjecao = recorrencia.DataFim.Value;
            }

            var listaRecorrentes = new List<Transacao>();
            var dataAtual = recorrencia.DataInicio;
            var diaBase = recorrencia.DataInicio.Day;

            while (dataAtual <= limiteProjecao)
            {
                var status = (dataAtual == recorrencia.DataInicio) ? dto.Status : StatusTransacao.Pendente;
                listaRecorrentes.Add(new Transacao
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

                dataAtual = RecorrenciaService.CalcularProximaData(dataAtual, recorrencia.Frequencia, diaBase);
            }

            if (listaRecorrentes.Count > 0)
            {
                context.Transacoes.AddRange(listaRecorrentes);
                recorrencia.UltimaDataGerada = listaRecorrentes.Max(t => t.Data);
                await context.SaveChangesAsync();
            }

            var primeira = listaRecorrentes.First();
            await context.Entry(primeira).Reference(t => t.Conta).LoadAsync();
            await context.Entry(primeira).Reference(t => t.Categoria).LoadAsync();

            return (new TransacaoDto
            {
                Id = primeira.Id,
                Descricao = primeira.Descricao,
                Valor = primeira.Valor,
                Tipo = primeira.Tipo,
                Status = primeira.Status,
                Data = primeira.Data,
                ContaId = primeira.ContaId,
                ContaNome = primeira.Conta?.Nome ?? string.Empty,
                CategoriaId = primeira.CategoriaId,
                CategoriaNome = primeira.Categoria?.Nome ?? string.Empty,
                CategoriaCor = primeira.Categoria?.Cor ?? string.Empty,
                RecorrenciaId = recorrencia.Id,
                FrequenciaRecorrencia = recorrencia.Frequencia
            }, null);
        }

        // 3. Cenário Padrão: Lançamento Único
        var transacao = new Transacao
        {
            Descricao = dto.Descricao.Trim(),
            Valor = dto.Valor,
            Tipo = dto.Tipo,
            Status = dto.Status,
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
            Status = transacao.Status,
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

        if (dto.CategoriaId is not null)
        {
            var categoriaExiste = await context.Categorias
                .AnyAsync(c => c.Id == dto.CategoriaId && c.UsuarioId == usuarioId);
            if (!categoriaExiste)
            {
                return (true, $"A categoria com id {dto.CategoriaId} nao existe.");
            }
        }

        transacao.Descricao = dto.Descricao.Trim();
        transacao.Valor = dto.Valor;
        transacao.Tipo = dto.Tipo;
        transacao.Status = dto.Status;
        transacao.Data = dto.Data;
        transacao.ContaId = dto.ContaId;
        transacao.CategoriaId = dto.CategoriaId;

        await context.SaveChangesAsync();
        return (true, null);
    }

    public async Task<(bool Found, string? Error)> UpdateStatusAsync(int id, StatusTransacao status, int usuarioId)
    {
        var transacao = await context.Transacoes
            .Include(t => t.Conta)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (transacao is null) return (false, null);

        if (transacao.Conta?.UsuarioId != usuarioId)
        {
            return (false, "Transação não encontrada.");
        }

        transacao.Status = status;
        await context.SaveChangesAsync();
        return (true, null);
    }

    public async Task<bool> DeleteAsync(int id, int usuarioId, bool excluirTodasParcelas = false, bool excluirFuturasRecorrencias = false)
    {
        var transacao = await context.Transacoes
            .Include(t => t.Conta)
            .FirstOrDefaultAsync(t => t.Id == id);
        if (transacao is null || transacao.Conta?.UsuarioId != usuarioId) return false;

        if (excluirTodasParcelas && transacao.ParcelamentoId.HasValue)
        {
            var lote = await context.Transacoes
                .Where(t => t.ParcelamentoId == transacao.ParcelamentoId && t.Conta != null && t.Conta.UsuarioId == usuarioId)
                .ToListAsync();

            context.Transacoes.RemoveRange(lote);
        }
        else if (excluirFuturasRecorrencias && transacao.RecorrenciaId.HasValue)
        {
            var futuras = await context.Transacoes
                .Where(t => t.RecorrenciaId == transacao.RecorrenciaId && t.Data >= transacao.Data && t.Conta != null && t.Conta.UsuarioId == usuarioId)
                .ToListAsync();

            context.Transacoes.RemoveRange(futuras);
        }
        else
        {
            context.Transacoes.Remove(transacao);
        }

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
        sb.AppendLine("Id,Descricao,Valor,Tipo,Status,Data,ContaId");

        foreach (var t in transacoes)
        {
            var descricao = t.Descricao.Replace("\"", "\"\"");
            sb.AppendLine($"{t.Id},\"{descricao}\",{t.Valor.ToString(System.Globalization.CultureInfo.InvariantCulture)},{t.Tipo},{t.Status},{t.Data:yyyy-MM-dd},{t.ContaId}");
        }

        var utf8Bom = new byte[] { 0xEF, 0xBB, 0xBF };
        var contentBytes = System.Text.Encoding.UTF8.GetBytes(sb.ToString());
        var result = new byte[utf8Bom.Length + contentBytes.Length];
        Buffer.BlockCopy(utf8Bom, 0, result, 0, utf8Bom.Length);
        Buffer.BlockCopy(contentBytes, 0, result, utf8Bom.Length, contentBytes.Length);

        return result;
    }

    private static DateOnly AddMesSeguro(DateOnly data, int meses, int diaBase)
    {
        var proximoAnoMes = data.AddMonths(meses);
        var diasNoMes = DateTime.DaysInMonth(proximoAnoMes.Year, proximoAnoMes.Month);
        var dia = Math.Min(diaBase, diasNoMes);
        return new DateOnly(proximoAnoMes.Year, proximoAnoMes.Month, dia);
    }
}