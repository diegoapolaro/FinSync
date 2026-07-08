using FinSync.Models;
using System.ComponentModel.DataAnnotations;

namespace FinSync.Dtos;

public class CreateCategoriaDto
{
    [Required]
    [StringLength(60)]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [StringLength(7)]
    [RegularExpression("^#[0-9a-fA-F]{6}$")]
    public string Cor { get; set; } = "#96d4b2";

    [EnumDataType(typeof(TipoTransacao))]
    public TipoTransacao Tipo { get; set; }
}

public class UpdateCategoriaDto
{
    [Required]
    [StringLength(60)]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [StringLength(7)]
    [RegularExpression("^#[0-9a-fA-F]{6}$")]
    public string Cor { get; set; } = "#96d4b2";

    [EnumDataType(typeof(TipoTransacao))]
    public TipoTransacao Tipo { get; set; }
}

public class CategoriaDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public string Cor { get; set; } = string.Empty;
    public TipoTransacao Tipo { get; set; }
}
