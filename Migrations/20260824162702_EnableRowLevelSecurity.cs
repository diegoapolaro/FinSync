using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinSync.Migrations
{
    /// <inheritdoc />
    public partial class EnableRowLevelSecurity : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE public.\"Transacoes\" ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE public.\"Usuarios\" ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE public.\"Categorias\" ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE public.\"Contas\" ENABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE public.\"__EFMigrationsHistory\" ENABLE ROW LEVEL SECURITY;");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("ALTER TABLE public.\"Transacoes\" DISABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE public.\"Usuarios\" DISABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE public.\"Categorias\" DISABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE public.\"Contas\" DISABLE ROW LEVEL SECURITY;");
            migrationBuilder.Sql("ALTER TABLE public.\"__EFMigrationsHistory\" DISABLE ROW LEVEL SECURITY;");
        }
    }
}
