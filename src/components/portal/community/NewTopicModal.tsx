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
import { createPost } from "@/actions/community";
import { useToast } from "@/context/ToastContext";

interface NewTopicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewTopicModal({ isOpen, onClose }: NewTopicModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    channel: "general",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await createPost(formData);

    if (result.success) {
      addToast("Tópico criado com sucesso!", "success");
      onClose();
      setFormData({ title: "", content: "", channel: "general" });
    } else {
      addToast(result.error || "Erro ao criar tópico", "error");
    }
    setIsLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalContent>
        <ModalHeader>
          <h2 className="font-serif text-xl font-bold text-stone-800">
            Novo Tópico
          </h2>
        </ModalHeader>
        <ModalBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              id="topic-title"
              name="title"
              label="Título"
              placeholder="Resumo do assunto..."
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              required
            />

            <div className="space-y-2">
              <label
                htmlFor="topic-channel"
                className="text-sm font-medium text-stone-600"
              >
                Canal
              </label>
              <select
                id="topic-channel"
                name="channel"
                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-primary outline-none"
                value={formData.channel}
                onChange={(e) =>
                  setFormData({ ...formData, channel: e.target.value })
                }
              >
                <option value="general">Geral</option>
                <option value="questions">Dúvidas</option>
                <option value="projects">Projetos</option>
                <option value="random">Off-topic</option>
              </select>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="topic-content"
                className="text-sm font-medium text-stone-600"
              >
                Conteúdo
              </label>
              <textarea
                id="topic-content"
                name="content"
                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-primary outline-none h-32"
                placeholder="Escreva sua mensagem aqui..."
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Publicando..." : "Publicar Tópico"}
              </Button>
            </div>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
