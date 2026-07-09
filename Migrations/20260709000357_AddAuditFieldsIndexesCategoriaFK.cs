using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinSync.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditFieldsIndexesCategoriaFK : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "CategoriaId",
                table: "Transacoes",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Transacoes",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Transacoes",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Contas",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Contas",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "CreatedAt",
                table: "Categorias",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Categorias",
                type: "TEXT",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.CreateIndex(
                name: "IX_Transacoes_CategoriaId",
                table: "Transacoes",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Transacoes_Data",
                table: "Transacoes",
                column: "Data");

            migrationBuilder.CreateIndex(
                name: "IX_Contas_Arquivada",
                table: "Contas",
                column: "Arquivada");

            migrationBuilder.AddForeignKey(
                name: "FK_Transacoes_Categorias_CategoriaId",
                table: "Transacoes",
                column: "CategoriaId",
                principalTable: "Categorias",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transacoes_Categorias_CategoriaId",
                table: "Transacoes");

            migrationBuilder.DropIndex(
                name: "IX_Transacoes_CategoriaId",
                table: "Transacoes");

            migrationBuilder.DropIndex(
                name: "IX_Transacoes_Data",
                table: "Transacoes");

            migrationBuilder.DropIndex(
                name: "IX_Contas_Arquivada",
                table: "Contas");

            migrationBuilder.DropColumn(
                name: "CategoriaId",
                table: "Transacoes");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Transacoes");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Transacoes");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Contas");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Contas");

            migrationBuilder.DropColumn(
                name: "CreatedAt",
                table: "Categorias");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Categorias");
        }
    }
}
