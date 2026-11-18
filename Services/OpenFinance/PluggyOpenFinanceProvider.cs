namespace FinSync.Services.OpenFinance;

/// <summary>
/// Provedor de Open Finance voltado à integração real com o Pluggy (e provedores
/// compatíveis Belvo/Klavi). Atualmente é um STUB seguro para produção: valida as
/// credenciais e falha de forma explícita, sem efetuar qualquer chamada de rede.
/// </summary>
public sealed class PluggyOpenFinanceProvider(
    IHttpClientFactory httpClientFactory,
    IConfiguration configuration,
    ILogger<PluggyOpenFinanceProvider> logger) : IOpenFinanceProvider
{
    private const string DefaultBaseUrl = "https://api.pluggy.ai";

    public Task<List<InstituicaoBancariaDto>> ListarInstituicoesAsync()
    {
        ObterCliente();
        // TODO: chamada HTTP real — GET {BaseUrl}/connectors com autenticação via ApiKey/ClientId.
        throw IntegracaoNaoImplementada();
    }

    public Task<OpenFinanceConnectResult> ConectarAsync(ConectarInstituicaoRequest request, int usuarioId)
    {
        ObterCliente();
        // TODO: chamada HTTP real — POST {BaseUrl}/connect/token e criação do item externo.
        throw IntegracaoNaoImplementada();
    }

    public Task<ExtratoBancarioResult> ObterExtratoAsync(string externalItemId, DateTime desde)
    {
        ObterCliente();
        // TODO: chamada HTTP real — GET {BaseUrl}/accounts/{id}/transactions com paginação e normalização para TransacaoBancariaDto.
        throw IntegracaoNaoImplementada();
    }

    public Task<decimal> ObterSaldoAtualAsync(string externalItemId)
    {
        ObterCliente();
        // TODO: chamada HTTP real — GET {BaseUrl}/accounts/{id}/balance e normalização do saldo.
        throw IntegracaoNaoImplementada();
    }

    /// <summary>
    /// Cria o client nomeado e valida as credenciais antes de qualquer uso.
    /// </summary>
    private HttpClient ObterCliente()
    {
        var client = httpClientFactory.CreateClient("PluggyClient");

        var baseUrl = configuration["OpenFinance:BaseUrl"] ?? DefaultBaseUrl;
        if (Uri.TryCreate(baseUrl, UriKind.Absolute, out var baseUri))
        {
            client.BaseAddress = baseUri;
        }

        var apiKey = configuration["OpenFinance:ApiKey"];
        var clientId = configuration["OpenFinance:ClientId"];

        var credenciaisInvalidas =
            string.IsNullOrWhiteSpace(apiKey) ||
            string.IsNullOrWhiteSpace(clientId) ||
            apiKey.Contains("PLACEHOLDER", StringComparison.OrdinalIgnoreCase) ||
            clientId.Contains("PLACEHOLDER", StringComparison.OrdinalIgnoreCase);

        if (credenciaisInvalidas)
        {
            logger.LogWarning(
                "Credenciais do provedor de Open Finance ausentes ou inválidas. " +
                "Defina 'OpenFinance:ApiKey' e 'OpenFinance:ClientId' com valores reais ou mantenha 'OpenFinance:Provider' como 'MockSandbox'.");

            throw new InvalidOperationException(
                "Credenciais do provedor de Open Finance não configuradas. " +
                "Defina 'OpenFinance:ApiKey' e 'OpenFinance:ClientId' com valores válidos ou mantenha 'OpenFinance:Provider' como 'MockSandbox'.");
        }

        return client;
    }

    private static NotSupportedException IntegracaoNaoImplementada() =>
        new("A integração real com o Pluggy ainda não foi implementada. " +
            "Mantenha 'OpenFinance:Provider' configurado como 'MockSandbox' até que a credencial de acesso seja disponibilizada.");
}
