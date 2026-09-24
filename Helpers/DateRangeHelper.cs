namespace FinSync.Helpers;

public static class DateRangeHelper
{
    public static (DateOnly Inicio, DateOnly Fim) GetPeriodo(string periodo)
    {
        var hoje = DateOnly.FromDateTime(DateTime.Today);

        return periodo.ToLowerInvariant() switch
        {
            "30d" or "ultimos_30" or "30_dias" => (
                hoje.AddDays(-29),
                hoje.AddDays(1)
            ),
            "ultimos_90" => (
                hoje.AddDays(-89),
                hoje.AddDays(1)
            ),
            "ano" or "este_ano" or "ano_atual" => (
                new DateOnly(hoje.Year, 1, 1),
                new DateOnly(hoje.Year + 1, 1, 1)
            ),
            "ano_passado" => (
                new DateOnly(hoje.Year - 1, 1, 1),
                new DateOnly(hoje.Year, 1, 1)
            ),
            "mes_passado" => (
                new DateOnly(hoje.Year, hoje.Month, 1).AddMonths(-1),
                new DateOnly(hoje.Year, hoje.Month, 1)
            ),
            "todo" or "todos" or "todo_historico" => (
                DateOnly.MinValue,
                DateOnly.MaxValue
            ),
            _ => (
                new DateOnly(hoje.Year, hoje.Month, 1),
                new DateOnly(hoje.Year, hoje.Month, 1).AddMonths(1)
            ),
        };
    }

    public static DateOnly CalcularProximaData(DateOnly data, FinSync.Enums.FrequenciaRecorrencia frequencia, int diaBase)
    {
        return frequencia switch
        {
            FinSync.Enums.FrequenciaRecorrencia.Semanal => data.AddDays(7),
            FinSync.Enums.FrequenciaRecorrencia.Quinzenal => data.AddDays(14),
            FinSync.Enums.FrequenciaRecorrencia.Mensal => AddMesSeguro(data, 1, diaBase),
            FinSync.Enums.FrequenciaRecorrencia.Anual => AddAnoSeguro(data, 1, diaBase),
            _ => data.AddMonths(1)
        };
    }

    public static DateOnly AddMesSeguro(DateOnly data, int meses, int diaBase)
    {
        var proximoAnoMes = data.AddMonths(meses);
        var diasNoMes = DateTime.DaysInMonth(proximoAnoMes.Year, proximoAnoMes.Month);
        var dia = Math.Min(diaBase, diasNoMes);
        return new DateOnly(proximoAnoMes.Year, proximoAnoMes.Month, dia);
    }

    public static DateOnly AddAnoSeguro(DateOnly data, int anos, int diaBase)
    {
        var proximoAno = data.Year + anos;
        var diasNoMes = DateTime.DaysInMonth(proximoAno, data.Month);
        var dia = Math.Min(diaBase, diasNoMes);
        return new DateOnly(proximoAno, data.Month, dia);
    }

    /// <summary>
    /// Retorna um SortedSet mantendo datas únicas em ordem cronológica estrita,
    /// otimizando consultas por faixa (GetViewBetween) e acesso a extremos (Min/Max).
    /// </summary>
    public static SortedSet<DateOnly> ObterDatasOrdenadasUnicas(IEnumerable<DateOnly> datas)
    {
        return new SortedSet<DateOnly>(datas);
    }
}