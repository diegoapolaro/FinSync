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
    <section className="w-full bg-card border border-fog dark:border-spruce rounded-[20px] p-5 shadow-sm transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Account Identity */}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-12 h-12 rounded-full bg-forest-ink text-lime-voltage flex items-center justify-center shrink-0 shadow-sm">
            <Store className="w-6 h-6 stroke-[2.25]" />
          </div>

          <div className="flex flex-col min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg md:text-xl font-bold text-forest-ink dark:text-paper tracking-tight truncate font-sans">
                {contaNome}
              </h2>
              <span className="bg-linen-mist text-forest-ink dark:bg-spruce dark:text-lime-voltage px-3 py-0.5 rounded-full text-xs font-bold">
                {tipoConta}
              </span>
              {documento && (
                <span className="text-xs font-medium text-charcoal dark:text-pebble bg-fog dark:bg-spruce/50 px-2.5 py-0.5 rounded-full border border-border/40">
                  {documento}
                </span>
              )}
            </div>

            <div className="text-xs text-charcoal dark:text-pebble mt-1 flex flex-wrap items-center gap-2">
              <span>{bancoInfo}</span>
              <span className="inline-block w-1 h-1 rounded-full bg-pebble" />
              <span>{agenciaCc}</span>
              {sincronizado && (
                <>
                  <span className="inline-block w-1 h-1 rounded-full bg-pebble" />
                  <span className="text-forest-ink dark:text-lime-voltage font-semibold inline-flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Conexão Criptografada BACEN
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: Security & Sync Status Indicator */}
        <div className="flex items-center gap-3 shrink-0 self-start md:self-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-linen-mist dark:bg-spruce text-xs font-bold text-forest-ink dark:text-lime-voltage border border-lime-voltage/30">
            <ShieldCheck className="w-4 h-4 text-forest-ink dark:text-lime-voltage" />
            <span>Open Finance Ativo</span>
            <span className="w-2 h-2 rounded-full bg-forest-ink dark:bg-lime-voltage animate-pulse" />
          </div>
        </div>
      </div>
    </section>
  );
}
