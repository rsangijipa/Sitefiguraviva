export default function BookCategoryField({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor="book-category"
        className="mb-1.5 block text-xs font-bold uppercase tracking-widest text-stone-500"
      >
        Categoria editorial
      </label>
      <input
        id="book-category"
        type="text"
        maxLength={80}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-describedby="book-category-help"
        className="w-full rounded-xl border border-stone-200 bg-white px-3.5 py-2.5 text-sm text-stone-700 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <p
        id="book-category-help"
        className="mt-2 text-xs leading-relaxed text-stone-500"
      >
        Opcional. Use a categoria definida pela curadoria; ela aparecerá nos
        filtros da Estante. Livros sem categoria continuam disponíveis.
      </p>
    </div>
  );
}
