"use client";

import { Save, Plus, Trash2, Edit2, X, Upload, Loader2 } from "lucide-react";
import Image from "next/image";

interface MemberForm {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  order: number;
}

interface TeamSettingsProps {
  teamMembers: any[];
  memberForm: MemberForm;
  setMemberForm: (value: any) => void;
  editingMember: string | null;
  setEditingMember: (value: string | null) => void;
  isAddingMember: boolean;
  setIsAddingMember: (value: boolean) => void;
  handleSaveMember: () => Promise<void>;
  startEditMember: (member: any) => void;
  handleDeleteMember: (id: string) => Promise<void>;
  handleFileUpload: (
    e: React.ChangeEvent<HTMLInputElement>,
    target: "founder" | "team",
  ) => Promise<void>;
  uploading: boolean;
  loading: boolean;
}

export default function TeamSettings({
  teamMembers,
  memberForm,
  setMemberForm,
  editingMember,
  setEditingMember,
  isAddingMember,
  setIsAddingMember,
  handleSaveMember,
  startEditMember,
  handleDeleteMember,
  handleFileUpload,
  uploading,
  loading,
}: TeamSettingsProps) {
  return (
    <div className="space-y-8 animate-fade-in-up">
      <div className="flex justify-between items-center">
        <h3 className="font-serif text-2xl text-primary">Membros da Equipe</h3>
        {!isAddingMember && (
          <button
            onClick={() => {
              setIsAddingMember(true);
              setEditingMember(null);
              setMemberForm({
                id: "",
                name: "",
                role: "",
                bio: "",
                image: "",
                order: 0,
              });
            }}
            className="bg-gold text-white px-4 py-2 rounded-lg font-bold uppercase tracking-widest text-xs flex items-center gap-2 hover:bg-gold-dark transition-colors"
          >
            <Plus size={16} /> Novo Membro
          </button>
        )}
      </div>

      {isAddingMember && (
        <div className="bg-white p-6 rounded-xl border-l-4 border-gold shadow-md">
          <h4 className="font-bold text-primary mb-4">
            {editingMember ? "Editar Membro" : "Novo Membro"}
          </h4>
          <div className="grid md:grid-cols-2 gap-4 mb-4">
            <div className="flex gap-4 items-center">
              <div className="w-20 h-20 rounded-lg overflow-hidden bg-stone-100 border relative group">
                {memberForm.image ? (
                  <div className="w-full h-full relative">
                    <Image
                      src={memberForm.image}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                    <button
                      onClick={() =>
                        setMemberForm({ ...memberForm, image: "" })
                      }
                      className="absolute inset-0 bg-black/50 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-stone-300">
                    <Upload size={24} />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => handleFileUpload(e, "team")}
                  disabled={uploading}
                />
                {uploading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <Loader2 className="animate-spin" size={16} />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">
                  Foto do Membro
                </p>
                <input
                  placeholder="Nome"
                  className="w-full p-3 bg-stone-50 border rounded-lg mb-2"
                  value={memberForm.name}
                  onChange={(e) =>
                    setMemberForm({ ...memberForm, name: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <input
                placeholder="Papel/Cargo"
                className="p-3 bg-stone-50 border rounded-lg"
                value={memberForm.role}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, role: e.target.value })
                }
              />
              <input
                placeholder="Bio curta"
                className="p-3 bg-stone-50 border rounded-lg"
                value={memberForm.bio}
                onChange={(e) =>
                  setMemberForm({ ...memberForm, bio: e.target.value })
                }
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveMember}
                disabled={loading}
                className="bg-primary text-white px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-2"
              >
                <Save size={14} /> Salvar
              </button>
              <button
                onClick={() => setIsAddingMember(false)}
                className="bg-stone-200 text-stone-600 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member: any) => (
          <div
            key={member.id}
            className="bg-white p-6 rounded-xl border border-stone-100 hover:shadow-lg transition-all group relative"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-stone-100 relative">
                {member.image ? (
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-bold text-stone-300">
                    ?
                  </div>
                )}
              </div>
              <div>
                <h5 className="font-bold text-primary">{member.name}</h5>
                <span className="text-[10px] uppercase font-bold text-stone-400">
                  {member.role}
                </span>
              </div>
            </div>
            <p className="text-sm text-stone-500 line-clamp-2">{member.bio}</p>

            <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => startEditMember(member)}
                className="p-2 bg-stone-100 text-primary rounded hover:bg-gold hover:text-white transition-colors"
              >
                <Edit2 size={14} />
              </button>
              <button
                onClick={() => handleDeleteMember(member.id)}
                className="p-2 bg-stone-100 text-red-500 rounded hover:bg-red-500 hover:text-white transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
