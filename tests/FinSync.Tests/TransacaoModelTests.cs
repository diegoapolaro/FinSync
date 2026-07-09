using FinSync.Models;
using Xunit;

namespace FinSync.Tests;

public class TransacaoModelTests
{
    [Fact]
    public void Transacao_DeveTerValoresPadrao()
    {
        var t = new Transacao();
        Assert.Equal(0, t.Id);
        Assert.Equal(string.Empty, t.Descricao);
        Assert.Equal(0m, t.Valor);
        Assert.Equal(DateOnly.FromDateTime(DateTime.Now), t.Data);
    }

    [Fact]
    public void Transacao_Entrada_TipoDeveSerEntrada()
    {
        var t = new Transacao { Tipo = TipoTransacao.Entrada };
        Assert.Equal(TipoTransacao.Entrada, t.Tipo);
    }
}
