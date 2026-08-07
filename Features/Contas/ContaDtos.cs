using System.ComponentModel.DataAnnotations;
using FinSync.Enums;

namespace FinSync.Features.Contas;

public class CreateContaDto
{
    [Required]
    [StringLength(80)]
    public string Nome { get; set; } = string.Empty;

    [EnumDataType(typeof(TipoConta))]
    public TipoConta Tipo { get; set; }
}

public class UpdateContaDto
{
    [Required]
    [StringLength(80)]
    public string Nome { get; set; } = string.Empty;

    [EnumDataType(typeof(TipoConta))]
    public TipoConta Tipo { get; set; }

    public bool Arquivada { get; set; }
}

public class ContaDto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public TipoConta Tipo { get; set; }
    public bool Arquivada { get; set; }
}