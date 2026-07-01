using FinSync.Data;
using Microsoft.EntityFrameworkCore;
using Scalar.AspNetCore;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("FinSync");

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });
builder.Services.AddDbContext<FinSyncDbContext>(options =>
    options.UseSqlite(connectionString));
builder.Services.AddOpenApi();

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}


app.UseHttpsRedirection();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<FinSyncDbContext>();
    context.Database.Migrate();

    if (!context.Contas.Any())
    {
        context.Contas.Add(new FinSync.Models.Conta
        {
            Nome = "Pizzaria",
            Tipo = FinSync.Models.TipoConta.Comercial,
        });
        context.Contas.Add(new FinSync.Models.Conta
        {
            Nome = "Pessoal",
            Tipo = FinSync.Models.TipoConta.Pessoal,
        });
        context.SaveChanges();
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
        context.SaveChanges();
    }
}

app.Run();
