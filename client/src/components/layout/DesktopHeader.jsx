import { useLocation, useNavigate } from 'react-router-dom';

const tabs = [
  { id: '', label: 'EXTRATO' },
  { id: 'relatorios', label: 'RELATÓRIOS' },
  { id: 'ajustes', label: 'AJUSTES' },
];

export default function DesktopHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const pagina = location.pathname.replace(/^\/+/, '') || '';

  const hoje = new Date();
  const mes = hoje
    .toLocaleDateString('pt-BR', { month: 'short' })
    .toUpperCase();
  const dataRange = `${hoje.getDate()} ${mes} ${hoje.getFullYear()}`;

  return (
    <>
      <div className="hidden md:flex justify-between items-center px-gutter pt-margin-page pb-stack-base border-b border-dashed border-line">
        <h1 className="text-headline-lg font-headline-lg uppercase tracking-tighter text-primary">
          FINSYNC
        </h1>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary cursor-pointer">
            account_balance_wallet
          </span>
          <span className="material-symbols-outlined text-primary cursor-pointer">
            receipt_long
          </span>
        </div>
      </div>
      <nav className="hidden md:flex w-full justify-between items-end px-gutter pt-margin-page pb-stack-base border-b border-dashed border-line">
        <div className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => navigate(`/${tab.id}`)}
              className={
                pagina === tab.id
                  ? 'font-label-caps text-label-caps text-primary font-bold underline decoration-2 hover:bg-surface-variant transition-colors duration-75 p-2 rounded'
                  : 'font-label-caps text-label-caps text-secondary hover:bg-surface-variant transition-colors duration-75 p-2 rounded'
              }
            >
              {tab.label}
            </button>
          ))}
        </div>
        {pagina === '' && (
          <p className="font-label-caps text-label-caps text-secondary mb-2">
            {dataRange}
          </p>
        )}
      </nav>
    </>
  );
}
