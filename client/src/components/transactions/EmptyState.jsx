export default function EmptyState({ message }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] p-gutter text-center">
      <div className="mb-stack-loose relative">
        <div className="w-32 h-32 border-4 border-outline/20 rounded-full flex items-center justify-center -rotate-12 border-dashed">
          <span
            className="material-symbols-outlined text-outline/40"
            style={{ fontSize: '64px', fontVariationSettings: "'wght' 200" }}
          >
            receipt_long
          </span>
        </div>
        <div className="absolute -bottom-2 -right-2 bg-background border-2 border-outline/50 w-12 h-12 flex items-center justify-center rotate-6">
          <span className="font-headline-md text-headline-md text-outline/60">
            ?
          </span>
        </div>
      </div>
      <p className="font-body-lg text-body-lg text-on-surface-variant max-w-[280px]">
        {message}
      </p>
    </div>
  );
}
