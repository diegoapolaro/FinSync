using System.Globalization;
using System.Security.Cryptography;
using System.Text;
using FinSync.Enums;

namespace FinSync.Services.OpenFinance;

/// <summary>
/// Provedor de Open Finance simulado (sandbox). Todo o conteúdo é derivado de hashes
/// SHA256 estáveis, garantindo que o mesmo par (externalItemId, desde) produza
/// exatamente as mesmas transações, identificadores e saldos.
/// </summary>
public sealed class MockOpenFinanceProvider : IOpenFinanceProvider
{
    private const int MaxDiasJanela = 90;
    private const int MaxTransacoes = 60;
    private const string ProvedorMock = "MockSandbox";
    private const string MoedaPadrao = "BRL";

    /// <summary>Catálogo imutável das principais instituições brasileiras (código COMPE).</summary>
    private static readonly IReadOnlyList<InstituicaoBancariaDto> Catalogo =
    [
        new()
        {
            Codigo = "341",
            Nome = "Itaú",
            NomeOficial = "Itaú Unibanco S.A.",
            Cor = "#EC7000",
            LogoUrl = "https://cdn.finsync.com.br/instituicoes/341.png",
            Disponivel = true
        },
        new()
        {
            Codigo = "260",
            Nome = "Nubank",
            NomeOficial = "Nu Pagamentos S.A.",
            Cor = "#820AD1",
            LogoUrl = "https://cdn.finsync.com.br/instituicoes/260.png",
            Disponivel = true
        },
        new()
        {
            Codigo = "001",
            Nome = "Banco do Brasil",
            NomeOficial = "Banco do Brasil S.A.",
            Cor = "#FFCD00",
            LogoUrl = "https://cdn.finsync.com.br/instituicoes/001.png",
            Disponivel = true
        },
        new()
        {
            Codigo = "237",
            Nome = "Bradesco",
            NomeOficial = "Banco Bradesco S.A.",
            Cor = "#CC092F",
            LogoUrl = "https://cdn.finsync.com.br/instituicoes/237.png",
            Disponivel = true
        },
        new()
        {
            Codigo = "077",
            Nome = "Inter",
            NomeOficial = "Banco Inter S.A.",
            Cor = "#FF7A00",
            LogoUrl = "https://cdn.finsync.com.br/instituicoes/077.png",
            Disponivel = true
        },
        new()
        {
            Codigo = "033",
            Nome = "Santander",
            NomeOficial = "Banco Santander (Brasil) S.A.",
            Cor = "#EC0000",
            LogoUrl = "https://cdn.finsync.com.br/instituicoes/033.png",
            Disponivel = true
        },
        new()
        {
            Codigo = "104",
            Nome = "Caixa",
            NomeOficial = "Caixa Econômica Federal",
            Cor = "#005CA9",
            LogoUrl = "https://cdn.finsync.com.br/instituicoes/104.png",
            Disponivel = true
        },
        new()
        {
            Codigo = "208",
            Nome = "BTG Pactual",
            NomeOficial = "Banco BTG Pactual S.A.",
            Cor = "#0B3D91",
            LogoUrl = "https://cdn.finsync.com.br/instituicoes/208.png",
            Disponivel = true
        },
        new()
        {
            Codigo = "336",
            Nome = "C6 Bank",
            NomeOficial = "Banco C6 S.A.",
            Cor = "#1A1A1A",
            LogoUrl = "https://cdn.finsync.com.br/instituicoes/336.png",
            Disponivel = true
        }
    ];

    private static readonly string[] Pessoas =
    [
        "Maria Silva", "João Santos", "Ana Costa", "Carlos Oliveira", "Fernanda Lima",
        "Ricardo Almeida", "Juliana Pereira", "Marcos Souza", "Camila Rocha", "Pedro Henrique",
        "Lucas Ferreira", "Beatriz Martins", "Rafael Gomes", "Aline Barbosa", "Diego Nunes"
    ];

    private static readonly string[] Empresas =
    [
        "Acme Distribuidora", "Studio Criativo", "Tech Solutions LTDA", "Comércio Bom Preço",
        "Agência Horizonte", "Oficina do Bairro", "Farmácia Vida", "Padaria Pão Quente"
    ];

    private static readonly string[] ContasBoleto =
    [
        "Enel Distribuição", "Sabesp", "Vivo Fibra", "Condomínio Edifício Aurora",
        "IPTU Prefeitura", "CPFL Energia", "Bradesco Seguros"
    ];

    private static readonly string[] CategoriasBoleto =
    [
        "Moradia", "Moradia", "Serviços", "Moradia", "Impostos", "Moradia", "Serviços"
    ];

    private static readonly string[] Tarifas =
    [
        "Tarifa manutenção conta",
        "Tarifa transferência PIX",
        "Anuidade cartão de crédito"
    ];

    private static readonly decimal[] ValoresTarifa = [8.90m, 12.50m, 34.90m];

    private static readonly string[] Estabelecimentos =
    [
        "Supermercado Pão de Açúcar", "Posto Ipiranga", "Restaurante Sabor & Arte", "Uber",
        "iFood", "Magalu", "Farmácia Droga Raia", "Cinema Cinemark", "Amazon", "Livraria Cultura"
    ];

    private static readonly string[] CategoriasCompra =
    [
        "Alimentação", "Transporte", "Alimentação", "Transporte", "Alimentação",
        "Compras", "Saúde", "Lazer", "Compras", "Educação"
    ];

    /// <inheritdoc />
    public Task<List<InstituicaoBancariaDto>> ListarInstituicoesAsync()
    {
        // Lista nova com objetos novos: o catálogo estático nunca é exposto ao chamador.
        var copia = Catalogo
            .Select(i => new InstituicaoBancariaDto
            {
                Codigo = i.Codigo,
                Nome = i.Nome,
                NomeOficial = i.NomeOficial,
                Cor = i.Cor,
                LogoUrl = i.LogoUrl,
                Disponivel = i.Disponivel
            })
            .ToList();

        return Task.FromResult(copia);
    }

    /// <inheritdoc />
    public Task<OpenFinanceConnectResult> ConectarAsync(ConectarInstituicaoRequest request, int usuarioId)
    {
        var instituicao = request is null ? null : BuscarInstituicao(request.InstituicaoCodigo);

        if (instituicao is null)
        {
            return Task.FromResult(new OpenFinanceConnectResult
            {
                Sucesso = false,
                Mensagem = "Código de instituição inválido ou não informado.",
                Provedor = ProvedorMock
            });
        }

        var dadosConta = request is null
            ? string.Empty
            : Sanitizar(request.ChavePix ?? request.NumeroConta ?? request.NomeConta ?? request.Agencia, 40);
        var tipoConta = request?.TipoConta ?? TipoConta.Pessoal;
        var seed = $"{instituicao.Codigo}|{usuarioId}|{dadosConta}|{tipoConta}";
        var externalItemId = Truncar($"of_{instituicao.Codigo}_{usuarioId}_{dadosConta}_{HashHex(seed, 8)}", 120);

        return Task.FromResult(new OpenFinanceConnectResult
        {
            Sucesso = true,
            ExternalItemId = externalItemId,
            Instituicao = Copiar(instituicao),
            Mensagem = "Conexão estabelecida com sucesso no ambiente simulado.",
            Provedor = ProvedorMock
        });
    }

    /// <inheritdoc />
    public Task<ExtratoBancarioResult> ObterExtratoAsync(string externalItemId, DateTime desde)
    {
        var itemId = externalItemId ?? string.Empty;
        var instituicao = IdentificarInstituicao(itemId);
        var transacoes = GerarTransacoes(itemId, desde);

        var resultado = new ExtratoBancarioResult
        {
            ExternalItemId = itemId,
            InstituicaoCodigo = instituicao?.Codigo ?? string.Empty,
            InstituicaoNome = instituicao?.Nome ?? "Instituição simulada",
            SaldoAtual = CalcularSaldo(itemId),
            Moeda = MoedaPadrao,
            Transacoes = transacoes,
            GeradoEm = CalcularJanela(desde).Fim
        };

        return Task.FromResult(resultado);
    }

    /// <inheritdoc />
    public Task<decimal> ObterSaldoAtualAsync(string externalItemId)
    {
        return Task.FromResult(CalcularSaldo(externalItemId ?? string.Empty));
    }

    /// <summary>
    /// Saldo = saldo-base determinístico do item + líquido de todos os lançamentos
    /// gerados na janela completa de 90 dias. Usa exatamente a mesma rotina de
    /// geração do extrato, garantindo consistência entre os dois métodos.
    /// </summary>
    private static decimal CalcularSaldo(string itemId)
    {
        var saldoBase = 2000m + (HashToUInt($"saldo-base|{itemId}") % 1_000_000) / 100m;
        var transacoes = GerarTransacoes(itemId, DateTime.UtcNow.AddDays(-MaxDiasJanela));
        var liquido = transacoes.Sum(t => t.Tipo == TipoTransacao.Entrada ? t.Valor : -t.Valor);

        return Math.Round(saldoBase + liquido, 2, MidpointRounding.AwayFromZero);
    }

    /// <summary>Gera a lista determinística de lançamentos para a janela informada.</summary>
    private static List<TransacaoBancariaDto> GerarTransacoes(string itemId, DateTime desde)
    {
        var (inicio, fim) = CalcularJanela(desde);
        var transacoes = new List<TransacaoBancariaDto>();

        // Percorre do mais recente para o mais antigo para priorizar lançamentos recentes.
        for (var data = fim; data >= inicio && transacoes.Count < MaxTransacoes; data = data.AddDays(-1))
        {
            var dataIso = data.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
            var quantidade = 1 + (int)(HashToUInt($"{itemId}|{dataIso}|qtd") % 2);

            for (var indice = 0; indice < quantidade && transacoes.Count < MaxTransacoes; indice++)
            {
                transacoes.Add(GerarTransacao(itemId, data, indice));
            }
        }

        return transacoes
            .OrderBy(t => t.Data)
            .ThenBy(t => t.ExternalTransactionId, StringComparer.Ordinal)
            .ToList();
    }

    /// <summary>
    /// Cria um único lançamento cujos dados (descrição, valor, categoria, horário e ID)
    /// são todos derivados do seed SHA256: {itemId}|{data:yyyy-MM-dd}|{indice}.
    /// </summary>
    private static TransacaoBancariaDto GerarTransacao(string itemId, DateTime data, int indice)
    {
        var dataIso = data.ToString("yyyy-MM-dd", CultureInfo.InvariantCulture);
        var seed = $"{itemId}|{dataIso}|{indice}";
        var tipoCodigo = (int)(HashToUInt(seed + "|kind") % 7);

        var idxPessoa = (int)(HashToUInt(seed + "|pessoa") % (uint)Pessoas.Length);
        var idxEmpresa = (int)(HashToUInt(seed + "|empresa") % (uint)Empresas.Length);
        var idxBoleto = (int)(HashToUInt(seed + "|boleto") % (uint)ContasBoleto.Length);
        var idxTarifa = (int)(HashToUInt(seed + "|tarifa") % (uint)Tarifas.Length);
        var idxEstabelecimento = (int)(HashToUInt(seed + "|est") % (uint)Estabelecimentos.Length);

        string descricao;
        string categoria;
        decimal valor;
        var tipo = TipoTransacao.Saida;

        switch (tipoCodigo)
        {
            case 0: // PIX recebido
                descricao = $"PIX recebido de {Pessoas[idxPessoa]}";
                categoria = "Vendas";
                valor = ValorEntre(seed, 50m, 1500m);
                tipo = TipoTransacao.Entrada;
                break;

            case 1: // PIX enviado
                descricao = $"PIX enviado para {Pessoas[idxPessoa]}";
                categoria = "Transferências";
                valor = ValorEntre(seed, 20m, 800m);
                break;

            case 2: // Pagamento de boleto / conta de consumo
                descricao = $"Pagamento boleto - {ContasBoleto[idxBoleto]}";
                categoria = CategoriasBoleto[idxBoleto];
                valor = ValorEntre(seed, 80m, 900m);
                break;

            case 3: // Tarifa bancária com valor fixo realista
                descricao = Tarifas[idxTarifa];
                categoria = "Tarifas";
                valor = ValoresTarifa[idxTarifa];
                break;

            case 4: // Compra no cartão de débito ou crédito
                var meio = HashToUInt(seed + "|cartao") % 2 == 0 ? "débito" : "crédito";
                descricao = $"Compra cartão {meio} - {Estabelecimentos[idxEstabelecimento]}";
                categoria = CategoriasCompra[idxEstabelecimento];
                valor = ValorEntre(seed, 15m, 300m);
                break;

            case 5: // Pagamento a fornecedor
                descricao = $"Pagamento fornecedor - {Empresas[idxEmpresa]}";
                categoria = "Fornecedores";
                valor = ValorEntre(seed, 100m, 2000m);
                break;

            default: // Recebimento de cliente
                descricao = $"Pagamento recebido - {Empresas[idxEmpresa]}";
                categoria = "Vendas";
                valor = ValorEntre(seed, 200m, 3000m);
                tipo = TipoTransacao.Entrada;
                break;
        }

        var hora = 6 + (int)(HashToUInt(seed + "|hora") % 16);
        var minuto = (int)(HashToUInt(seed + "|minuto") % 60);
        var itemSanitizado = Sanitizar(itemId, 40);
        var externalTransactionId = Truncar(
            $"mock_{itemSanitizado}_{data.ToString("yyyyMMdd", CultureInfo.InvariantCulture)}_{indice}_{HashHex(seed, 8)}",
            150);

        return new TransacaoBancariaDto
        {
            ExternalTransactionId = externalTransactionId,
            Descricao = descricao,
            Valor = valor,
            Tipo = tipo,
            Data = DateOnly.FromDateTime(data),
            DataHora = new DateTime(data.Year, data.Month, data.Day, hora, minuto, 0, DateTimeKind.Utc),
            CategoriaSugerida = categoria,
            Moeda = MoedaPadrao
        };
    }

    /// <summary>Normaliza a janela: no máximo 90 dias, terminando sempre em hoje (UTC).</summary>
    private static (DateTime Inicio, DateTime Fim) CalcularJanela(DateTime desde)
    {
        var fim = DateTime.UtcNow.Date;
        var inicio = desde == default ? fim.AddDays(-MaxDiasJanela) : desde.Date;

        if (inicio > fim)
        {
            inicio = fim;
        }

        if ((fim - inicio).Days > MaxDiasJanela)
        {
            inicio = fim.AddDays(-MaxDiasJanela);
        }

        return (inicio, fim);
    }

    /// <summary>Valor decimal com duas casas, deterministicamente derivado do seed.</summary>
    private static decimal ValorEntre(string seed, decimal minimo, decimal maximo)
    {
        var amplitudeCentavos = (int)Math.Round((maximo - minimo) * 100m, 0, MidpointRounding.AwayFromZero);
        var offset = (decimal)(HashToUInt(seed + "|valor") % (uint)amplitudeCentavos) / 100m;

        return Math.Round(minimo + offset, 2, MidpointRounding.AwayFromZero);
    }

    /// <summary>Hash SHA256 estável, lido como uint big-endian.</summary>
    private static uint HashToUInt(string input)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        return (uint)((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]);
    }

    /// <summary>Hexadecimal minúsculo do SHA256, limitado ao tamanho solicitado.</summary>
    private static string HashHex(string input, int tamanho)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(input));
        var sb = new StringBuilder(tamanho);

        foreach (var b in bytes)
        {
            sb.Append(b.ToString("x2", CultureInfo.InvariantCulture));
            if (sb.Length >= tamanho)
            {
                break;
            }
        }

        return sb.ToString(0, Math.Min(tamanho, sb.Length));
    }

    /// <summary>Mantém apenas caracteres seguros para IDs, em minúsculas.</summary>
    private static string Sanitizar(string? valor, int tamanhoMaximo)
    {
        if (string.IsNullOrWhiteSpace(valor))
        {
            return string.Empty;
        }

        var sb = new StringBuilder(tamanhoMaximo);

        foreach (var c in valor.Trim())
        {
            if (char.IsLetterOrDigit(c) || c == '-' || c == '_')
            {
                sb.Append(char.ToLowerInvariant(c));
                if (sb.Length >= tamanhoMaximo)
                {
                    break;
                }
            }
        }

        return sb.ToString();
    }

    private static string Truncar(string valor, int tamanhoMaximo)
        => valor.Length <= tamanhoMaximo ? valor : valor[..tamanhoMaximo];

    private static InstituicaoBancariaDto? BuscarInstituicao(string? codigo)
    {
        if (string.IsNullOrWhiteSpace(codigo))
        {
            return null;
        }

        var procurado = codigo.Trim();
        return Catalogo.FirstOrDefault(i => i.Codigo == procurado)
            ?? Catalogo.FirstOrDefault(i => i.Codigo.TrimStart('0') == procurado.TrimStart('0'));
    }

    private static InstituicaoBancariaDto Copiar(InstituicaoBancariaDto origem) => new()
    {
        Codigo = origem.Codigo,
        Nome = origem.Nome,
        NomeOficial = origem.NomeOficial,
        Cor = origem.Cor,
        LogoUrl = origem.LogoUrl,
        Disponivel = origem.Disponivel
    };

    /// <summary>Recupera a instituição a partir do código embutido no ExternalItemId.</summary>
    private static InstituicaoBancariaDto? IdentificarInstituicao(string? externalItemId)
    {
        if (string.IsNullOrWhiteSpace(externalItemId))
        {
            return null;
        }

        var partes = externalItemId.Split('_');
        return partes.Length > 1 ? BuscarInstituicao(partes[1]) : null;
    }
}
