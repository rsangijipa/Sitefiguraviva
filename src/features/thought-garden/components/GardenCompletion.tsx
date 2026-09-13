import { History } from "lucide-react";

interface GardenCompletionProps {
  onContinue: () => void;
  onViewHistory: () => void;
}

export function GardenCompletion({
  onContinue,
  onViewHistory,
}: GardenCompletionProps) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6 bg-[#FDFAF4]">
      <div className="max-w-md w-full bg-[#FDFAF4] border border-[#D8CFBE] p-8 rounded-3xl shadow-sm text-center space-y-6">
        <div className="w-16 h-16 bg-[#F1E9DB] text-[#005A1F] rounded-2xl flex items-center justify-center mx-auto border border-[#D8CFBE]">
          <History size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="font-serif text-2xl font-bold text-[#005A1F]">
            Jardim Encerrado
          </h2>
          <p className="text-sm text-[#6B6B63]">
            Voc\u00ea pode voltar quando quiser.
          </p>
        </div>
        <div className="pt-4 space-y-3">
          <button
            type="button"
            onClick={onContinue}
            className="w-full py-3 bg-[#005A1F] text-white rounded-xl font-bold text-sm hover:bg-[#07614C] transition min-h-[44px]"
          >
            Continuar no jardim
          </button>
          <button
            type="button"
            onClick={onViewHistory}
            className="w-full py-3 bg-[#F1E9DB] text-[#005A1F] rounded-xl font-bold text-sm hover:bg-[#D8CFBE] transition min-h-[44px]"
          >
            Ver pensamentos guardados
          </button>
        </div>
      </div>
    </div>
  );
}
