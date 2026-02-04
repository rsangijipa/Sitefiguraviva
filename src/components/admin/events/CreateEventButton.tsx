"use client";

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Plus } from 'lucide-react';
import { CreateEventModal } from './CreateEventModal';

export function CreateEventButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Button
                onClick={() => setIsModalOpen(true)}
                variant="primary"
                className="shadow-lg shadow-primary/20"
                leftIcon={<Plus size={18} />}
            >
                Novo Evento
            </Button>

            <CreateEventModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
