
"use client";

import { Question, Answer } from '@/types/assessment';
import { cn } from '@/lib/utils';
import { Check, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import Button from '../ui/Button';

interface QuestionRendererProps {
    question: Question;
    value?: Answer['value']; // Current answer
    onChange: (value: Answer['value']) => void;
    readOnly?: boolean;
    showFeedback?: boolean;
}

export const QuestionRenderer = ({
    question,
    value,
    onChange,
    readOnly = false,
    showFeedback = false
}: QuestionRendererProps) => {

    // --- Inputs Helpers ---

    const handleSingleSelect = (optionId: string) => {
        if (readOnly) return;
        onChange(optionId);
    };

    const handleMultiSelect = (optionId: string) => {
        if (readOnly) return;
        const current = Array.isArray(value) ? value : [];
        const newValues = current.includes(optionId)
            ? (current as string[]).filter(id => id !== optionId)
            : [...(current as string[]), optionId];
        onChange(newValues);
    };

    // --- Renderers ---

    const renderChoice = () => {
        if (question.type !== 'multiple_choice' && question.type !== 'single_choice') return null;

        return (
            <div className="space-y-3">
                {question.options.map((option) => {
                    // State Check
                    const isSelected = Array.isArray(value)
                        ? (value as string[]).includes(option.id)
                        : value === option.id;

                    // Feedback Logic (Optimistic if grading is local, or from server result)
                    // For now, simple visual style selection

                    return (
                        <div
                            key={option.id}
                            onClick={() => question.type === 'single_choice' ? handleSingleSelect(option.id) : handleMultiSelect(option.id)}
                            className={cn(
                                "relative p-4 rounded-xl border-2 transition-all cursor-pointer flex items-center gap-4",
                                isSelected
                                    ? "border-primary bg-primary/5 shadow-sm"
                                    : "border-stone-100 bg-white hover:border-primary/30 hover:bg-stone-50",
                                readOnly && "cursor-default opacity-80"
                            )}
                        >
                            {/* Checkbox/Radio Indicator */}
                            <div className={cn(
                                "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                                isSelected
                                    ? "bg-primary border-primary text-white"
                                    : "border-stone-200"
                            )}>
                                {isSelected && <Check size={14} strokeWidth={3} />}
                            </div>

                            <span className={cn("text-sm font-medium", isSelected ? "text-primary" : "text-stone-700")}>
                                {option.text}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderText = () => {
        if (question.type !== 'text') return null;

        return (
            <div className="space-y-2">
                <textarea
                    value={typeof value === 'string' ? value : ''}
                    onChange={(e) => !readOnly && onChange(e.target.value)}
                    disabled={readOnly}
                    rows={6}
                    placeholder={question.placeholder || "Digite sua resposta aqui..."}
                    className="w-full p-4 rounded-xl border border-stone-200 bg-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-shadow resize-none disabled:bg-stone-50 text-stone-800 placeholder:text-stone-400"
                />
                {question.minLength && (
                    <p className="text-xs text-stone-400 text-right">
                        {(value as string)?.length || 0} / {question.minLength} caracteres mínimos
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2 block">
                    Questão {question.type === 'text' ? 'Discursiva' : 'Objetiva'} • {question.points} pontos
                </span>
                <h3 className="text-xl font-bold text-stone-800 leading-relaxed">
                    {question.text}
                </h3>
            </div>

            {/* Body */}
            <div className="mb-6">
                {question.type === 'multiple_choice' || question.type === 'single_choice' ? renderChoice() :
                    question.type === 'text' ? renderText() :
                        null}
            </div>

            {/* Feedback (if enabled and applicable) */}
            {showFeedback && (
                <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800">
                    <p className="font-bold mb-1">Feedback do Professor:</p>
                    <p>{QuestionRenderer.name} - Feedback integration pending grading result.</p>
                </div>
            )}
        </div>
    );
};
