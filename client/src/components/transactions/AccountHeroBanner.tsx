import React from 'react';
import { Store, ShieldCheck, Lock } from 'lucide-react';
import { Badge } from '../ui/badge';

interface AccountHeroBannerProps {
  contaNome?: string;
  tipoConta?: string;
  documento?: string;
  bancoInfo?: string;
  agenciaCc?: string;
  sincronizado?: boolean;
}

export default function AccountHeroBanner({
  contaNome = 'Pizzaria Bella Forneria',
  tipoConta = 'Conta Jurídica Ativa',
  documento = 'CNPJ 38.192.831/0001-44',
  bancoInfo = 'Banco Itaú Unibanco (341)',
  agenciaCc = 'Ag 0942 • CC 20491-8',
  sincronizado = true,
}: AccountHeroBannerProps): React.ReactElement {
  return (
    <section className="w-full bg-card border border-border/70 rounded-2xl p-5 shadow-sm transition-all hover:border-border">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Account Identity */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 shadow-inner">
            <Store className="w-6 h-6 stroke-[2]" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-foreground tracking-tight truncate">
                {contaNome}
              </h2>
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 text-[11px] font-semibold">
                {tipoConta}
              </Badge>
              {documento && (
                <span className="text-xs font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md border border-border/40">
                  {documento}
                </span>
              )}
            </div>

            <div className="text-xs text-muted-foreground mt-1 flex flex-wrap items-center gap-2">
              <span>{bancoInfo}</span>
              <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/40" />
              <span>{agenciaCc}</span>
              {sincronizado && (
                <>
                  <span className="inline-block w-1 h-1 rounded-full bg-muted-foreground/40" />
                  <span className="text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Conexão Criptografada BACEN
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Security & Sync Status Indicator */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-muted/40 border border-border/50 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Open Finance Ativo</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
