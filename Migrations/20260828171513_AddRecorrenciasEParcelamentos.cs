using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace FinSync.Migrations
{
    /// <inheritdoc />
    public partial class AddRecorrenciasEParcelamentos : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "NumeroParcela",
                table: "Transacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "ParcelamentoId",
                table: "Transacoes",
                type: "uuid",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RecorrenciaId",
                table: "Transacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TotalParcelas",
                table: "Transacoes",
                type: "integer",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Recorrencias",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    Descricao = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    Valor = table.Column<decimal>(type: "numeric", nullable: false),
                    Tipo = table.Column<int>(type: "integer", nullable: false),
                    Frequencia = table.Column<int>(type: "integer", nullable: false),
                    DataInicio = table.Column<DateOnly>(type: "date", nullable: false),
                    DataFim = table.Column<DateOnly>(type: "date", nullable: true),
                    StatusPadrao = table.Column<int>(type: "integer", nullable: false),
                    Ativo = table.Column<bool>(type: "boolean", nullable: false),
                    UltimaDataGerada = table.Column<DateOnly>(type: "date", nullable: true),
                    ContaId = table.Column<int>(type: "integer", nullable: false),
                    CategoriaId = table.Column<int>(type: "integer", nullable: true),
                    UsuarioId = table.Column<int>(type: "integer", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Recorrencias", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Recorrencias_Categorias_CategoriaId",
                        column: x => x.CategoriaId,
                        principalTable: "Categorias",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_Recorrencias_Contas_ContaId",
                        column: x => x.ContaId,
                        principalTable: "Contas",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_Recorrencias_Usuarios_UsuarioId",
                        column: x => x.UsuarioId,
                        principalTable: "Usuarios",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Transacoes_ParcelamentoId",
                table: "Transacoes",
                column: "ParcelamentoId");

            migrationBuilder.CreateIndex(
                name: "IX_Transacoes_RecorrenciaId",
                table: "Transacoes",
                column: "RecorrenciaId");

            migrationBuilder.CreateIndex(
                name: "IX_Recorrencias_Ativo",
                table: "Recorrencias",
                column: "Ativo");

            migrationBuilder.CreateIndex(
                name: "IX_Recorrencias_CategoriaId",
                table: "Recorrencias",
                column: "CategoriaId");

            migrationBuilder.CreateIndex(
                name: "IX_Recorrencias_ContaId",
                table: "Recorrencias",
                column: "ContaId");

            migrationBuilder.CreateIndex(
                name: "IX_Recorrencias_UsuarioId",
                table: "Recorrencias",
                column: "UsuarioId");

            migrationBuilder.AddForeignKey(
                name: "FK_Transacoes_Recorrencias_RecorrenciaId",
                table: "Transacoes",
                column: "RecorrenciaId",
                principalTable: "Recorrencias",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);

            migrationBuilder.Sql(@"
                DO $$ BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Recorrencias' AND policyname = 'Allow service role and postgres access') THEN
                        CREATE POLICY ""Allow service role and postgres access"" ON public.""Recorrencias""
                            FOR ALL
                            TO postgres, service_role
                            USING (true)
                            WITH CHECK (true);
                    END IF;
                END $$;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Transacoes_Recorrencias_RecorrenciaId",
                table: "Transacoes");

            migrationBuilder.DropTable(
                name: "Recorrencias");

            migrationBuilder.DropIndex(
                name: "IX_Transacoes_ParcelamentoId",
                table: "Transacoes");

            migrationBuilder.DropIndex(
                name: "IX_Transacoes_RecorrenciaId",
                table: "Transacoes");

            migrationBuilder.DropColumn(
                name: "NumeroParcela",
                table: "Transacoes");

            migrationBuilder.DropColumn(
                name: "ParcelamentoId",
                table: "Transacoes");

            migrationBuilder.DropColumn(
                name: "RecorrenciaId",
                table: "Transacoes");

            migrationBuilder.DropColumn(
                name: "TotalParcelas",
                table: "Transacoes");
        }
    }
}
