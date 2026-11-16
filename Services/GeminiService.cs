using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using FinSync.Features.Categorias;

namespace FinSync.Services;

public interface IGeminiService
{
    Task<List<SugestaoCategoriaIaDto>> GerarSugestoesCategoriasAsync(string tipoComercio, CancellationToken cancellationToken = default);
}

public record SugestaoCategoriaIaDto(
    [property: JsonPropertyName("nome")] string Nome,
    [property: JsonPropertyName("tipo")] string Tipo,
    [property: JsonPropertyName("cor")] string Cor
);

public class GeminiService(IHttpClientFactory httpClientFactory, IConfiguration configuration, ILogger<GeminiService> logger) : IGeminiService
{
    private const string DefaultModel = "gemini-3.5-flash-lite";

    public async Task<List<SugestaoCategoriaIaDto>> GerarSugestoesCategoriasAsync(string tipoComercio, CancellationToken cancellationToken = default)
    {
        var apiKey = configuration["Gemini:ApiKey"] ?? Environment.GetEnvironmentVariable("GEMINI_API_KEY");
        var model = configuration["Gemini:Model"] ?? Environment.GetEnvironmentVariable("GEMINI_MODEL") ?? DefaultModel;

        if (string.IsNullOrWhiteSpace(tipoComercio))
        {
            tipoComercio = "Comércio Geral";
        }

        // Se a chave não estiver configurada, aplica fallback inteligente sem falhar
        if (string.IsNullOrWhiteSpace(apiKey) || apiKey.Contains("PLACEHOLDER", StringComparison.OrdinalIgnoreCase))
        {
            logger.LogWarning("Chave do Gemini não configurada ou inválida. Utilizando fallback inteligente.");
            return ObterFallbackCategorias(tipoComercio);
        }

        try
        {
            var client = httpClientFactory.CreateClient("GeminiClient");
            client.Timeout = TimeSpan.FromSeconds(15);

            var endpoint = $"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={apiKey}";

            var systemPrompt = 
                "Você é um consultor financeiro e contábil sênior especializado em plano de contas (DRE) para micro e pequenas empresas.\n" +
                $"Dado o seguinte segmento ou nome de negócio: '{tipoComercio}', sugira exatamente entre 8 e 12 categorias essenciais (balanceando receitas/Entrada e despesas/Saida operacionais, CMV e custos fixos).\n" +
                "REGRA CRÍTICA MANDATÓRIA: É terminantemente proibido o uso de qualquer caractere de emoji em qualquer parte dos nomes de categorias.\n" +
                "O campo 'tipo' DEVE ser exatamente 'Entrada' ou 'Saida'.\n" +
                "O campo 'cor' deve ser um código hexadecimal harmonioso válido (ex: #1c6cff, #00cc4b, #f59e0b, #ef4444, #8b5cf6, #0ea5e9, #64748b).\n" +
                "Responda estritamente com o array JSON de objetos: [{\"nome\": \"...\", \"tipo\": \"...\", \"cor\": \"...\"}].";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = systemPrompt }
                        }
                    }
                },
                generationConfig = new
                {
                    responseMimeType = "application/json",
                    temperature = 0.2
                }
            };

            var jsonContent = new StringContent(JsonSerializer.Serialize(requestBody), Encoding.UTF8, "application/json");
            var response = await client.PostAsync(endpoint, jsonContent, cancellationToken);

            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync(cancellationToken);
                logger.LogError("Erro na chamada da API Gemini ({StatusCode}): {Body}", response.StatusCode, errorBody);
                return ObterFallbackCategorias(tipoComercio);
            }

            var responseJson = await response.Content.ReadAsStringAsync(cancellationToken);
            using var doc = JsonDocument.Parse(responseJson);

            var root = doc.RootElement;
            if (root.TryGetProperty("candidates", out var candidates) && candidates.GetArrayLength() > 0)
            {
                var firstCandidate = candidates[0];
                if (firstCandidate.TryGetProperty("content", out var content) &&
                    content.TryGetProperty("parts", out var parts) && parts.GetArrayLength() > 0)
                {
                    var textResponse = parts[0].GetProperty("text").GetString();
                    if (!string.IsNullOrWhiteSpace(textResponse))
                    {
                        var categorias = JsonSerializer.Deserialize<List<SugestaoCategoriaIaDto>>(textResponse, new JsonSerializerOptions
                        {
                            PropertyNameCaseInsensitive = true
                        });

                        if (categorias != null && categorias.Count > 0)
                        {
                            // Sanitização extra para garantir zero emojis e formatação correta
                            return categorias
                                .Where(c => !string.IsNullOrWhiteSpace(c.Nome))
                                .Select(c => new SugestaoCategoriaIaDto(
                                    RemoverEmojisEFormatacao(c.Nome),
                                    NormalizarTipo(c.Tipo),
                                    string.IsNullOrWhiteSpace(c.Cor) ? "#1c6cff" : c.Cor
                                ))
                                .ToList();
                        }
                    }
                }
            }

            return ObterFallbackCategorias(tipoComercio);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Falha ao gerar categorias com Gemini para '{TipoComercio}'. Usando fallback.", tipoComercio);
            return ObterFallbackCategorias(tipoComercio);
        }
    }

    private static string NormalizarTipo(string tipo)
    {
        if (string.Equals(tipo, "Entrada", StringComparison.OrdinalIgnoreCase) ||
            string.Equals(tipo, "Receita", StringComparison.OrdinalIgnoreCase))
        {
            return "Entrada";
        }
        return "Saida";
    }

    private static string RemoverEmojisEFormatacao(string input)
    {
        if (string.IsNullOrEmpty(input)) return string.Empty;

        var sb = new StringBuilder();
        foreach (var ch in input)
        {
            // Filtra emojis e símbolos fora dos blocos comuns de texto
            var category = char.GetUnicodeCategory(ch);
            if (category != System.Globalization.UnicodeCategory.OtherSymbol &&
                category != System.Globalization.UnicodeCategory.Surrogate)
            {
                sb.Append(ch);
            }
        }
        return sb.ToString().Trim();
    }

    private static List<SugestaoCategoriaIaDto> ObterFallbackCategorias(string tipoComercio)
    {
        var lower = tipoComercio.ToLowerInvariant();

        if (lower.Contains("barbearia") || lower.Contains("barber") || lower.Contains("salao") || lower.Contains("cabelo"))
        {
            return new List<SugestaoCategoriaIaDto>
            {
                new("Cortes & Barba", "Entrada", "#00cc4b"),
                new("Venda de Pomadas & Cosmeticos", "Entrada", "#1c6cff"),
                new("Tratamentos & Quimica", "Entrada", "#10b981"),
                new("Laminas & Descartaveis", "Saida", "#ef4444"),
                new("Produtos & Cosmeticos", "Saida", "#f59e0b"),
                new("Comissoes de Barbeiros", "Saida", "#6366f1"),
                new("Aluguel & Contas Fixas", "Saida", "#64748b"),
                new("Taxas de Cartao", "Saida", "#e11d48"),
            };
        }

        if (lower.Contains("pizza") || lower.Contains("restaurante") || lower.Contains("burger") || lower.Contains("lanchonete"))
        {
            return new List<SugestaoCategoriaIaDto>
            {
                new("Vendas Balcao & Salao", "Entrada", "#00cc4b"),
                new("Vendas Delivery & Apps", "Entrada", "#1c6cff"),
                new("Insumos & Ingredientes", "Saida", "#f59e0b"),
                new("Hortifruti & Molhos", "Saida", "#ef4444"),
                new("Embalagens & Descartaveis", "Saida", "#8b5cf6"),
                new("Gas & Energia Eletrica", "Saida", "#f97316"),
                new("Equipe & Entregadores", "Saida", "#6366f1"),
                new("Taxas de Cartao & Marketplaces", "Saida", "#e11d48"),
            };
        }

        // Genérico comercial / negócios
        return new List<SugestaoCategoriaIaDto>
        {
            new("Venda de Produtos", "Entrada", "#00cc4b"),
            new("Prestacao de Servicos", "Entrada", "#1c6cff"),
            new("Fornecedores & Mercadorias", "Saida", "#f59e0b"),
            new("Aluguel & Contas Fixas", "Saida", "#64748b"),
            new("Folha de Pagamento & Pro-labore", "Saida", "#6366f1"),
            new("Marketing & Anuncios", "Saida", "#0ea5e9"),
            new("Taxas Bancarias & Adquirentes", "Saida", "#e11d48"),
            new("Manutencao & Materiais", "Saida", "#14b8a6"),
        };
    }
}
