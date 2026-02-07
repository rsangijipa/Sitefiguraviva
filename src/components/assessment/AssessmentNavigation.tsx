
"use client";

import Button from '../ui/Button';
import { ChevronLeft, ChevronRight, Flag, Grid } from 'lucide-react';

interface AssessmentNavigationProps {
    currentIndex: number;
    totalQuestions: number;
    onNext: () => void;
    onPrev: () => void;
    onReview: () => void; // Open review grid
    canNext?: boolean;
    canPrev?: boolean;
    isLast?: boolean;
    onFinish: () => void;
}

export const AssessmentNavigation = ({
    currentIndex,
    totalQuestions,
    onNext,
    onPrev,
    onReview,
    canNext = true,
    canPrev = true,
    isLast = false,
    onFinish
}: AssessmentNavigationProps) => {

    const progress = ((currentIndex + 1) / totalQuestions) * 100;

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 p-4 z-50 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">

                {/* Mobile: Simple Prev/Next | Desktop: Richer UI */}

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onPrev}
                        disabled={!canPrev}
                        leftIcon={<ChevronLeft size={16} />}
                        className="hidden md:flex"
                    >
                        Anterior
                    </Button>

                    <button
                        onClick={onReview}
                        className="p-2 text-stone-500 hover:bg-stone-100 rounded-lg transition-colors flex items-center gap-2"
                        title="Ver todas as questões"
                    >
                        <Grid size={20} />
                        <span className="hidden md:inline text-sm font-medium">Revisar</span>
                    </button>

                    {/* Flag for review (future feature) */}
                    <button className="p-2 text-stone-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors">
                        <Flag size={20} />
                    </button>
                </div>

                {/* Progress Visual */}
                <div className="flex-1 max-w-xs mx-4 hidden sm:block">
                    <div className="flex justify-between text-[10px] font-bold uppercase text-stone-400 mb-1">
                        <span>Questão {currentIndex + 1} de {totalQuestions}</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-primary transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onPrev}
                        disabled={!canPrev}
                        className="md:hidden px-3"
                    >
                        <ChevronLeft size={20} />
                    </Button>

                    {isLast ? (
                        <Button
                            variant="primary"
                            size="default"
                            onClick={onFinish}
                            className="px-8 shadow-lg shadow-primary/20 hover:shadow-primary/30"
                        >
                            Finalizar Prova
                        </Button>
                    ) : (
                        <Button
                            variant="primary"
                            size="default"
                            onClick={onNext}
                            disabled={!canNext}
                            rightIcon={<ChevronRight size={16} />}
                            className="px-6"
                        >
                            Próxima
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
