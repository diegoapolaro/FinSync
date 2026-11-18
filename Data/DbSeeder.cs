using FinSync.Enums;
using FinSync.Features.Auth;
using FinSync.Features.Categorias;
using FinSync.Features.Contas;
using Microsoft.EntityFrameworkCore;

namespace FinSync.Data;

public static class DbSeeder
{
    public static async Task SeedAsync(FinSyncDbContext context)
    {
        Usuario? usuarioPadrao;

        if (!context.Usuarios.Any())
        {
            usuarioPadrao = new Usuario
            {
                Nome = "Admin",
                Email = "admin@finsync.com",
                SenhaHash = BCrypt.Net.BCrypt.HashPassword("123456"),
                DataCriacao = DateTime.UtcNow
            };
            context.Usuarios.Add(usuarioPadrao);
            await context.SaveChangesAsync();
        }
        else
        {
            usuarioPadrao = await context.Usuarios.FirstOrDefaultAsync();
        }

        if (usuarioPadrao is not null && !context.Contas.Any(c => c.UsuarioId == usuarioPadrao.Id))
        {
            context.Contas.AddRange(
                new Conta
                {
                    Nome = "Pizzaria",
                    Tipo = TipoConta.Comercial,
                    InstituicaoCodigo = "341",
                    InstituicaoNome = "Itaú Unibanco",
                    Agencia = "0942",
                    NumeroConta = "20491-8",
                    ChavePix = "contato@bellaforneria.com.br",
                    Provedor = ProvedorOpenFinance.MockSandbox,
                    ExternalItemId = "mock_item_itau_pizzaria",
                    StatusSincronizacao = StatusSincronizacao.Sincronizado,
                    UltimaSincronizacaoEm = DateTime.UtcNow.AddMinutes(-15),
                    UsuarioId = usuarioPadrao.Id
                },
                new Conta
                {
                    Nome = "Pessoal",
                    Tipo = TipoConta.Pessoal,
                    InstituicaoCodigo = "260",
                    InstituicaoNome = "Nubank",
                    Agencia = "0001",
                    NumeroConta = "839201-4",
                    ChavePix = "admin@finsync.com",
                    Provedor = ProvedorOpenFinance.MockSandbox,
                    ExternalItemId = "mock_item_nubank_pessoal",
                    StatusSincronizacao = StatusSincronizacao.Sincronizado,
                    UltimaSincronizacaoEm = DateTime.UtcNow.AddMinutes(-40),
                    UsuarioId = usuarioPadrao.Id
                }
            );
            await context.SaveChangesAsync();
        }

        if (usuarioPadrao is not null && !context.Categorias.Any(c => c.UsuarioId == usuarioPadrao.Id))
        {
            context.Categorias.AddRange(
                new Categoria { Nome = "Alimentação", Cor = "#96d4b2", Tipo = TipoTransacao.Saida, UsuarioId = usuarioPadrao.Id },
                new Categoria { Nome = "Transporte", Cor = "#ffb3b3", Tipo = TipoTransacao.Saida, UsuarioId = usuarioPadrao.Id },
                new Categoria { Nome = "Moradia", Cor = "#b3d9ff", Tipo = TipoTransacao.Saida, UsuarioId = usuarioPadrao.Id },
                new Categoria { Nome = "Vendas", Cor = "#b3ffb3", Tipo = TipoTransacao.Entrada, UsuarioId = usuarioPadrao.Id },
                new Categoria { Nome = "Salário", Cor = "#ffd9b3", Tipo = TipoTransacao.Entrada, UsuarioId = usuarioPadrao.Id },
                new Categoria { Nome = "Investimentos", Cor = "#d9b3ff", Tipo = TipoTransacao.Entrada, UsuarioId = usuarioPadrao.Id }
            );
            await context.SaveChangesAsync();
        }
    }
}