import React, { useState } from 'react';
import { THOUGHT_LIMITS, validateThoughtText, validateOptionalTitle } from '../schema';
import { Leaf, AlertCircle, Info } from 'lucide-react';

interface ThoughtComposerProps {
  onPlaceLeaf: (text: string, optionalTitle?: string | null) => void;
  currentLeavesCount: number;
  maxSessionLeaves: number;
  openingPrompt?: string;
  supportText?: string;
  ethicalNote?: string;
  placeholderText?: string;
}

export const ThoughtComposer: React.FC<ThoughtComposerProps> = ({
  onPlaceLeaf,
  currentLeavesCount,
  maxSessionLeaves = THOUGHT_LIMITS.MAX_SESSION_LEAVES,
  openingPrompt = 'Um lugar para pousar pensamentos.',
  supportText = 'Escreva se quiser. Você pode guardar, observar ou deixar a folha sair desta experiência.',
  ethicalNote = 'Uma folha sair da tela não significa que um pensamento precise desaparecer.',
  placeholderText = 'Escreva uma frase, se quiser',
}) => {
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const trimmedLength = text.trim().length;
  const isOverLimit = trimmedLength > THOUGHT_LIMITS.MAX_LENGTH;
  const isSessionFull = currentLeavesCount >= maxSessionLeaves;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (isSessionFull) {
      setErrorMessage(`Você atingiu o limite de ${maxSessionLeaves} folhas nesta sessão. Guarde ou retire alguma folha antes de criar uma nova.`);
      return;
    }

    const textValidation = validateThoughtText(text);
    if (!textValidation.isValid || !textValidation.data) {
      setErrorMessage(textValidation.error || 'Escreva ao menos uma palavra antes de colocar no jardim.');
      return;
    }

    const titleValidation = validateOptionalTitle(title);
    if (!titleValidation.isValid) {
      setErrorMessage(titleValidation.error || 'Título excede o limite permitido.');
      return;
    }

    onPlaceLeaf(textValidation.data, titleValidation.data);
    setText('');
    setTitle('');
  };

  return (
    <div className="p-4 sm:p-6 flex flex-col h-full bg-[#FDFAF4] select-text">
      {/* Cabeçalho da Escrita */}
      <div className="mb-4">
        <h2 className="text-lg sm:text-xl font-bold font-fraunces text-[#005A1F] mb-1">
          {openingPrompt}
        </h2>
        <p className="text-xs sm:text-sm text-[#4B4B49] leading-relaxed">
          {supportText}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col flex-1 gap-3">
        {/* Campo Título Opcional */}
        <div>
          <label
            htmlFor="thought-title-input"
            className="block text-xs font-semibold text-[#96551F] uppercase tracking-wider mb-1"
          >
            Título (opcional)
          </label>
          <input
            id="thought-title-input"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={THOUGHT_LIMITS.MAX_TITLE_LENGTH}
            placeholder="Ex.: Uma lembrança, uma ideia..."
            className="w-full px-3 py-2 text-sm bg-[#FDFAF4] border-2 border-[#D8CFBE] rounded-xl focus:border-[#005A1F] focus-visible:outline-hidden text-[#262B22] placeholder:text-[#6B6B63]/60 transition-colors"
          />
        </div>

        {/* Área de Escrita do Pensamento */}
        <div className="flex-1 flex flex-col min-h-[140px]">
          <div className="flex items-center justify-between mb-1">
            <label
              htmlFor="thought-text-area"
              className="text-xs font-semibold text-[#005A1F] uppercase tracking-wider"
            >
              Pensamento
            </label>
            <span
              className={`text-xs font-medium ${
                isOverLimit ? 'text-[#96551F] font-bold' : 'text-[#6B6B63]'
              }`}
              aria-live="polite"
            >
              {trimmedLength} / {THOUGHT_LIMITS.MAX_LENGTH}
            </span>
          </div>

          <textarea
            id="thought-text-area"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (errorMessage) setErrorMessage(null);
            }}
            placeholder={placeholderText}
            rows={4}
            className={`w-full flex-1 p-3 text-sm sm:text-base bg-[#FDFAF4] border-2 rounded-2xl focus:border-[#005A1F] focus-visible:outline-hidden text-[#262B22] placeholder:text-[#6B6B63]/60 resize-none transition-colors leading-relaxed ${
              isOverLimit ? 'border-[#96551F]' : 'border-[#D8CFBE]'
            }`}
            aria-describedby="thought-guidance-note"
            required
          />
        </div>

        {/* Mensagem de Erro de Validação */}
        {errorMessage && (
          <div
            role="alert"
            className="p-2.5 bg-[#F1E9DB] border-2 border-[#96551F] rounded-xl flex items-start gap-2 text-xs text-[#96551F]"
          >
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Nota Ética de Apoio */}
        <div
          id="thought-guidance-note"
          className="p-3 bg-[#F1E9DB]/70 border border-[#D8CFBE] rounded-xl flex items-start gap-2 text-xs text-[#4B4B49]"
        >
          <Info className="w-4 h-4 shrink-0 text-[#07614C] mt-0.5" />
          <p className="leading-normal">{ethicalNote}</p>
        </div>

        {/* Botão de Ação: Colocar no Jardim */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <span className="text-[11px] text-[#6B6B63] font-medium">
            Sessão: {currentLeavesCount}/{maxSessionLeaves} folhas
          </span>

          <button
            type="submit"
            disabled={trimmedLength === 0 || isOverLimit || isSessionFull}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#005A1F] hover:bg-[#07614C] disabled:bg-[#D8CFBE] disabled:text-[#6B6B63] text-[#FDFAF4] font-medium rounded-full transition-colors min-h-[44px] focus-visible:ring-2 focus-visible:ring-[#005A1F]"
          >
            <Leaf className="w-4 h-4 stroke-[2px]" />
            <span>Colocar no jardim</span>
          </button>
        </div>
      </form>
    </div>
  );
};
