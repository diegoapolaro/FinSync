namespace FinSync.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(FinSyncDbContext context)
    {
        if (!context.Contas.Any())
        {
            context.Contas.AddRange(
                new FinSync.Models.Conta
                {
                    Nome = "Pizzaria",
                    Tipo = FinSync.Models.TipoConta.Comercial,
                },
                new FinSync.Models.Conta
                {
                    Nome = "Pessoal",
                    Tipo = FinSync.Models.TipoConta.Pessoal,
                }
            );
            await context.SaveChangesAsync();
        }

        if (!context.Categorias.Any())
        {
            context.Categorias.AddRange(
                new FinSync.Models.Categoria { Nome = "Alimentação", Cor = "#96d4b2", Tipo = FinSync.Models.TipoTransacao.Saida },
                new FinSync.Models.Categoria { Nome = "Transporte", Cor = "#ffb3b3", Tipo = FinSync.Models.TipoTransacao.Saida },
                new FinSync.Models.Categoria { Nome = "Moradia", Cor = "#b3d9ff", Tipo = FinSync.Models.TipoTransacao.Saida },
                new FinSync.Models.Categoria { Nome = "Vendas", Cor = "#b3ffb3", Tipo = FinSync.Models.TipoTransacao.Entrada },
                new FinSync.Models.Categoria { Nome = "Salário", Cor = "#ffd9b3", Tipo = FinSync.Models.TipoTransacao.Entrada },
                new FinSync.Models.Categoria { Nome = "Investimentos", Cor = "#d9b3ff", Tipo = FinSync.Models.TipoTransacao.Entrada }
            );
            await context.SaveChangesAsync();
        }
    }
}