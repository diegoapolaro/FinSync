using System;

namespace FinSync.Features.Transacoes;

public class SugestaoDescricaoDto
{
    public string Descricao { get; set; } = string.Empty;
    public int TotalUsos { get; set; }
    public DateOnly? UltimaData { get; set; }
    public int? CategoriaId { get; set; }
}
