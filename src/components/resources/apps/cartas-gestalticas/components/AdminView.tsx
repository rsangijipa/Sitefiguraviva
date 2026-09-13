import React, { useState, useMemo } from "react";
import {
  Plus,
  Upload,
  Layers,
  Search,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  X,
  RotateCcw,
  ArrowRight,
  Filter,
} from "lucide-react";
import { GestaltCard, CardType, CardCategory, CardStatus } from "../types";
import { GestaltCardView } from "./GestaltCardView";

interface AdminViewProps {
  cards: GestaltCard[];
  onSaveCard: (card: GestaltCard) => void;
  onDeleteCard: (cardId: string) => void;
  onBatchImport: (cards: GestaltCard[]) => void;
  onCloseAdmin: () => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  cards,
  onSaveCard,
  onDeleteCard,
  onBatchImport,
  onCloseAdmin,
}) => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("ALL");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterDeck, setFilterDeck] = useState("ALL");

  // Editing state
  const [editingCard, setEditingCard] = useState<GestaltCard | null>(null);
  const [previewFlipped, setPreviewFlipped] = useState(false);

  // Batch import state
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStep, setImportStep] = useState<1 | 2 | 3>(1);
  const [importRawText, setImportRawText] = useState("");
  const [importValidationResults, setImportValidationResults] = useState<{
    valid: GestaltCard[];
    errors: { line: number; message: string; raw: string }[];
  }>({ valid: [], errors: [] });

  // Decks list
  const decks = useMemo(() => {
    return Array.from(new Set(cards.map((c) => c.deck).filter(Boolean)));
  }, [cards]);

  // Filtered table cards
  const filteredCards = useMemo(() => {
    return cards.filter((card) => {
      if (filterType !== "ALL" && card.type !== filterType) return false;
      if (filterStatus !== "ALL" && card.status !== filterStatus) return false;
      if (filterDeck !== "ALL" && card.deck !== filterDeck) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          card.title.toLowerCase().includes(q) ||
          card.code.toLowerCase().includes(q) ||
          (card.author && card.author.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [cards, filterType, filterStatus, filterDeck, search]);

  const handleCreateNew = () => {
    const newId = `card-${Date.now()}`;
    const nextNum = cards.length + 1;
    const newCard: GestaltCard = {
      id: newId,
      code: `FV · C0${nextNum.toString().padStart(2, "0")}`,
      type: "CONCEITO",
      category: "Conceitos",
      title: "Novo Conceito Gestáltico",
      body: "Descrição concisa e rigorosa do conceito no formato editorial da Gestalt-terapia.",
      author: "Autor Referencial",
      work: "Obra Principal",
      year: new Date().getFullYear(),
      reference: "Referência bibliográfica curta.",
      reflection: "Pergunta reflexiva para permanecer pensando.",
      deck: "Fundamentos",
      tags: ["novo", "gestalt"],
      relatedCardIds: [],
      status: "rascunho",
      updatedAt: new Date().toISOString().split("T")[0],
    };
    setEditingCard(newCard);
    setPreviewFlipped(false);
  };

  // 3-step Importer Validation parser
  const handleProcessImportFile = () => {
    const lines = importRawText.split("\n").filter((l) => l.trim().length > 0);
    const valid: GestaltCard[] = [];
    const errors: { line: number; message: string; raw: string }[] = [];

    const allowedTypes: CardType[] = [
      "CONCEITO",
      "AUTOR",
      "CLÍNICA",
      "CAMPO",
      "FENOMENOLOGIA",
      "PERGUNTA",
    ];

    lines.forEach((line, idx) => {
      const lineNum = idx + 1;
      // Format expected: Título; Tipo; Autor; Obra; Ano; Definição; Pergunta
      const parts = line.split(";").map((p) => p.trim());
      if (parts.length < 3) {
        errors.push({
          line: lineNum,
          message:
            "Colunas insuficientes (esperado pelo menos: Título; Tipo; Definição)",
          raw: line,
        });
        return;
      }

      const [
        rawTitle,
        rawType,
        rawAuthor,
        rawWork,
        rawYear,
        rawBody,
        rawReflection,
      ] = parts;

      if (!rawTitle) {
        errors.push({
          line: lineNum,
          message: "Título/frente ausente",
          raw: line,
        });
        return;
      }

      const typeUpper = (rawType || "").toUpperCase() as CardType;
      if (!allowedTypes.includes(typeUpper)) {
        errors.push({
          line: lineNum,
          message: `Tipo inválido "${rawType}". Aceitos: ${allowedTypes.join(", ")}`,
          raw: line,
        });
        return;
      }

      const bodyText = rawBody || rawAuthor || "Definição a ser preenchida.";

      // Map type to category
      let category: CardCategory = "Conceitos";
      if (typeUpper === "AUTOR") category = "Autores";
      else if (typeUpper === "PERGUNTA") category = "Perguntas";
      else if (typeUpper === "CLÍNICA") category = "Clínica";
      else if (typeUpper === "CAMPO") category = "Campo";
      else if (typeUpper === "FENOMENOLOGIA") category = "Fenomenologia";

      const importedCard: GestaltCard = {
        id: `imp-${Date.now()}-${idx}`,
        code: `FV · ${typeUpper[0]}${(cards.length + idx + 1).toString().padStart(3, "0")}`,
        type: typeUpper,
        category,
        title: rawTitle,
        body: bodyText,
        author: rawAuthor || undefined,
        work: rawWork || undefined,
        year: rawYear ? parseInt(rawYear) || rawYear : undefined,
        reflection: rawReflection || undefined,
        deck: "Geral",
        tags: [typeUpper.toLowerCase()],
        relatedCardIds: [],
        status: "rascunho",
        updatedAt: new Date().toISOString().split("T")[0],
      };

      valid.push(importedCard);
    });

    setImportValidationResults({ valid, errors });
    setImportStep(2);
  };

  const handleConfirmImport = () => {
    if (importValidationResults.valid.length > 0) {
      onBatchImport(importValidationResults.valid);
    }
    setIsImportModalOpen(false);
    setImportStep(1);
    setImportRawText("");
  };

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-[#FDFAF4] text-[#262B22] p-4 sm:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Top Institutional Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2D8CA] pb-5">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#96551F]">
                ÁREA ADMINISTRATIVA
              </span>
              <span className="text-[10px] bg-[#E2D8CA] px-2 py-0.5 rounded-full font-mono text-[#262B22]">
                v1.2 · Acervo
              </span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl text-[#005A1F] font-normal tracking-tight mt-1">
              Cartas Gestálticas — Gestão do Acervo
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setImportStep(1);
                setIsImportModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-[#FDFAF4] hover:bg-[#F1E9DB] border border-[#E2D8CA] text-xs font-sans font-medium flex items-center gap-1.5 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Importar cartas</span>
            </button>

            <button
              onClick={handleCreateNew}
              className="px-4 py-2 rounded-xl bg-[#005A1F] hover:bg-[#004317] text-[#FDFAF4] text-xs font-sans font-medium flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nova carta</span>
            </button>

            <button
              onClick={onCloseAdmin}
              className="p-2 text-[#6B6B63] hover:text-[#262B22] hover:bg-[#F1E9DB] rounded-lg transition-colors ml-2"
              title="Voltar ao portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-[#FDFAF4] p-4 rounded-2xl border border-[#E2D8CA]">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6B6B63]" />
            <input
              type="text"
              placeholder="Buscar no acervo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#FDFAF4] border border-[#E2D8CA] rounded-xl pl-9 pr-3 py-1.5 text-xs text-[#262B22] focus:outline-none focus:border-[#005A1F]"
            />
          </div>

          {/* Tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-[#FDFAF4] border border-[#E2D8CA] rounded-xl px-3 py-1.5 text-xs text-[#262B22] focus:outline-none focus:border-[#005A1F]"
          >
            <option value="ALL">Todos os Tipos</option>
            <option value="CONCEITO">Conceito</option>
            <option value="AUTOR">Autor</option>
            <option value="CLÍNICA">Clínica</option>
            <option value="CAMPO">Campo</option>
            <option value="FENOMENOLOGIA">Fenomenologia</option>
            <option value="PERGUNTA">Pergunta</option>
          </select>

          {/* Deck */}
          <select
            value={filterDeck}
            onChange={(e) => setFilterDeck(e.target.value)}
            className="bg-[#FDFAF4] border border-[#E2D8CA] rounded-xl px-3 py-1.5 text-xs text-[#262B22] focus:outline-none focus:border-[#005A1F]"
          >
            <option value="ALL">Todos os Decks</option>
            {decks.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-[#FDFAF4] border border-[#E2D8CA] rounded-xl px-3 py-1.5 text-xs text-[#262B22] focus:outline-none focus:border-[#005A1F]"
          >
            <option value="ALL">Todos os Status</option>
            <option value="publicado">Publicado</option>
            <option value="rascunho">Rascunho</option>
            <option value="arquivado">Arquivado</option>
          </select>
        </div>

        {/* Dense Institutional DataTable */}
        <div className="bg-[#FDFAF4] border border-[#E2D8CA] rounded-2xl overflow-hidden shadow-none">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans border-collapse">
              <thead>
                <tr className="border-b border-[#E2D8CA] bg-[#F1E9DB]/50 text-[#6B6B63] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Código</th>
                  <th className="py-3 px-4">Título</th>
                  <th className="py-3 px-4">Tipo</th>
                  <th className="py-3 px-4">Autor</th>
                  <th className="py-3 px-4">Deck</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Atualização</th>
                  <th className="py-3 px-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2D8CA]/60 text-[#262B22]">
                {filteredCards.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#6B6B63]">
                      Nenhuma carta corresponde aos critérios de busca.
                    </td>
                  </tr>
                ) : (
                  filteredCards.map((card) => (
                    <tr
                      key={card.id}
                      onClick={() => {
                        setEditingCard({ ...card });
                        setPreviewFlipped(false);
                      }}
                      className="hover:bg-[#F1E9DB]/60 transition-colors cursor-pointer"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-[#96551F]">
                        {card.code}
                      </td>
                      <td className="py-3 px-4 font-serif text-sm font-medium text-[#005A1F]">
                        {card.title}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-[#F1E9DB] text-[#96551F]">
                          {card.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-[#6B6B63]">
                        {card.author || "—"}
                      </td>
                      <td className="py-3 px-4 text-[#6B6B63]">{card.deck}</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                            card.status === "publicado"
                              ? "bg-[#E7EFE9] text-[#005A1F]"
                              : card.status === "rascunho"
                                ? "bg-[#FED701]/20 text-[#96551F]"
                                : "bg-[#E2D8CA] text-[#6B6B63]"
                          }`}
                        >
                          {card.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-[11px] text-[#6B6B63]">
                        {card.updatedAt}
                      </td>
                      <td
                        className="py-3 px-4 text-right space-x-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          onClick={() => {
                            setEditingCard({ ...card });
                            setPreviewFlipped(false);
                          }}
                          className="p-1.5 text-[#6B6B63] hover:text-[#005A1F] rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteCard(card.id)}
                          className="p-1.5 text-[#6B6B63] hover:text-[#96551F] rounded transition-colors"
                          title="Excluir"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ================= 60% EDITOR / 40% PREVIEW MODAL ================= */}
      {editingCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6">
          <div
            className="fixed inset-0 bg-[#262B22]/40 backdrop-blur-[2px]"
            onClick={() => setEditingCard(null)}
          />

          <div className="relative z-10 w-full max-w-6xl h-[90vh] bg-[#FDFAF4] border border-[#E2D8CA] rounded-3xl flex flex-col overflow-hidden shadow-none">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 border-b border-[#E2D8CA] flex items-center justify-between bg-[#FDFAF4]">
              <div>
                <span className="text-[10px] font-mono tracking-widest text-[#96551F] uppercase block">
                  Editor de Carta Gestáltica
                </span>
                <h2 className="font-serif text-xl font-normal text-[#005A1F]">
                  {editingCard.title || "Nova Carta"}
                </h2>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="px-3 py-1.5 border border-[#E2D8CA] rounded-lg text-xs font-sans text-[#6B6B63] hover:bg-[#F1E9DB] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onSaveCard(editingCard);
                    setEditingCard(null);
                  }}
                  className="px-4 py-1.5 bg-[#005A1F] hover:bg-[#004317] text-[#FDFAF4] rounded-lg text-xs font-sans font-medium transition-colors"
                >
                  Salvar Carta
                </button>
              </div>
            </div>

            {/* Split Content: 60% Editor / 40% Live Preview */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
              {/* 60% Left Form Editor */}
              <div className="lg:w-[60%] h-full overflow-y-auto custom-card-scroll p-6 space-y-4 border-b lg:border-b-0 lg:border-r border-[#E2D8CA]">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Tipo */}
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B63] block mb-1">
                      Tipo da Carta *
                    </label>
                    <select
                      value={editingCard.type}
                      onChange={(e) => {
                        const tp = e.target.value as CardType;
                        let cat: CardCategory = "Conceitos";
                        if (tp === "AUTOR") cat = "Autores";
                        else if (tp === "PERGUNTA") cat = "Perguntas";
                        else if (tp === "CLÍNICA") cat = "Clínica";
                        else if (tp === "CAMPO") cat = "Campo";
                        else if (tp === "FENOMENOLOGIA") cat = "Fenomenologia";

                        setEditingCard({
                          ...editingCard,
                          type: tp,
                          category: cat,
                        });
                      }}
                      className="w-full bg-[#FDFAF4] border border-[#E2D8CA] rounded-lg p-2 text-xs text-[#262B22] focus:outline-none focus:border-[#005A1F]"
                    >
                      <option value="CONCEITO">CONCEITO</option>
                      <option value="AUTOR">AUTOR</option>
                      <option value="CLÍNICA">CLÍNICA</option>
                      <option value="CAMPO">CAMPO</option>
                      <option value="FENOMENOLOGIA">FENOMENOLOGIA</option>
                      <option value="PERGUNTA">PERGUNTA</option>
                    </select>
                  </div>

                  {/* Código */}
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B63] block mb-1">
                      Código do Fichário
                    </label>
                    <input
                      type="text"
                      value={editingCard.code}
                      onChange={(e) =>
                        setEditingCard({ ...editingCard, code: e.target.value })
                      }
                      className="w-full bg-[#FDFAF4] border border-[#E2D8CA] rounded-lg p-2 text-xs text-[#262B22] font-mono focus:outline-none focus:border-[#005A1F]"
                    />
                  </div>
                </div>

                {/* Título / Frente */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B63] block mb-1">
                    Título / Frente da Carta *
                  </label>
                  <input
                    type="text"
                    value={editingCard.title}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, title: e.target.value })
                    }
                    className="w-full bg-[#FDFAF4] border border-[#E2D8CA] rounded-lg p-2 text-xs sm:text-sm text-[#262B22] font-serif focus:outline-none focus:border-[#005A1F]"
                  />
                </div>

                {/* Texto Principal / Verso */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B63] block mb-1">
                    Texto Principal / Definição Clínica *
                  </label>
                  <textarea
                    rows={4}
                    value={editingCard.body}
                    onChange={(e) =>
                      setEditingCard({ ...editingCard, body: e.target.value })
                    }
                    className="w-full bg-[#FDFAF4] border border-[#E2D8CA] rounded-lg p-2 text-xs sm:text-sm text-[#262B22] font-sans leading-relaxed focus:outline-none focus:border-[#005A1F]"
                  />
                </div>

                {/* Bloco Areia: Pergunta complementar */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#96551F] block mb-1">
                    Para ficar com isso (Provocação complementar)
                  </label>
                  <input
                    type="text"
                    value={editingCard.reflection || ""}
                    onChange={(e) =>
                      setEditingCard({
                        ...editingCard,
                        reflection: e.target.value,
                      })
                    }
                    placeholder="Pergunta curta para ressoar..."
                    className="w-full bg-[#F1E9DB]/60 border border-[#E2D8CA] rounded-lg p-2 text-xs italic text-[#262B22] focus:outline-none focus:border-[#005A1F]"
                  />
                </div>

                {/* Metadados: Autor, Obra, Ano */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B63] block mb-1">
                      Autor
                    </label>
                    <input
                      type="text"
                      value={editingCard.author || ""}
                      onChange={(e) =>
                        setEditingCard({
                          ...editingCard,
                          author: e.target.value,
                        })
                      }
                      className="w-full bg-[#FDFAF4] border border-[#E2D8CA] rounded-lg p-2 text-xs text-[#262B22] focus:outline-none focus:border-[#005A1F]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B63] block mb-1">
                      Obra
                    </label>
                    <input
                      type="text"
                      value={editingCard.work || ""}
                      onChange={(e) =>
                        setEditingCard({ ...editingCard, work: e.target.value })
                      }
                      className="w-full bg-[#FDFAF4] border border-[#E2D8CA] rounded-lg p-2 text-xs text-[#262B22] focus:outline-none focus:border-[#005A1F]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B63] block mb-1">
                      Ano
                    </label>
                    <input
                      type="text"
                      value={editingCard.year || ""}
                      onChange={(e) =>
                        setEditingCard({ ...editingCard, year: e.target.value })
                      }
                      className="w-full bg-[#FDFAF4] border border-[#E2D8CA] rounded-lg p-2 text-xs text-[#262B22] font-mono focus:outline-none focus:border-[#005A1F]"
                    />
                  </div>
                </div>

                {/* Referência bibliográfica */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B63] block mb-1">
                    Referência Bibliográfica Curta
                  </label>
                  <input
                    type="text"
                    value={editingCard.reference || ""}
                    onChange={(e) =>
                      setEditingCard({
                        ...editingCard,
                        reference: e.target.value,
                      })
                    }
                    className="w-full bg-[#FDFAF4] border border-[#E2D8CA] rounded-lg p-2 text-xs text-[#262B22] focus:outline-none focus:border-[#005A1F]"
                  />
                </div>

                {/* Deck e Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B63] block mb-1">
                      Deck / Coleção
                    </label>
                    <input
                      type="text"
                      value={editingCard.deck}
                      onChange={(e) =>
                        setEditingCard({ ...editingCard, deck: e.target.value })
                      }
                      className="w-full bg-[#FDFAF4] border border-[#E2D8CA] rounded-lg p-2 text-xs text-[#262B22] focus:outline-none focus:border-[#005A1F]"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B63] block mb-1">
                      Status
                    </label>
                    <select
                      value={editingCard.status}
                      onChange={(e) =>
                        setEditingCard({
                          ...editingCard,
                          status: e.target.value as CardStatus,
                        })
                      }
                      className="w-full bg-[#FDFAF4] border border-[#E2D8CA] rounded-lg p-2 text-xs text-[#262B22] focus:outline-none focus:border-[#005A1F]"
                    >
                      <option value="publicado">Publicado</option>
                      <option value="rascunho">Rascunho</option>
                      <option value="arquivado">Arquivado</option>
                    </select>
                  </div>
                </div>

                {/* Aprofundamento (Expanded Notes) */}
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6B63] block mb-1">
                    Comentário Expandido (Painel Aprofundar)
                  </label>
                  <textarea
                    rows={3}
                    value={editingCard.expandedNotes || ""}
                    onChange={(e) =>
                      setEditingCard({
                        ...editingCard,
                        expandedNotes: e.target.value,
                      })
                    }
                    className="w-full bg-[#FDFAF4] border border-[#E2D8CA] rounded-lg p-2 text-xs text-[#262B22] leading-relaxed focus:outline-none focus:border-[#005A1F]"
                  />
                </div>
              </div>

              {/* 40% Right Real-time Live Preview */}
              <div className="lg:w-[40%] bg-[#F1E9DB]/30 flex flex-col items-center justify-center p-6 select-none">
                <div className="flex items-center justify-between w-full max-w-[340px] mb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#96551F]">
                    Prévia em tempo real
                  </span>
                  <button
                    type="button"
                    onClick={() => setPreviewFlipped(!previewFlipped)}
                    className="text-xs font-sans text-[#005A1F] flex items-center gap-1 hover:underline"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>{previewFlipped ? "Ver Frente" : "Ver Verso"}</span>
                  </button>
                </div>

                <GestaltCardView
                  card={editingCard}
                  isFlipped={previewFlipped}
                  onFlip={() => setPreviewFlipped(!previewFlipped)}
                  size="preview"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 3-STEP BATCH IMPORTER MODAL ================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-[#262B22]/40 backdrop-blur-[2px]"
            onClick={() => setIsImportModalOpen(false)}
          />

          <div className="relative z-10 w-full max-w-2xl bg-[#FDFAF4] border border-[#E2D8CA] rounded-3xl p-6 space-y-6 overflow-hidden">
            {/* Steps Header */}
            <div className="flex items-center justify-between border-b border-[#E2D8CA] pb-4">
              <div>
                <h3 className="font-serif text-xl text-[#005A1F] font-normal">
                  Importar Cartas em Lote
                </h3>
                <div className="flex items-center gap-3 mt-1 text-xs font-sans text-[#6B6B63]">
                  <span
                    className={
                      importStep === 1 ? "text-[#005A1F] font-semibold" : ""
                    }
                  >
                    1. Dados do Arquivo
                  </span>
                  <span>→</span>
                  <span
                    className={
                      importStep === 2 ? "text-[#005A1F] font-semibold" : ""
                    }
                  >
                    2. Conferência de Linhas
                  </span>
                  <span>→</span>
                  <span
                    className={
                      importStep === 3 ? "text-[#005A1F] font-semibold" : ""
                    }
                  >
                    3. Conclusão
                  </span>
                </div>
              </div>

              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1.5 text-[#6B6B63] hover:text-[#262B22] rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Input text / CSV */}
            {importStep === 1 && (
              <div className="space-y-4">
                <p className="text-xs font-sans text-[#6B6B63] leading-relaxed">
                  Cole os registros no formato separado por ponto-e-vírgula (
                  <code className="bg-[#F1E9DB] px-1 py-0.5 rounded">;</code>):
                  <br />
                  <span className="font-mono text-[11px] text-[#96551F]">
                    Título; Tipo; Autor; Obra; Ano; Definição; Provocação
                  </span>
                </p>

                <textarea
                  rows={8}
                  placeholder={`AWARENESS; CONCEITO; Fritz Perls; Gestalt Therapy; 1951; A awareness é o dar-se conta espontâneo...; O que está no seu corpo agora?
RETROFLEXÃO; CONCEITO; Erving Polster; Gestalt Therapy; 1973; O represamento da energia voltada contra o self...; O que você engole em silêncio?
Laura Perls; AUTOR; Laura Perls; Living at the Boundary; 1992; Co-fundadora da abordagem; Quanto suporte você precisa?`}
                  value={importRawText}
                  onChange={(e) => setImportRawText(e.target.value)}
                  className="w-full bg-[#FDFAF4] border border-[#E2D8CA] rounded-xl p-3 text-xs font-mono leading-relaxed focus:outline-none focus:border-[#005A1F]"
                />

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setIsImportModalOpen(false)}
                    className="px-4 py-2 border border-[#E2D8CA] text-xs font-sans text-[#6B6B63] rounded-xl"
                  >
                    Cancelar
                  </button>
                  <button
                    disabled={!importRawText.trim()}
                    onClick={handleProcessImportFile}
                    className="px-4 py-2 bg-[#005A1F] text-[#FDFAF4] text-xs font-sans font-medium rounded-xl hover:bg-[#004317] disabled:opacity-40 transition-colors"
                  >
                    Conferir registros
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Conferência with validation table */}
            {importStep === 2 && (
              <div className="space-y-4">
                <div className="p-3 rounded-xl bg-[#F1E9DB] text-xs font-sans flex items-center justify-between">
                  <span className="text-[#005A1F] font-medium">
                    {importValidationResults.valid.length} cartas válidas
                    encontradas
                  </span>
                  {importValidationResults.errors.length > 0 && (
                    <span className="text-[#96551F] font-medium">
                      {importValidationResults.errors.length} erros detectados
                    </span>
                  )}
                </div>

                {/* Validation Errors Table if any */}
                {importValidationResults.errors.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#96551F] block">
                      Erros de Validação por Linha
                    </span>
                    <div className="max-h-40 overflow-y-auto border border-[#E2D8CA] rounded-xl p-3 bg-[#FDFAF4] space-y-1.5 text-xs font-mono">
                      {importValidationResults.errors.map((err, i) => (
                        <div
                          key={i}
                          className="flex items-start gap-2 text-[#96551F]"
                        >
                          <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                          <span>
                            Linha {err.line} · {err.message}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Valid Cards Preview Table */}
                <div className="space-y-2">
                  <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[#6B6B63] block">
                    Prévia de Importação
                  </span>
                  <div className="max-h-44 overflow-y-auto border border-[#E2D8CA] rounded-xl divide-y divide-[#E2D8CA] text-xs font-sans">
                    {importValidationResults.valid.map((card, i) => (
                      <div
                        key={i}
                        className="p-2.5 flex items-center justify-between"
                      >
                        <div>
                          <strong className="font-serif text-[#005A1F]">
                            {card.title}
                          </strong>
                          <span className="text-[#6B6B63] ml-2 font-mono text-[10px]">
                            {card.type}
                          </span>
                        </div>
                        <span className="text-[#6B6B63] text-[11px]">
                          {card.author || "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <button
                    onClick={() => setImportStep(1)}
                    className="px-3 py-2 text-xs text-[#6B6B63] hover:underline"
                  >
                    ← Editar dados
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsImportModalOpen(false)}
                      className="px-4 py-2 border border-[#E2D8CA] text-xs text-[#6B6B63] rounded-xl"
                    >
                      Cancelar
                    </button>
                    <button
                      disabled={importValidationResults.valid.length === 0}
                      onClick={handleConfirmImport}
                      className="px-4 py-2 bg-[#005A1F] text-[#FDFAF4] text-xs font-medium rounded-xl hover:bg-[#004317] disabled:opacity-40 transition-colors"
                    >
                      Confirmar Importação (
                      {importValidationResults.valid.length})
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
