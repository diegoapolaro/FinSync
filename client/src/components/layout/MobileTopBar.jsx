export default function MobileTopBar() {
  return (
    <header className="md:hidden bg-background flex flex-col items-center w-full max-w-receipt-width mx-auto pt-margin-page pb-stack-base px-gutter sticky top-0 z-40 border-b border-dashed border-outline-variant">
      <div className="flex justify-between items-center w-full">
        <h1 className="text-headline-lg font-headline-lg uppercase tracking-tighter text-primary">
          FINSYNC
        </h1>
        <div className="flex gap-4">
          <span className="material-symbols-outlined text-primary cursor-pointer">
            ios_share
          </span>
        </div>
      </div>
    </header>
  );
}
