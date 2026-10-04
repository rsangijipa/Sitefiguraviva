export default function AwarenessTreeLoading() {
  return (
    <div
      className="grid min-h-dvh place-items-center bg-[#091813] text-[#edf5ee]"
      role="status"
      aria-label="Carregando Árvore da Consciência"
    >
      <div className="text-center">
        <div className="mx-auto h-44 w-32 animate-pulse rounded-[50%_50%_45%_45%] bg-[#315c45] shadow-[0_5rem_0_-2.7rem_#88683d]" />
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.2em] text-[#d8bd79]">
          Cultivando a experiência…
        </p>
      </div>
    </div>
  );
}
