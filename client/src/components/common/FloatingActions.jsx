export default function FloatingActions({ onEntrada, onSaida, empty }) {
  if (empty) {
    return (
      <div className="flex gap-3 mt-6">
        <button
          onClick={onEntrada}
          className="flex-1 bg-[#105137] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:brightness-110 transition-all font-label-caps text-[12px] tracking-[0.1em]"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 700" }}>add</span>
          + ENTRADA
        </button>
        <button
          onClick={onSaida}
          className="flex-1 bg-[#B23A2E] text-white py-4 rounded-xl flex items-center justify-center gap-2 shadow-[0_2px_8px_rgba(0,0,0,0.08)] hover:brightness-110 transition-all font-label-caps text-[12px] tracking-[0.1em]"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 700" }}>remove</span>
          - SAÍDA
        </button>
      </div>
    );
  }

  return (
    <>
      {/* Desktop: fixed bottom-right */}
      <div className="hidden md:flex fixed bottom-8 right-8 flex-col gap-3 z-50">
        <button
          onClick={onEntrada}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-[#105137] text-white rounded-full shadow-lg hover:shadow-xl hover:brightness-110 transition-all group"
        >
          <span className="material-symbols-outlined group-hover:rotate-90 transition-transform" style={{ fontVariationSettings: "'wght' 600" }}>add</span>
          <span className="font-label-caps text-[12px] tracking-[0.1em]">+ ENTRADA</span>
        </button>
        <button
          onClick={onSaida}
          className="flex items-center gap-2.5 px-6 py-3.5 bg-[#B23A2E] text-white rounded-full shadow-lg hover:shadow-xl hover:brightness-110 transition-all group"
        >
          <span className="material-symbols-outlined group-hover:rotate-180 transition-transform" style={{ fontVariationSettings: "'wght' 600" }}>remove</span>
          <span className="font-label-caps text-[12px] tracking-[0.1em]">- SAÍDA</span>
        </button>
      </div>

      {/* Mobile: floating bottom-left */}
      <div className="md:hidden fixed bottom-24 left-4 z-50 flex flex-col gap-2">
        <button
          onClick={onEntrada}
          className="w-12 h-12 rounded-full bg-[#105137] text-white shadow-lg flex items-center justify-center hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 700" }}>add</span>
        </button>
        <button
          onClick={onSaida}
          className="w-12 h-12 rounded-full bg-[#B23A2E] text-white shadow-lg flex items-center justify-center hover:brightness-110 transition-all"
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'wght' 700" }}>remove</span>
        </button>
      </div>
    </>
  );
}
