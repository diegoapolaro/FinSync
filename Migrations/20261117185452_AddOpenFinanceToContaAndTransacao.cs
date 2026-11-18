using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinSync.Migrations
{
    /// <inheritdoc />
    public partial class AddOpenFinanceToContaAndTransacao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ExternalTransactionId",
                table: "Transacoes",
                type: "character varying(150)",
                maxLength: 150,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Agencia",
                table: "Contas",
                type: "character varying(20)",
                maxLength: 20,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ChavePix",
                table: "Contas",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "ExternalItemId",
                table: "Contas",
                type: "character varying(120)",
                maxLength: 120,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstituicaoCodigo",
                table: "Contas",
                type: "character varying(10)",
                maxLength: 10,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "InstituicaoNome",
                table: "Contas",
                type: "character varying(80)",
                maxLength: 80,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "MensagemErroSincronizacao",
                table: "Contas",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "NumeroConta",
                table: "Contas",
                type: "character varying(30)",
                maxLength: 30,
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "Provedor",
                table: "Contas",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "StatusSincronizacao",
                table: "Contas",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<DateTime>(
                name: "UltimaSincronizacaoEm",
                table: "Contas",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Transacoes_ContaId_ExternalTransactionId",
                table: "Transacoes",
                columns: new[] { "ContaId", "ExternalTransactionId" });

            migrationBuilder.CreateIndex(
                name: "IX_Contas_ExternalItemId",
                table: "Contas",
                column: "ExternalItemId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Transacoes_ContaId_ExternalTransactionId",
                table: "Transacoes");

            migrationBuilder.DropIndex(
                name: "IX_Contas_ExternalItemId",
                table: "Contas");

            migrationBuilder.DropColumn(
                name: "ExternalTransactionId",
                table: "Transacoes");

            migrationBuilder.DropColumn(
                name: "Agencia",
                table: "Contas");

            migrationBuilder.DropColumn(
                name: "ChavePix",
                table: "Contas");

            migrationBuilder.DropColumn(
                name: "ExternalItemId",
                table: "Contas");

            migrationBuilder.DropColumn(
                name: "InstituicaoCodigo",
                table: "Contas");

            migrationBuilder.DropColumn(
                name: "InstituicaoNome",
                table: "Contas");

            migrationBuilder.DropColumn(
                name: "MensagemErroSincronizacao",
                table: "Contas");

            migrationBuilder.DropColumn(
                name: "NumeroConta",
                table: "Contas");

            migrationBuilder.DropColumn(
                name: "Provedor",
                table: "Contas");

            migrationBuilder.DropColumn(
                name: "StatusSincronizacao",
                table: "Contas");

            migrationBuilder.DropColumn(
                name: "UltimaSincronizacaoEm",
                table: "Contas");
        }
    }
}
