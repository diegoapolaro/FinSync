using System.Diagnostics;
using FinSync.Data;
using FinSync.Enums;
using FinSync.Features.Transacoes;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Services.OpenFinance;

/// <summary>
/// Implementação padrão de <see cref="IOpenFinanceSyncService"/>. A conciliação é
/// idempotente: um <c>ExternalTransactionId</c> já importado nunca é inserido
/// novamente, mesmo que o provedor o devolva em respostas futuras.
/// </summary>
public class OpenFinanceSyncService(
    FinSyncDbContext context,
    IOpenFinanceProvider provider,
    ILogger<OpenFinanceSyncService> logger) : IOpenFinanceSyncService
{
    public async Task<ResumoSincronizacaoDto> SincronizarContaAsync(int contaId, int usuarioId)
    {
        var conta = await context.Contas
            .FirstOrDefaultAsync(c => c.Id == contaId && c.UsuarioId == usuarioId);

        if (conta is null)
        {
            return new ResumoSincronizacaoDto
            {
                ContaId = contaId,
                Sucesso = false,
                MensagemErro = "Conta não encontrada.",
                SincronizadoEm = DateTime.UtcNow
            };
        }

        if (conta.Provedor == ProvedorOpenFinance.Manual || string.IsNullOrWhiteSpace(conta.ExternalItemId))
        {
            return new ResumoSincronizacaoDto
            {
                ContaId = conta.Id,
                ContaNome = conta.Nome,
                Sucesso = false,
                MensagemErro = "A conta não possui uma integração de Open Finance configurada ou o identificador externo está ausente.",
                SincronizadoEm = DateTime.UtcNow
            };
        }

        conta.StatusSincronizacao = StatusSincronizacao.Sincronizando;
        conta.MensagemErroSincronizacao = null;
        await context.SaveChangesAsync();

        var stopwatch = Stopwatch.StartNew();
        var novasTransacoes = new List<Transacao>();

        try
        {
            var desde = conta.UltimaSincronizacaoEm?.AddDays(-7) ?? DateTime.UtcNow.AddDays(-90);
            var extrato = await provider.ObterExtratoAsync(conta.ExternalItemId!, desde);
            var transacoesExtrato = extrato?.Transacoes ?? [];

            // Conjunto de IDs já persistidos para esta conta — evita reinserção em sincronizações seguintes.
            var idsExistentes = (await context.Transacoes
                    .AsNoTracking()
                    .Where(t => t.ContaId == conta.Id && t.ExternalTransactionId != null)
                    .Select(t => t.ExternalTransactionId!)
                    .ToListAsync())
                .ToHashSet(StringComparer.Ordinal);

            var idsVistosNoExtrato = new HashSet<string>(StringComparer.Ordinal);
            var duplicadasIgnoradas = 0;

            foreach (var t in transacoesExtrato)
            {
                if (string.IsNullOrWhiteSpace(t.ExternalTransactionId) || t.Valor <= 0)
                    continue;

                var externalId = Truncar(t.ExternalTransactionId, 150);

                // Deduplica IDs repetidos dentro da própria resposta do provedor.
                if (!idsVistosNoExtrato.Add(externalId))
                {
                    duplicadasIgnoradas++;
                    continue;
                }

                // Ignora lançamentos já conciliados em execuções anteriores.
                if (idsExistentes.Contains(externalId))
                {
                    duplicadasIgnoradas++;
                    continue;
                }

                novasTransacoes.Add(new Transacao
                {
                    Descricao = Truncar(t.Descricao, 120),
                    Valor = t.Valor,
                    Tipo = t.Tipo,
                    Status = StatusTransacao.Pago,
                    Data = t.Data,
                    ContaId = conta.Id,
                    CategoriaId = null,
                    ExternalTransactionId = externalId
                });
            }

            // Busca o saldo ANTES de confirmar a importação: se falhar, nada é commitado
            // e a conta não é marcada como Falha após uma importação bem-sucedida.
            var saldoConsolidado = await provider.ObterSaldoAtualAsync(conta.ExternalItemId!);

            context.Transacoes.AddRange(novasTransacoes);
            conta.StatusSincronizacao = StatusSincronizacao.Sincronizado;
            conta.UltimaSincronizacaoEm = DateTime.UtcNow;
            conta.MensagemErroSincronizacao = null;
            await context.SaveChangesAsync();
            stopwatch.Stop();

            return new ResumoSincronizacaoDto
            {
                ContaId = conta.Id,
                ContaNome = conta.Nome,
                Sucesso = true,
                NovasTransacoes = novasTransacoes.Count,
                TransacoesDuplicadasIgnoradas = duplicadasIgnoradas,
                SaldoConsolidado = saldoConsolidado,
                TempoRespostaMs = stopwatch.ElapsedMilliseconds,
                SincronizadoEm = DateTime.UtcNow
            };
        }
        catch (Exception ex)
        {
            logger.LogError(
                ex,
                "Erro ao sincronizar a conta {ContaId} ({ContaNome}) do usuário {UsuarioId}.",
                conta.Id,
                conta.Nome,
                usuarioId);

            // O EF Core não desfaz o change tracker após uma falha de SaveChanges.
            // Desanexa os lançamentos pendentes para que a persistência do erro não repita a falha.
            foreach (var transacao in novasTransacoes)
            {
                var entry = context.Entry(transacao);
                if (entry.State == EntityState.Added)
                {
                    entry.State = EntityState.Detached;
                }
            }

            conta.StatusSincronizacao = StatusSincronizacao.Falha;
            conta.MensagemErroSincronizacao = Truncar(ex.Message, 255);

            try
            {
                await context.SaveChangesAsync();
            }
            catch (Exception saveEx)
            {
                logger.LogError(saveEx, "Falha ao persistir o estado de erro da conta {ContaId}.", conta.Id);
            }

            return new ResumoSincronizacaoDto
            {
                ContaId = conta.Id,
                ContaNome = conta.Nome,
                Sucesso = false,
                MensagemErro = ex.Message,
                TempoRespostaMs = stopwatch.ElapsedMilliseconds,
                SincronizadoEm = DateTime.UtcNow
            };
        }
    }

    public async Task<RelatorioSincronizacaoDto> SincronizarTodasAsync(int usuarioId)
    {
        var stopwatch = Stopwatch.StartNew();

        var contas = await context.Contas
            .Where(c => !c.Arquivada
                && c.Provedor != ProvedorOpenFinance.Manual
                && c.ExternalItemId != null
                && c.ExternalItemId != ""
                && c.UsuarioId == usuarioId)
            .OrderBy(c => c.Nome)
            .ToListAsync();

        var resultados = new List<ResumoSincronizacaoDto>(contas.Count);

        foreach (var conta in contas)
        {
            ResumoSincronizacaoDto resultado;

            try
            {
                resultado = await SincronizarContaAsync(conta.Id, usuarioId);
            }
            catch (Exception ex)
            {
                // Defesa adicional: uma falha em uma conta não interrompe o lote.
                logger.LogError(
                    ex,
                    "Falha inesperada ao sincronizar a conta {ContaId} em lote (usuário {UsuarioId}).",
                    conta.Id,
                    usuarioId);

                resultado = new ResumoSincronizacaoDto
                {
                    ContaId = conta.Id,
                    ContaNome = conta.Nome,
                    Sucesso = false,
                    MensagemErro = ex.Message,
                    SincronizadoEm = DateTime.UtcNow
                };
            }

            resultados.Add(resultado);
        }

        stopwatch.Stop();

        return new RelatorioSincronizacaoDto
        {
            TotalContas = contas.Count,
            ContasSincronizadas = resultados.Count(r => r.Sucesso),
            ContasComFalha = resultados.Count(r => !r.Sucesso),
            TotalNovasTransacoes = resultados.Sum(r => r.NovasTransacoes),
            TempoTotalMs = stopwatch.ElapsedMilliseconds,
            Resultados = resultados,
            GeradoEm = DateTime.UtcNow
        };
    }

    private static string Truncar(string? valor, int tamanhoMaximo)
    {
        if (string.IsNullOrEmpty(valor) || valor.Length <= tamanhoMaximo)
            return valor ?? string.Empty;

        return valor[..tamanhoMaximo];
    }
}
