using System.ComponentModel.DataAnnotations;

namespace FinSync.Models;

public class Categoria
{
    public int Id { get; set; }

    [Required]
    [StringLength(60)]
    public string Nome { get; set; } = string.Empty;

    [Required]
    [StringLength(7)]
    public string Cor { get; set; } = "#96d4b2";

    public TipoTransacao Tipo { get; set; }
}
