/**
 * AdminNeedsCatalog - Gestão Editorial do Catálogo de Necessidades
 *
 * Rota: /admin/recursos/necessidades-agora
 * Permite editar cards, perguntas de reflexão, sugestões de gestos, ícones (de allowlist estrita),
 * ordem e publicar novas versões.
 * NUNCA tem acesso às anotações íntimas ou históricos dos alunos.
 */

import React, { useState } from 'react';
import {
  ShieldAlert,
  Save,
  CheckCircle,
  Smartphone,
  Monitor,
  Edit2,
  Trash2,
  Plus,
  ArrowUp,
  ArrowDown,
  Layers,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import { CurrentNeedsRepository } from '../repository';
import { CURRENT_NEEDS_CONSTRAINTS } from '../schema';
import { NeedCatalogItem, CatalogVersion } from '../types';

interface AdminNeedsCatalogProps {
  adminName: string;
  onBackToPortal: () => void;
}

export const AdminNeedsCatalog: React.FC<AdminNeedsCatalogProps> = ({
  adminName,
  onBackToPortal,
}) => {
  const [catalog, setCatalog] = useState<CatalogVersion>(() =>
    CurrentNeedsRepository.getPublishedCatalog()
  );
  const [items, setItems] = useState<NeedCatalogItem[]>(catalog.items);
  const [editorialIntro, setEditorialIntro] = useState(catalog.editorialIntro);
  const [editingItem, setEditingItem] = useState<NeedCatalogItem | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [feedback, setFeedback] = useState<string | null>(null);

  const handleSaveItem = (itemToSave: NeedCatalogItem) => {
    const existingIndex = items.findIndex((i) => i.id === itemToSave.id);
    let updated: NeedCatalogItem[];
    if (existingIndex >= 0) {
      updated = [...items];
      updated[existingIndex] = itemToSave;
    } else {
      updated = [...items, { ...itemToSave, orderIndex: items.length }];
    }
    setItems(updated);
    setEditingItem(null);
    setFeedback('Item atualizado no rascunho local.');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;

    const newItems = [...items];
    const [moved] = newItems.splice(index, 1);
    newItems.splice(targetIndex, 0, moved);

    const reordered = newItems.map((item, idx) => ({ ...item, orderIndex: idx }));
    setItems(reordered);
  };

  const handlePublishVersion = () => {
    try {
      const published = CurrentNeedsRepository.publishNewCatalogVersion(
        items,
        adminName,
        editorialIntro
      );
      setCatalog(published);
      setFeedback(`Nova versão editorial v${published.version} publicada com sucesso!`);
      setTimeout(() => setFeedback(null), 4000);
    } catch (err) {
      console.error('Erro ao publicar versão:', err);
    }
  };

  return (
    <div
      id="admin-needs-catalog-page"
      className="max-w-6xl mx-auto w-full p-4 sm:p-6 md:p-8 text-left"
    >
      {/* Cabeçalho do Admin */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b-2 border-[#D8CFBE]">
        <div>
          <button
            type="button"
            onClick={onBackToPortal}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#005A1F] hover:underline mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-2" />
            <span>Voltar ao Portal do Aluno</span>
          </button>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-[#005A1F]">
              Gestão Editorial — Necessidades Agora
            </h1>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#F1E9DB] text-[#96551F] border border-[#D8CFBE]">
              v{catalog.version}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#4B4B49] mt-1">
            Curadoria pedagógica de cartões, perguntas de reflexão e textos de acolhimento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-publish-catalog-version"
            type="button"
            onClick={handlePublishVersion}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C] transition-colors min-h-[44px]"
          >
            <Save className="w-4 h-4 stroke-2" />
            <span>Publicar Versão Oficial</span>
          </button>
        </div>
      </div>

      {/* Alerta de Segurança RLS Rigorosa */}
      <div className="mb-6 p-4 rounded-[20px] bg-[#F1E9DB] border-2 border-[#005A1F] flex items-start gap-3 text-xs text-[#262B22]">
        <ShieldAlert className="w-5 h-5 stroke-2 text-[#005A1F] shrink-0 mt-0.5" />
        <div>
          <strong className="text-[#005A1F]">Isolamento de Segurança (RLS Ativa):</strong>{' '}
          Este ambiente administrativo gerencia exclusivamente o catálogo e parâmetros
          editoriais públicos. Por diretriz do Instituto Figura Viva, administradores,
          professores e tutores <strong>não têm acesso</strong> aos dados íntimos,
          necessidades marcadas ou gestos pessoais redigidos pelos alunos.
        </div>
      </div>

      {feedback && (
        <div
          role="status"
          className="mb-6 p-3 rounded-[16px] bg-[#F1E9DB] border border-[#005A1F] text-xs sm:text-sm font-medium text-[#005A1F] flex items-center gap-2"
        >
          <CheckCircle className="w-4 h-4 stroke-2" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Seção 1: Textos de Abertura Editorial */}
      <div className="bg-[#FDFAF4] rounded-[24px] border-2 border-[#D8CFBE] p-6 mb-8">
        <h2 className="font-heading text-lg font-bold text-[#005A1F] mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 stroke-2 text-[#96551F]" />
          <span>Textos da Abertura da Experiência</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
          <div>
            <label className="font-semibold text-[#005A1F] block mb-1">
              Título da Sessão
            </label>
            <input
              type="text"
              value={editorialIntro.title}
              onChange={(e) =>
                setEditorialIntro({ ...editorialIntro, title: e.target.value })
              }
              className="w-full p-2.5 rounded-xl border border-[#D8CFBE] bg-[#FDFAF4]"
            />
          </div>

          <div>
            <label className="font-semibold text-[#005A1F] block mb-1">
              Subtítulo do Card
            </label>
            <input
              type="text"
              value={editorialIntro.subtitle}
              onChange={(e) =>
                setEditorialIntro({ ...editorialIntro, subtitle: e.target.value })
              }
              className="w-full p-2.5 rounded-xl border border-[#D8CFBE] bg-[#FDFAF4]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="font-semibold text-[#005A1F] block mb-1">
              Texto de Apoio e Acolhimento
            </label>
            <input
              type="text"
              value={editorialIntro.supportText}
              onChange={(e) =>
                setEditorialIntro({ ...editorialIntro, supportText: e.target.value })
              }
              className="w-full p-2.5 rounded-xl border border-[#D8CFBE] bg-[#FDFAF4]"
            />
          </div>
        </div>
      </div>

      {/* Seção 2: Itens do Catálogo */}
      <div className="bg-[#FDFAF4] rounded-[24px] border-2 border-[#D8CFBE] p-6 mb-8">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-[#D8CFBE]">
          <div>
            <h2 className="font-heading text-lg font-bold text-[#005A1F]">
              Cartões de Necessidades ({items.length})
            </h2>
            <p className="text-xs text-[#6B6B63]">
              Ordenação, descrições breves e perguntas de reflexão aberta.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setEditingItem({
                id: `need-${Date.now()}`,
                name: '',
                shortDescription: '',
                reflectionQuestion: '',
                gestureExample: '',
                category: 'cuidado',
                iconName: 'Sun',
                active: true,
                orderIndex: items.length,
              })
            }
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-[#F1E9DB] text-[#005A1F] border border-[#005A1F] hover:bg-[#D8CFBE] transition-colors"
          >
            <Plus className="w-4 h-4 stroke-2" />
            <span>Adicionar Necessidade</span>
          </button>
        </div>

        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="p-4 rounded-[18px] border border-[#D8CFBE] bg-[#FDFAF4] hover:bg-[#F1E9DB]/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-full bg-[#F1E9DB] text-[#005A1F] text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-[#005A1F]">{item.name}</h3>
                    <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#F1E9DB] text-[#96551F]">
                      {item.category}
                    </span>
                    <span className="text-[10px] text-[#6B6B63]">Ícone: {item.iconName}</span>
                    {!item.active && (
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                        Inativo
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#4B4B49] mt-0.5">{item.shortDescription}</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 shrink-0">
                <div className="flex items-center bg-[#F1E9DB] rounded-full p-1 border border-[#D8CFBE]">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveItem(idx, 'up')}
                    className="p-1 text-[#005A1F] hover:bg-[#FDFAF4] rounded-full disabled:opacity-30"
                    aria-label="Subir ordem"
                  >
                    <ArrowUp className="w-3.5 h-3.5 stroke-2" />
                  </button>
                  <button
                    type="button"
                    disabled={idx === items.length - 1}
                    onClick={() => handleMoveItem(idx, 'down')}
                    className="p-1 text-[#005A1F] hover:bg-[#FDFAF4] rounded-full disabled:opacity-30"
                    aria-label="Descer ordem"
                  >
                    <ArrowDown className="w-3.5 h-3.5 stroke-2" />
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setEditingItem(item)}
                  className="p-2 text-[#005A1F] hover:bg-[#F1E9DB] rounded-lg text-xs font-semibold flex items-center gap-1 border border-[#D8CFBE]"
                >
                  <Edit2 className="w-3.5 h-3.5 stroke-2" />
                  <span>Editar</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal de Edição de Item */}
      {editingItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#262B22]/60 backdrop-blur-xs"
        >
          <div className="bg-[#FDFAF4] rounded-[24px] border-2 border-[#005A1F] p-6 max-w-lg w-full text-left">
            <h3 className="font-heading text-lg font-bold text-[#005A1F] mb-4">
              {items.some((i) => i.id === editingItem.id)
                ? 'Editar Necessidade'
                : 'Nova Necessidade'}
            </h3>

            <div className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="font-semibold text-[#005A1F] block mb-1">
                  Nome da Necessidade
                </label>
                <input
                  type="text"
                  value={editingItem.name}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, name: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#D8CFBE] bg-[#FDFAF4]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#005A1F] block mb-1">
                  Descrição Curta (1–2 linhas)
                </label>
                <textarea
                  rows={2}
                  value={editingItem.shortDescription}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, shortDescription: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#D8CFBE] bg-[#FDFAF4]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#005A1F] block mb-1">
                  Pergunta de Reflexão Aberta
                </label>
                <textarea
                  rows={2}
                  value={editingItem.reflectionQuestion || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, reflectionQuestion: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#D8CFBE] bg-[#FDFAF4]"
                />
              </div>

              <div>
                <label className="font-semibold text-[#005A1F] block mb-1">
                  Exemplo de Gesto Opcional
                </label>
                <input
                  type="text"
                  value={editingItem.gestureExample || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, gestureExample: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-[#D8CFBE] bg-[#FDFAF4]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-[#005A1F] block mb-1">
                    Ícone Permitido (Allowlist)
                  </label>
                  <select
                    value={editingItem.iconName}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, iconName: e.target.value })
                    }
                    className="w-full p-2 rounded-xl border border-[#D8CFBE] bg-[#FDFAF4]"
                  >
                    {CURRENT_NEEDS_CONSTRAINTS.ALLOWED_ICONS.map((icon) => (
                      <option key={icon} value={icon}>
                        {icon}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-[#005A1F] block mb-1">
                    Disponibilidade
                  </label>
                  <select
                    value={editingItem.active ? 'active' : 'inactive'}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        active: e.target.value === 'active',
                      })
                    }
                    className="w-full p-2 rounded-xl border border-[#D8CFBE] bg-[#FDFAF4]"
                  >
                    <option value="active">Ativo no Portal</option>
                    <option value="inactive">Oculto</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#D8CFBE]">
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                className="px-4 py-2 rounded-full text-sm font-medium text-[#4B4B49] hover:bg-[#F1E9DB]"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleSaveItem(editingItem)}
                className="px-5 py-2 rounded-full text-sm font-semibold bg-[#005A1F] text-[#FDFAF4] hover:bg-[#07614C]"
              >
                Salvar Item
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
