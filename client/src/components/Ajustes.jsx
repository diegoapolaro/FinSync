export default function Ajustes({ contas }) {
  return (
    <div className="torn-edge-top torn-edge-bottom px-gutter pt-margin-page pb-[100px] md:pb-gutter">
      <div className="md:hidden flex justify-between items-center mb-stack-loose pb-stack-base border-b border-dashed border-outline-variant">
        <h1 className="font-headline-md text-headline-md text-primary tracking-tighter uppercase">FINSYNC</h1>
        <span className="material-symbols-outlined text-[28px] text-on-surface">close</span>
      </div>

      <h2 className="font-headline-md text-headline-md uppercase mb-stack-loose text-center">AJUSTES</h2>

      <Perfil />
      <ContasList contas={contas} />
      <Categorias />
      <Preferencias />
      <Notificacoes />
      <ExportarDados />
      <Seguranca />
      <Sobre />
    </div>
  );
}

function Secao({ titulo, children }) {
  return (
    <section className="mb-stack-loose">
      <h3 className="font-headline-md text-[18px] uppercase tracking-wide mb-stack-base text-surface-tint">
        {titulo}
      </h3>
      <div className="pb-stack-base border-b border-dashed border-outline-variant">
        {children}
      </div>
    </section>
  );
}

function Campo({ label, children }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="font-body-sm text-body-sm">{label}</span>
      {children}
    </div>
  );
}

function Perfil() {
  return (
    <Secao titulo="PERFIL">
      <div className="flex items-center justify-between pb-stack-base border-b border-dashed border-outline-variant hover:bg-surface-container-low transition-colors cursor-pointer group p-2 -mx-2">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary bg-surface-variant flex items-center justify-center overflow-hidden grayscale">
            <span className="material-symbols-outlined text-primary text-2xl">person</span>
          </div>
          <div>
            <p className="font-body-lg text-body-lg font-bold text-primary">João Silva</p>
            <p className="font-value-sm text-value-sm text-on-surface-variant">joao@pizzaria.com.br</p>
          </div>
        </div>
        <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors">
          chevron_right
        </span>
      </div>
    </Secao>
  );
}

function ContasList({ contas }) {
  return (
    <Secao titulo="CONTAS">
      <div className="flex flex-col gap-2">
        {contas.map((conta) => (
          <div
            key={conta.id}
            className="flex justify-between items-center p-2 hover:bg-surface-container-low transition-colors group cursor-pointer -mx-2 rounded"
          >
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-outline">
                {conta.tipo === 'Comercial' ? 'storefront' : 'person'}
              </span>
              <span className="font-value-sm text-value-sm">{conta.nome}</span>
            </div>
            <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-sm">
              edit
            </span>
          </div>
        ))}
        <button
          type="button"
          className="mt-2 text-left font-label-caps text-label-caps text-primary border-2 border-primary p-2 uppercase hover:bg-primary hover:text-on-primary transition-colors inline-block w-max"
        >
          + NOVA CONTA
        </button>
      </div>
    </Secao>
  );
}

function Categorias() {
  return (
    <Secao titulo="CATEGORIAS">
      <div className="flex flex-col gap-2">
        <CategoriaRow cor="#96d4b2" borda="#001008" nome="Entrada" />
        <CategoriaRow cor="#ffdad6" borda="#ba1a1a" nome="Saída" />
        <button
          type="button"
          className="mt-2 text-left font-label-caps text-label-caps text-primary border-2 border-primary p-2 uppercase hover:bg-primary hover:text-on-primary transition-colors inline-block w-max"
        >
          + NOVA CATEGORIA
        </button>
      </div>
    </Secao>
  );
}

function CategoriaRow({ cor, borda, nome }) {
  return (
    <div className="flex justify-between items-center p-2 hover:bg-surface-container-low transition-colors group cursor-pointer -mx-2 rounded">
      <div className="flex items-center gap-3">
        <div
          className="w-3 h-3 rounded-full border"
          style={{ backgroundColor: cor, borderColor: borda }}
        />
        <span className="font-value-sm text-value-sm">{nome}</span>
      </div>
      <span className="font-label-caps text-label-caps text-outline">EDITAR</span>
    </div>
  );
}

function Preferencias() {
  return (
    <Secao titulo="PREFERÊNCIAS">
      <Campo label="Formato de Data">
        <select className="bg-transparent border-0 border-b border-primary font-value-sm text-value-sm focus:ring-0 p-1 pr-6 cursor-pointer">
          <option>dd/mm/aaaa</option>
          <option>mm/dd/aaaa</option>
          <option>aaaa-mm-dd</option>
        </select>
      </Campo>
      <Campo label="Moeda">
        <select className="bg-transparent border-0 border-b border-primary font-value-sm text-value-sm focus:ring-0 p-1 pr-6 cursor-pointer">
          <option>R$ (BRL)</option>
          <option>$ (USD)</option>
          <option>€ (EUR)</option>
        </select>
      </Campo>
      <Campo label="Tema (Claro/Escuro)">
        <Toggle />
      </Campo>
    </Secao>
  );
}

function Toggle({ checked = false }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" defaultChecked={checked} className="sr-only peer" />
      <div className="w-11 h-6 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary border-2 border-primary" />
    </label>
  );
}

function Notificacoes() {
  return (
    <Secao titulo="NOTIFICAÇÕES">
      <Campo label="Lembrete diário">
        <Toggle checked={true} />
      </Campo>
      <Campo label="Alerta de saldo baixo">
        <Toggle />
      </Campo>
    </Secao>
  );
}

function ExportarDados() {
  return (
    <Secao titulo="EXPORTAR DADOS">
      <Campo label="Período">
        <select className="bg-transparent border-0 border-b border-primary font-value-sm text-value-sm focus:ring-0 p-1 pr-6 cursor-pointer">
          <option>Este Mês</option>
          <option>Mês Passado</option>
          <option>Últimos 90 dias</option>
          <option>Todos</option>
        </select>
      </Campo>
      <button
        type="button"
        className="w-full font-label-caps text-label-caps text-primary border-2 border-primary p-3 uppercase hover:bg-primary hover:text-on-primary transition-colors flex justify-center items-center gap-2 mt-4"
      >
        <span className="material-symbols-outlined">download</span>
        BAIXAR EXTRATO (CSV/PDF)
      </button>
    </Secao>
  );
}

function Seguranca() {
  return (
    <>
      <Secao titulo="SEGURANÇA">
        <button
          type="button"
          className="text-left font-body-sm text-body-sm text-primary hover:underline underline-offset-4 decoration-primary decoration-dashed w-max"
        >
          Alterar Senha
        </button>
      </Secao>
      <div className="text-center mt-8 mb-stack-loose">
        <button
          type="button"
          className="font-label-caps text-label-caps text-error hover:underline underline-offset-4 decoration-error decoration-dashed"
        >
          EXCLUIR CONTA PERMANENTEMENTE
        </button>
      </div>
    </>
  );
}

function Sobre() {
  return (
    <footer className="text-center pt-stack-base">
      <div className="border-b border-dashed border-outline-variant border-t border-dashed border-outline-variant h-[3px] mb-4" />
      <p className="font-value-sm text-value-sm text-outline">Versão 1.2.4</p>
    </footer>
  );
}
