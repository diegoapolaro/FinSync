using FinSync.Data;
using FinSync.Handlers;
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
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();
builder.Services.AddProblemDetails();

var corsOrigins = builder.Configuration.GetSection("CorsOrigins").Get<string[]>();

builder.Services.AddCors(options =>
{
    if (corsOrigins is { Length: > 0 })
    {
        options.AddPolicy("FrontendPolicy", policy =>
        {
            policy.WithOrigins(corsOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    }
    else if (builder.Environment.IsDevelopment())
    {
        options.AddPolicy("FrontendPolicy", policy =>
        {
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
    }
    else
    {
        throw new InvalidOperationException(
            "CORS nao configurado. Defina 'CorsOrigins' em appsettings.json (ex.: [\"http://localhost:5173\"]).");
    }
});

var app = builder.Build();

app.UseExceptionHandler();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference();
}

app.UseCors("FrontendPolicy");

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
