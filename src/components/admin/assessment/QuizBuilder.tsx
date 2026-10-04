"use client";

import { useState } from "react";
import { useToast } from "@/context/ToastContext";
import { useAllCourses } from "@/hooks/useCourses";
import { createAssessment, updateAssessment } from "@/actions/assessment";
import type {
  AssessmentDoc,
  Question,
  MultipleChoiceQuestion,
} from "@/types/assessment";
import Button from "@/components/ui/Button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
} from "@/components/ui/Modal";
import { Plus, Trash2, Save, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizBuilderProps {
  courseId?: string;
  assessment?: AssessmentDoc;
  onSuccess?: (assessmentId: string) => void;
  onCancel?: () => void;
}

export default function QuizBuilder({
  courseId,
  assessment,
  onSuccess,
  onCancel,
}: QuizBuilderProps) {
  const { addToast } = useToast();
  const { data: courses } = useAllCourses();

  const [formData, setFormData] = useState<Partial<AssessmentDoc>>(
    assessment || {
      courseId: courseId || "",
      title: "",
      description: "",
      questions: [],
      passingScore: 70,
      timeLimit: null,
      maxAttempts: null,
      isRequired: false,
      shuffleQuestions: false,
      shuffleOptions: true,
      showCorrectAnswers: true,
      status: "draft",
    },
  );

  const [isSaving, setIsSaving] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);

  const addQuestion = (type: Question["type"]) => {
    const newQuestion: Partial<Question> = {
      id: `q_${Date.now()}`,
      type,
      title: "",
      points: 10,
      order: (formData.questions?.length || 0) + 1,
    };

    if (type === "multiple_choice") {
      (newQuestion as Partial<MultipleChoiceQuestion>).options = [
        { id: "opt_1", text: "", isCorrect: false },
        { id: "opt_2", text: "", isCorrect: false },
      ];
    }

    setFormData((prev) => ({
      ...prev,
      questions: [...(prev.questions || []), newQuestion as Question],
    }));

    setIsAddingQuestion(false);
  };

  const updateQuestion = (index: number, updates: Partial<Question>) => {
    setFormData((prev) => ({
      ...prev,
      questions:
        (prev.questions as Question[])?.map((q, i) =>
          i === index ? ({ ...q, ...updates } as Question) : q,
        ) || [],
    }));
  };

  const deleteQuestion = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions?.filter((_, i) => i !== index) || [],
    }));
  };

  const addOption = (questionIndex: number) => {
    const question = formData.questions?.[questionIndex];
    if (question?.type !== "multiple_choice") return;

    const newOption = {
      id: `opt_${Date.now()}`,
      text: "",
      isCorrect: false,
    };

    updateQuestion(questionIndex, {
      ...question,
      options: [...question.options, newOption],
    });
  };

  const updateOption = (
    questionIndex: number,
    optionIndex: number,
    updates: any,
  ) => {
    const question = formData.questions?.[questionIndex];
    if (question?.type !== "multiple_choice") return;

    const newOptions = question.options.map((opt, i) =>
      i === optionIndex ? { ...opt, ...updates } : opt,
    );

    updateQuestion(questionIndex, {
      ...question,
      options: newOptions,
    });
  };

  const handleSave = async () => {
    if (
      !formData.title ||
      !formData.questions ||
      formData.questions.length === 0
    ) {
      addToast("Preencha título e adicione pelo menos uma questão", "error");
      return;
    }

    // Validation
    for (const q of formData.questions) {
      if (!q.title) {
        addToast(`Questão ${q.order} precisa de um título`, "error");
        return;
      }

      if (q.type === "multiple_choice") {
        const hasCorrect = q.options.some((opt) => opt.isCorrect);
        if (!hasCorrect) {
          addToast(
            `Questão ${q.order}: Marque pelo menos uma opção correta`,
            "error",
          );
          return;
        }
      }
    }

    setIsSaving(true);

    try {
      const result = await createAssessment(formData);

      if (result.error) {
        addToast(result.error, "error");
        return;
      }

      addToast("Avaliação criada com sucesso!", "success");

      if (onSuccess && result.id) {
        onSuccess(result.id);
      }
    } catch (error) {
      console.error("Save Error:", error);
      addToast("Erro ao salvar avaliação", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Form */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">
              Título *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-primary outline-none"
              placeholder="Ex: Quiz de Avaliação - Módulo 1"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">
              Curso Relacionado *
            </label>
            <select
              value={formData.courseId}
              onChange={(e) =>
                setFormData({ ...formData, courseId: e.target.value })
              }
              className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-primary outline-none bg-white"
            >
              <option value="">Selecione um curso...</option>
              {courses?.map((course: any) => (
                <option key={course.id} value={course.id}>
                  {course.title}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-bold text-stone-700 mb-2">
            Descrição
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            className="w-full px-4 py-3 rounded-xl border-2 border-stone-200 focus:border-primary outline-none min-h-[80px] resize-y"
            placeholder="Instruções para o aluno..."
          />
        </div>

        {/* Settings Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
              Nota mínima (%)
            </label>
            <input
              type="number"
              min="0"
              max="100"
              value={formData.passingScore}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  passingScore: parseInt(e.target.value),
                })
              }
              className="w-full px-3 py-2 rounded-lg border-2 border-stone-200 focus:border-primary outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
              Tempo limite (min)
            </label>
            <input
              type="number"
              min="0"
              value={formData.timeLimit || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  timeLimit: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-3 py-2 rounded-lg border-2 border-stone-200 focus:border-primary outline-none"
              placeholder="Ilimitado"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-2 uppercase tracking-wider">
              Tentativas
            </label>
            <input
              type="number"
              min="1"
              value={formData.maxAttempts || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maxAttempts: e.target.value ? parseInt(e.target.value) : null,
                })
              }
              className="w-full px-3 py-2 rounded-lg border-2 border-stone-200 focus:border-primary outline-none"
              placeholder="Ilimitado"
            />
          </div>

          <div className="flex items-end">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isRequired}
                onChange={(e) =>
                  setFormData({ ...formData, isRequired: e.target.checked })
                }
                className="w-5 h-5 rounded border-stone-300"
              />
              <span className="text-sm font-bold text-stone-700">
                Obrigatória
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {formData.questions?.map((question, qIdx) => (
          <div
            key={question.id}
            className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold shrink-0">
                {qIdx + 1}
              </div>

              <div className="flex-1 space-y-4">
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={question.title}
                    onChange={(e) =>
                      updateQuestion(qIdx, { title: e.target.value })
                    }
                    className="flex-1 px-4 py-2 rounded-xl border-2 border-stone-200 focus:border-primary outline-none font-bold"
                    placeholder="Pergunta"
                  />
                  <input
                    type="number"
                    min="1"
                    value={question.points}
                    onChange={(e) =>
                      updateQuestion(qIdx, {
                        points: parseInt(e.target.value) || 1,
                      })
                    }
                    className="w-24 px-3 py-2 rounded-lg border-2 border-stone-200 focus:border-primary outline-none text-center"
                    placeholder="Pts"
                  />
                  <button
                    onClick={() => deleteQuestion(qIdx)}
                    className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>

                {/* Multiple Choice Options */}
                {question.type === "multiple_choice" && (
                  <div className="space-y-2">
                    {question.options.map((option, optIdx) => (
                      <div key={option.id} className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={option.isCorrect}
                          onChange={(e) =>
                            updateOption(qIdx, optIdx, {
                              isCorrect: e.target.checked,
                            })
                          }
                          className="w-5 h-5 rounded border-stone-300 text-green-600"
                        />
                        <input
                          type="text"
                          value={option.text}
                          onChange={(e) =>
                            updateOption(qIdx, optIdx, { text: e.target.value })
                          }
                          className="flex-1 px-4 py-2 rounded-lg border-2 border-stone-200 focus:border-primary outline-none"
                          placeholder={`Opção ${optIdx + 1}`}
                        />
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(qIdx)}
                      className="text-sm text-primary hover:underline"
                    >
                      + Adicionar opção
                    </button>
                  </div>
                )}

                {/* True/False */}
                {question.type === "true_false" && (
                  <div className="flex gap-3">
                    <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-stone-200 cursor-pointer hover:border-primary">
                      <input
                        type="radio"
                        checked={question.correctAnswer === true}
                        onChange={() =>
                          updateQuestion(qIdx, { correctAnswer: true })
                        }
                        className="w-4 h-4"
                      />
                      <span className="font-bold text-green-600">
                        Verdadeiro
                      </span>
                    </label>
                    <label className="flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border-2 border-stone-200 cursor-pointer hover:border-primary">
                      <input
                        type="radio"
                        checked={question.correctAnswer === false}
                        onChange={() =>
                          updateQuestion(qIdx, { correctAnswer: false })
                        }
                        className="w-4 h-4"
                      />
                      <span className="font-bold text-red-600">Falso</span>
                    </label>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Add Question Button */}
        <button
          onClick={() => setIsAddingQuestion(true)}
          className="w-full p-6 rounded-2xl border-2 border-dashed border-stone-300 hover:border-primary hover:bg-primary/5 transition-all flex items-center justify-center gap-2 text-stone-600 hover:text-primary"
        >
          <Plus size={20} />
          <span className="font-bold">Adicionar Questão</span>
        </button>
      </div>

      {/* Save Button */}
      <div className="flex justify-end gap-3">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="animate-spin" size={16} />
              Salvando...
            </>
          ) : (
            <>
              <Save size={16} />
              Salvar Avaliação
            </>
          )}
        </Button>
      </div>

      {/* Question Type Modal */}
      {isAddingQuestion && (
        <Modal
          isOpen={isAddingQuestion}
          onClose={() => setIsAddingQuestion(false)}
        >
          <ModalContent>
            <ModalHeader>
              <h2 className="text-xl font-bold font-serif text-stone-800">
                Tipo de Questão
              </h2>
            </ModalHeader>
            <ModalBody>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => addQuestion("multiple_choice")}
                  className="p-6 rounded-xl border-2 border-stone-200 hover:border-primary hover:bg-primary/5 transition-all text-left"
                >
                  <div className="font-bold text-stone-800 mb-2">
                    Múltipla Escolha
                  </div>
                  <div className="text-sm text-stone-600">
                    Correção automática
                  </div>
                </button>

                <button
                  onClick={() => addQuestion("true_false")}
                  className="p-6 rounded-xl border-2 border-stone-200 hover:border-primary hover:bg-primary/5 transition-all text-left"
                >
                  <div className="font-bold text-stone-800 mb-2">
                    Verdadeiro/Falso
                  </div>
                  <div className="text-sm text-stone-600">
                    Correção automática
                  </div>
                </button>

                <button
                  onClick={() => addQuestion("essay")}
                  className="p-6 rounded-xl border-2 border-stone-200 hover:border-primary hover:bg-primary/5 transition-all text-left"
                >
                  <div className="font-bold text-stone-800 mb-2">
                    Dissertativa
                  </div>
                  <div className="text-sm text-stone-600">Correção manual</div>
                </button>

                <button
                  onClick={() => addQuestion("practical")}
                  className="p-6 rounded-xl border-2 border-stone-200 hover:border-primary hover:bg-primary/5 transition-all text-left"
                >
                  <div className="font-bold text-stone-800 mb-2">Prática</div>
                  <div className="text-sm text-stone-600">
                    Upload de arquivo
                  </div>
                </button>
              </div>
            </ModalBody>
          </ModalContent>
        </Modal>
      )}
    </div>
  );
}
