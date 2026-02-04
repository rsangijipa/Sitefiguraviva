"use client";

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { NewTopicModal } from './NewTopicModal';

export function NewTopicButton() {
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            <Button onClick={() => setIsModalOpen(true)}>
                Novo Tópico
            </Button>

            <NewTopicModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </>
    );
}
