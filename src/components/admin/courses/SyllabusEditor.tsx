"use client";

import { useState } from "react";
import { Plus, Trash2, GripVertical } from "lucide-react";
import Button from "@/components/ui/Button";

export default function SyllabusEditor({
  topics,
  onChange,
}: {
  topics: string[];
  onChange: (topics: string[]) => void;
}) {
  const [newTopic, setNewTopic] = useState("");

  const addTopic = () => {
    const topic = newTopic.trim();
    if (!topic) return;
    onChange([...topics, topic]);
    setNewTopic("");
  };

  const removeTopic = (index: number) => {
    onChange(topics.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-3">
        <input
          type="text"
          value={newTopic}
          onChange={(e) => setNewTopic(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addTopic();
            }
          }}
          className="flex-1 p-4 bg-white rounded-xl border border-stone-100 focus:border-primary transition-all outline-none text-sm"
          placeholder="Ex: Fundamentos da fenomenologia em Gestalt-terapia"
        />
        <Button type="button" onClick={addTopic} leftIcon={<Plus size={16} />}>
          Adicionar
        </Button>
      </div>

      {topics.length > 0 ? (
        <ul className="space-y-2">
          {topics.map((topic, index) => (
            <li
              key={index}
              className="flex items-center gap-3 p-3 bg-white rounded-xl border border-stone-100"
            >
              <GripVertical size={16} className="text-stone-300 shrink-0" />
              <span className="flex-1 text-sm text-stone-700">{topic}</span>
              <button
                type="button"
                onClick={() => removeTopic(index)}
                className="p-1.5 text-stone-300 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-6 text-stone-400 border border-dashed border-stone-200 rounded-xl text-sm">
          Nenhum tópico adicionado ainda.
        </div>
      )}
    </div>
  );
}
