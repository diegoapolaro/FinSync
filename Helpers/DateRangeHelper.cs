namespace FinSync.Helpers;

public static class DateRangeHelper
{
    public static (DateOnly Inicio, DateOnly Fim) GetPeriodo(string periodo)
    {
        var hoje = DateOnly.FromDateTime(DateTime.Today);

        return periodo.ToLowerInvariant() switch
        {
            "mes_passado" => (
                new DateOnly(hoje.Year, hoje.Month, 1).AddMonths(-1),
                new DateOnly(hoje.Year, hoje.Month, 1)
            ),
            "ultimos_90" => (
                hoje.AddDays(-89),
                hoje.AddDays(1)
            ),
            "todos" => (
                DateOnly.MinValue,
                DateOnly.MaxValue
            ),
            _ => (
                new DateOnly(hoje.Year, hoje.Month, 1),
                new DateOnly(hoje.Year, hoje.Month, 1).AddMonths(1)
            ),
        };
    }
}