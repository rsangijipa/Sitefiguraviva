export default function Loading() {
  return (
    <div className="min-h-screen bg-[#FDFAF4] flex items-center justify-center p-6">
      <div className="text-center space-y-3">
        <div className="w-12 h-12 border-4 border-[#005A1F] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-medium text-[#6B6B63]">
          Carregando Roda das Emoções...
        </p>
      </div>
    </div>
  );
}
