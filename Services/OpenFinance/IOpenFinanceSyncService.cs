namespace FinSync.Services.OpenFinance;

/// <summary>
/// Orquestra a conciliação idempotente de extratos de Open Finance com as
/// transações locais do FinSync.
/// </summary>
public interface IOpenFinanceSyncService
{
    /// <summary>
    /// Sincroniza uma única conta conectada, importando apenas lançamentos ainda
    /// não conciliados e atualizando o status/saldo da conta.
    /// </summary>
    Task<ResumoSincronizacaoDto> SincronizarContaAsync(int contaId, int usuarioId);

    /// <summary>
    /// Sincroniza todas as contas ativas com Open Finance do usuário,
    /// consolidando os resultados em um relatório.
    /// </summary>
    Task<RelatorioSincronizacaoDto> SincronizarTodasAsync(int usuarioId);
}
