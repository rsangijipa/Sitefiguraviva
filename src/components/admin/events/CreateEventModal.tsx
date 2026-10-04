"use client";

import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import { createEvent } from "@/actions/event";
import { useToast } from "@/context/ToastContext";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    startsAt: "",
    endsAt: "",
    type: "webinar" as const,
    joinUrl: "",
    location: "",
    courseId: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await createEvent(formData);

    if (result.success) {
      addToast("Evento criado com sucesso!", "success");
      onClose();
      setFormData({
        title: "",
        description: "",
        startsAt: "",
        endsAt: "",
        type: "webinar",
        joinUrl: "",
        location: "",
        courseId: "",
      });
    } else {
      addToast(result.error || "Erro ao criar evento", "error");
    }
    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <div className="flex flex-col">
            <h2 className="font-serif text-2xl font-bold text-stone-800">
              Agendar Novo Evento
            </h2>
            <p className="text-[10px] text-stone-400 uppercase tracking-widest font-bold">
              Agenda Viva & Mentorias
            </p>
          </div>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Título"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="datetime-local"
                label="Início"
                value={formData.startsAt}
                onChange={(e) =>
                  setFormData({ ...formData, startsAt: e.target.value })
                }
                required
              />
              <Input
                type="datetime-local"
                label="Fim"
                value={formData.endsAt}
                onChange={(e) =>
                  setFormData({ ...formData, endsAt: e.target.value })
                }
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-600">
                  Tipo
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200 focus:border-gold outline-none bg-stone-50/50 text-sm"
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                >
                  <option value="webinar">Online (Webinar)</option>
                  <option value="in_person">Presencial (Sede)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-stone-600">
                  Curso (Opcional)
                </label>
                <Input
                  placeholder="ID do curso se houver"
                  value={formData.courseId || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, courseId: e.target.value })
                  }
                />
              </div>
            </div>

            {formData.type === "webinar" ? (
              <Input
                label="Link da Reunião (Zoom/Meet)"
                placeholder="https://zoom.us/j/..."
                value={formData.joinUrl}
                onChange={(e) =>
                  setFormData({ ...formData, joinUrl: e.target.value })
                }
              />
            ) : (
              <Input
                label="Local detalhado"
                placeholder="Sala das Palmeiras - Sede"
                value={formData.location}
                onChange={(e) =>
                  setFormData({ ...formData, location: e.target.value })
                }
              />
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium text-stone-600">
                Descrição do Encontro
              </label>
              <textarea
                className="w-full px-4 py-3 rounded-xl border border-stone-200 focus:border-gold outline-none h-32 bg-stone-50/50 text-sm transition-all"
                placeholder="Descreva os objetivos e o que será abordado..."
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                required
              />
            </div>

            <div className="flex justify-end items-center gap-3 pt-6 border-t border-stone-50">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-bold text-stone-400 hover:text-stone-600 transition-colors uppercase tracking-widest"
                disabled={isLoading}
              >
                Cancelar
              </button>
              <Button
                type="submit"
                disabled={isLoading || !formData.title || !formData.startsAt}
                className="px-8 shadow-lg shadow-primary/20"
              >
                {isLoading ? "Agendando..." : "Confirmar Evento"}
              </Button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
