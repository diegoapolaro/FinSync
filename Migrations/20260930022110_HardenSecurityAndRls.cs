using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace FinSync.Migrations
{
    /// <inheritdoc />
    public partial class HardenSecurityAndRls : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            if (ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                // 1. Habilitar Row Level Security na tabela Orcamentos
                migrationBuilder.Sql("ALTER TABLE public.\"Orcamentos\" ENABLE ROW LEVEL SECURITY;");

                // 2. Criar política RLS explícita para Orcamentos (apenas roles postgres e service_role)
                migrationBuilder.Sql(@"
                    DO $$ BEGIN
                        IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'Orcamentos' AND policyname = 'Allow service role and postgres access') THEN
                            CREATE POLICY ""Allow service role and postgres access"" ON public.""Orcamentos""
                                FOR ALL
                                TO postgres, service_role
                                USING (true)
                                WITH CHECK (true);
                        END IF;
                    END $$;
                ");

                // 3. Revogar privilégios de tabelas, sequências e rotinas no schema public para anon e authenticated
                migrationBuilder.Sql(@"
                    DO $$ BEGIN
                        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
                            REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;
                            REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;
                            REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon;
                            ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon;
                            ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon;
                            ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM anon;
                        END IF;
                        IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
                            REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated;
                            REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated;
                            REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM authenticated;
                            ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM authenticated;
                            ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM authenticated;
                            ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON ROUTINES FROM authenticated;
                        END IF;
                    END $$;
                ");
            }
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            if (ActiveProvider == "Npgsql.EntityFrameworkCore.PostgreSQL")
            {
                migrationBuilder.Sql("DROP POLICY IF EXISTS \"Allow service role and postgres access\" ON public.\"Orcamentos\";");
                migrationBuilder.Sql("ALTER TABLE public.\"Orcamentos\" DISABLE ROW LEVEL SECURITY;");
            }
        }
    }
}
