export default function MobileTopBar() {
  return (
    <header className="md:hidden flex justify-between items-center px-margin-mobile py-4 w-full bg-surface border-b border-outline-variant sticky top-0 z-30">
      <div className="flex items-center gap-xs">
        <span className="material-symbols-outlined text-primary">menu</span>
        <h1 className="font-headline-lg-mobile text-headline-lg-mobile font-bold text-primary">FinSync</h1>
      </div>
      <div className="flex gap-sm">
        <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
        <span className="material-symbols-outlined text-on-surface-variant">account_circle</span>
      </div>
    </header>
  );
}
