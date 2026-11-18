namespace FinSync.Services.OpenFinance;

/// <summary>
/// Contrato de um provedor de Open Finance. Implementações concretas normalizam
/// os dados das instituições financeiras para os DTOs do FinSync.
/// </summary>
public interface IOpenFinanceProvider
{
    /// <summary>Lista as instituições bancárias disponíveis para conexão.</summary>
    Task<List<InstituicaoBancariaDto>> ListarInstituicoesAsync();

    /// <summary>Conecta uma conta do usuário a uma instituição e devolve o item externo.</summary>
    Task<OpenFinanceConnectResult> ConectarAsync(ConectarInstituicaoRequest request, int usuarioId);

    /// <summary>Obtém o extrato normalizado de um item externo a partir de uma data.</summary>
    Task<ExtratoBancarioResult> ObterExtratoAsync(string externalItemId, DateTime desde);

    /// <summary>Obtém o saldo atual de um item externo.</summary>
    Task<decimal> ObterSaldoAtualAsync(string externalItemId);
}
