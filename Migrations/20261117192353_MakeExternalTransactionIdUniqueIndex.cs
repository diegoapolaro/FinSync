using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinSync.Migrations
{
    /// <inheritdoc />
    public partial class MakeExternalTransactionIdUniqueIndex : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Transacoes_ContaId_ExternalTransactionId",
                table: "Transacoes");

            migrationBuilder.CreateIndex(
                name: "IX_Transacoes_ContaId_ExternalTransactionId",
                table: "Transacoes",
                columns: new[] { "ContaId", "ExternalTransactionId" },
                unique: true,
                filter: "\"ExternalTransactionId\" IS NOT NULL");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropIndex(
                name: "IX_Transacoes_ContaId_ExternalTransactionId",
                table: "Transacoes");

            migrationBuilder.CreateIndex(
                name: "IX_Transacoes_ContaId_ExternalTransactionId",
                table: "Transacoes",
                columns: new[] { "ContaId", "ExternalTransactionId" });
        }
    }
}
