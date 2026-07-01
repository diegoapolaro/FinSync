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
}

app.Run();
