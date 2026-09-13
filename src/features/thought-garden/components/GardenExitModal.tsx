interface GardenExitModalProps {
  onContinue: () => void;
  onExit: () => void;
}

export function GardenExitModal({ onContinue, onExit }: GardenExitModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Sair sem salvar"
    >
      <div className="bg-[#FDFAF4] border border-[#D8CFBE] max-w-md w-full p-6 rounded-3xl shadow-xl space-y-4">
        <h3 className="font-serif text-xl font-bold text-[#005A1F]">
          Deseja sair sem salvar?
        </h3>
        <p className="text-sm text-[#6B6B63]">
          Ao sair, este registro n\u00e3o ser\u00e1 guardado no seu
          hist\u00f3rico.
        </p>
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onContinue}
            className="flex-1 py-3 bg-[#F1E9DB] text-[#005A1F] rounded-xl font-bold text-xs hover:bg-[#D8CFBE] transition min-h-[44px]"
          >
            Continuar aqui
          </button>
          <button
            type="button"
            onClick={onExit}
            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-bold text-xs hover:bg-red-700 transition min-h-[44px]"
          >
            Sair sem salvar
          </button>
        </div>
      </div>
    </div>
  );
}
