using FinSync.Enums;
using FinSync.Features.Transacoes;
using FinSync.Helpers;
using Xunit;

namespace FinSync.Tests.Helpers;

public class OptimizationStructuresTests
{
    [Fact]
    public void TransacaoPreviewDto_RecordClass_DeveGarantirIgualdadePorValorEGetHashCode()
    {
        var preview1 = new TransacaoPreviewDto
        {
            Data = new DateOnly(2026, 9, 15),
            Descricao = "Supermercado XYZ",
            Valor = 150.50m,
            Tipo = TipoTransacao.Saida
        };

        var preview2 = new TransacaoPreviewDto
        {
            Data = new DateOnly(2026, 9, 15),
            Descricao = "Supermercado XYZ",
            Valor = 150.50m,
            Tipo = TipoTransacao.Saida
        };

        var previewDiferente = new TransacaoPreviewDto
        {
            Data = new DateOnly(2026, 9, 15),
            Descricao = "Supermercado ABC",
            Valor = 150.50m,
            Tipo = TipoTransacao.Saida
        };

        // Assert - Equals e Operador ==
        Assert.Equal(preview1, preview2);
        Assert.True(preview1 == preview2);
        Assert.False(preview1 == previewDiferente);

        // Assert - GetHashCode consistente
        Assert.Equal(preview1.GetHashCode(), preview2.GetHashCode());

        // Assert - Operação em HashSet<TransacaoPreviewDto> com desduplicação O(1)
        var conjunto = new HashSet<TransacaoPreviewDto> { preview1, preview2, previewDiferente };
        Assert.Equal(2, conjunto.Count);
        Assert.Contains(preview1, conjunto);
        Assert.Contains(previewDiferente, conjunto);
    }

    [Fact]
    public void DateRangeHelper_ObterDatasOrdenadasUnicas_DeveEliminarDuplicadasEManterOrdemCronologica()
    {
        var d1 = new DateOnly(2026, 12, 1);
        var d2 = new DateOnly(2026, 1, 15);
        var d3 = new DateOnly(2026, 6, 30);
        var d4 = new DateOnly(2026, 1, 15); // duplicada

        var listaDesordenada = new List<DateOnly> { d1, d2, d3, d4 };

        var sortedSet = DateRangeHelper.ObterDatasOrdenadasUnicas(listaDesordenada);

        // Assert - Elementos únicos
        Assert.Equal(3, sortedSet.Count);

        // Assert - Ordem cronológica estrita
        var listaOrdenada = sortedSet.ToList();
        Assert.Equal(new DateOnly(2026, 1, 15), listaOrdenada[0]);
        Assert.Equal(new DateOnly(2026, 6, 30), listaOrdenada[1]);
        Assert.Equal(new DateOnly(2026, 12, 1), listaOrdenada[2]);

        // Assert - Min e Max imediatos
        Assert.Equal(new DateOnly(2026, 1, 15), sortedSet.Min);
        Assert.Equal(new DateOnly(2026, 12, 1), sortedSet.Max);

        // Assert - Consulta por faixa (GetViewBetween)
        var faixaMeioDoAno = sortedSet.GetViewBetween(new DateOnly(2026, 5, 1), new DateOnly(2026, 7, 1));
        Assert.Single(faixaMeioDoAno);
        Assert.Equal(new DateOnly(2026, 6, 30), faixaMeioDoAno.First());
    }
}
