"use client";

import { useState } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { createEvent } from '@/actions/event';
import { useToast } from '@/context/ToastContext';

interface CreateEventModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function CreateEventModal({ isOpen, onClose }: CreateEventModalProps) {
    const [isLoading, setIsLoading] = useState(false);
    const { addToast } = useToast();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        startsAt: '',
        endsAt: '',
        type: 'webinar' as const,
        joinUrl: '',
        location: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const result = await createEvent(formData);

        if (result.success) {
            addToast('Evento criado com sucesso!', 'success');
            onClose();
            setFormData({ title: '', description: '', startsAt: '', endsAt: '', type: 'webinar', joinUrl: '', location: '' });
        } else {
            addToast(result.error || 'Erro ao criar evento', 'error');
        }
        setIsLoading(false);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                <ModalHeader>
                    <h2 className="font-serif text-xl font-bold text-stone-800">Novo Evento</h2>
                </ModalHeader>
                <ModalBody>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input
                            label="Título"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                type="datetime-local"
                                label="Início"
                                value={formData.startsAt}
                                onChange={(e) => setFormData({ ...formData, startsAt: e.target.value })}
                                required
                            />
                            <Input
                                type="datetime-local"
                                label="Fim"
                                value={formData.endsAt}
                                onChange={(e) => setFormData({ ...formData, endsAt: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-600">Tipo</label>
                            <select
                                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-primary outline-none"
                                value={formData.type}
                                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                            >
                                <option value="webinar">Webinar (Online)</option>
                                <option value="in_person">Presencial</option>
                            </select>
                        </div>

                        {formData.type === 'webinar' ? (
                            <Input
                                label="Link da Reunião (Zoom/Meet)"
                                value={formData.joinUrl}
                                onChange={(e) => setFormData({ ...formData, joinUrl: e.target.value })}
                            />
                        ) : (
                            <Input
                                label="Local"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-stone-600">Descrição</label>
                            <textarea
                                className="w-full px-4 py-2 rounded-lg border border-stone-200 focus:border-primary outline-none h-24"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                required
                            />
                        </div>

                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? 'Criando...' : 'Criar Evento'}
                            </Button>
                        </div>
                    </form>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
