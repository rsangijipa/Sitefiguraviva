"use client";

import { useState } from 'react';
import Button from '@/components/ui/Button';
import { Send } from 'lucide-react';

interface ReplyComposerProps {
    onReply: (content: string) => Promise<void>;
}

export default function ReplyComposer({ onReply }: ReplyComposerProps) {
    const [content, setContent] = useState('');
    const [isSending, setIsSending] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsSending(true);
        try {
            await onReply(content);
            setContent('');
        } catch (error) {
            console.error("Failed to send reply", error);
        } finally {
            setIsSending(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="bg-stone-50 p-4 rounded-xl border border-stone-200">
            <h4 className="text-xs font-bold text-stone-500 uppercase mb-2">Sua Resposta</h4>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Escreva uma resposta respeitosa..."
                className="w-full p-3 rounded-lg border border-stone-200 focus:outline-none focus:ring-2 focus:ring-primary/20 min-h-[100px] text-sm text-stone-700 bg-white"
            />
            <div className="flex justify-end mt-2">
                <Button
                    type="submit"
                    disabled={!content.trim() || isSending}
                    leftIcon={isSending ? undefined : <Send size={14} />}
                >
                    {isSending ? 'Enviando...' : 'Responder'}
                </Button>
            </div>
        </form>
    );
}
