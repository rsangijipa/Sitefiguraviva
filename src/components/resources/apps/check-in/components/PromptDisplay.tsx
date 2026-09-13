interface PromptDisplayProps {
  prompt: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  labelId?: string;
}

export function PromptDisplay({
  prompt,
  placeholder = "",
  value,
  onChange,
  labelId,
}: PromptDisplayProps) {
  return (
    <div className="space-y-3">
      <label
        htmlFor={labelId}
        className="block font-serif text-2xl leading-snug text-primary"
      >
        {prompt}
      </label>
      <textarea
        id={labelId}
        autoFocus
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={4}
        className="w-full resize-none rounded-xl border border-primary/15 bg-areia p-4 font-sans text-base text-primary placeholder:text-text/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      />
    </div>
  );
}
