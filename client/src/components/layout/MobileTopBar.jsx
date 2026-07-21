export default function MobileTopBar() {
  return (
    <header className="md:hidden flex justify-between items-center px-margin-mobile py-4 w-full bg-surface border-b border-outline-variant sticky top-0 z-30">
      <div className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary text-2xl">menu</span>
        <h2 className="font-headline-lg text-headline-lg font-bold text-primary tracking-tight">FINSYNC</h2>
      </div>
      <div className="flex items-center gap-2">
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-high p-2 rounded-full transition-colors">notifications</span>
        <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:bg-surface-container-high p-2 rounded-full transition-colors">account_circle</span>
      </div>
    </header>
  );
}
