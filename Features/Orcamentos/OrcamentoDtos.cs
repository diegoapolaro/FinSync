using System.ComponentModel.DataAnnotations;

namespace FinSync.Features.Orcamentos;

public record CreateOrcamentoDto(
    [Required] int CategoriaId,
    [Required][Range(0.01, double.MaxValue)] decimal ValorLimite,
    [Required][Range(1, 12)] int Mes,
    [Required][Range(2000, 2100)] int Ano
);

public record UpdateOrcamentoDto(
    [Required][Range(0.01, double.MaxValue)] decimal ValorLimite
);

public class OrcamentoDto
{
    public int Id { get; set; }
    public int CategoriaId { get; set; }
    public decimal ValorLimite { get; set; }
    public int Mes { get; set; }
    public int Ano { get; set; }
}

public class StatusOrcamentoDto : OrcamentoDto
{
    public decimal TotalGasto { get; set; }
    public decimal PercentualUso => ValorLimite > 0 ? (TotalGasto / ValorLimite) * 100 : 0;
}
