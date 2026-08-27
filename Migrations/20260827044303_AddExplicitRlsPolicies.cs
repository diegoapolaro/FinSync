using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinSync.Migrations
{
    /// <inheritdoc />
    public partial class AddExplicitRlsPolicies : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DO $$ BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Categorias' AND policyname = 'Allow service role and postgres access') THEN
                        CREATE POLICY ""Allow service role and postgres access"" ON public.""Categorias""
                            FOR ALL
                            TO postgres, service_role
                            USING (true)
                            WITH CHECK (true);
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql(@"
                DO $$ BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Contas' AND policyname = 'Allow service role and postgres access') THEN
                        CREATE POLICY ""Allow service role and postgres access"" ON public.""Contas""
                            FOR ALL
                            TO postgres, service_role
                            USING (true)
                            WITH CHECK (true);
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql(@"
                DO $$ BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Transacoes' AND policyname = 'Allow service role and postgres access') THEN
                        CREATE POLICY ""Allow service role and postgres access"" ON public.""Transacoes""
                            FOR ALL
                            TO postgres, service_role
                            USING (true)
                            WITH CHECK (true);
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql(@"
                DO $$ BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Usuarios' AND policyname = 'Allow service role and postgres access') THEN
                        CREATE POLICY ""Allow service role and postgres access"" ON public.""Usuarios""
                            FOR ALL
                            TO postgres, service_role
                            USING (true)
                            WITH CHECK (true);
                    END IF;
                END $$;
            ");

            migrationBuilder.Sql(@"
                DO $$ BEGIN
                    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = '__EFMigrationsHistory' AND policyname = 'Allow service role and postgres access') THEN
                        CREATE POLICY ""Allow service role and postgres access"" ON public.""__EFMigrationsHistory""
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
            migrationBuilder.Sql("DROP POLICY IF EXISTS \"Allow service role and postgres access\" ON public.\"Categorias\";");
            migrationBuilder.Sql("DROP POLICY IF EXISTS \"Allow service role and postgres access\" ON public.\"Contas\";");
            migrationBuilder.Sql("DROP POLICY IF EXISTS \"Allow service role and postgres access\" ON public.\"Transacoes\";");
            migrationBuilder.Sql("DROP POLICY IF EXISTS \"Allow service role and postgres access\" ON public.\"Usuarios\";");
            migrationBuilder.Sql("DROP POLICY IF EXISTS \"Allow service role and postgres access\" ON public.\"__EFMigrationsHistory\";");
        }
    }
}
