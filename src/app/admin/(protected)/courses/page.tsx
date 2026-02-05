"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Edit, Calendar, Users, MoreHorizontal, Search, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { adminCourseService } from '@/services/adminCourseService';
import { CourseDoc } from '@/types/lms';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';

export default function CoursesPage() {
    const router = useRouter();
    const { addToast } = useToast();
    const [courses, setCourses] = useState<CourseDoc[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        loadCourses();
    }, []);

    const loadCourses = async () => {
        setLoading(true);
        try {
            const data = await adminCourseService.getAllCourses();
            setCourses(data);
        } catch (error) {
            console.error(error);
            addToast("Erro ao carregar cursos", 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            const id = await adminCourseService.createCourse({
                title: 'Novo Curso (Sem título)',
                status: 'draft',
                coverImage: '',
                // date: 'A definir'
            });
            addToast("Rascunho criado", 'success');
            router.push(`/admin/courses/${id}`);
        } catch (error) {
            addToast("Erro ao criar curso", 'error');
        }
    };

    const handleDelete = async (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm("Tem certeza que deseja excluir este curso? Esta ação não pode ser desfeita.")) return;

        try {
            await adminCourseService.deleteCourse(id);
            addToast("Curso excluído", 'success');
            loadCourses();
        } catch (error) {
            addToast("Erro ao excluir", 'error');
        }
    };

    const filteredCourses = courses
        .filter(c =>
            c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.status.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => {
            const dateA = (a.createdAt as any)?.seconds || 0;
            const dateB = (b.createdAt as any)?.seconds || 0;
            return dateB - dateA;
        });

    return (
        <div className="space-y-8 pb-20 max-w-7xl mx-auto">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 rounded-3xl border border-stone-100 shadow-sm">
                <div>
                    <h1 className="font-serif text-3xl mb-2 text-stone-800">Cursos & Formações</h1>
                    <p className="text-stone-500 text-sm max-w-lg">Gerencie o catálogo de ensino, turmas e conteúdos.</p>
                </div>
                <Button
                    onClick={handleCreate}
                    leftIcon={<Plus size={18} />}
                    className="shadow-xl shadow-primary/20"
                >
                    Novo Curso
                </Button>
            </header>

            {/* Filters */}
            <div className="flex gap-4 items-center bg-white p-2 pl-4 rounded-xl border border-stone-100 w-full md:w-fit">
                <Search size={18} className="text-stone-400" />
                <input
                    placeholder="Buscar cursos..."
                    className="outline-none text-sm text-stone-600 w-full md:w-64 py-2"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* List */}
            {loading ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => <div key={i} className="h-64 bg-stone-100 rounded-3xl animate-pulse" />)}
                </div>
            ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <motion.div
                        layout
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        onClick={handleCreate}
                        className="min-h-[250px] border-2 border-dashed border-stone-200 hover:border-primary/40 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer text-stone-400 hover:text-primary hover:bg-stone-50 transition-all group"
                    >
                        <div className="w-16 h-16 rounded-full bg-stone-100 group-hover:bg-white flex items-center justify-center transition-colors">
                            <Plus size={32} />
                        </div>
                        <span className="font-bold text-sm">Criar Novo Curso</span>
                    </motion.div>

                    {filteredCourses.map((course) => (
                        <Link href={`/admin/courses/${course.id}`} key={course.id}>
                            <motion.div
                                layout
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="group relative bg-white rounded-[2rem] border border-stone-100 hover:border-gold/50 hover:shadow-xl hover:shadow-gold/5 transition-all overflow-hidden h-full flex flex-col"
                            >
                                {/* Status Badge */}
                                <div className={`absolute top-4 left-4 z-10 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-md ${course.status === 'open' ? 'bg-green-500/10 text-green-700' :
                                    course.status === 'draft' ? 'bg-stone-500/10 text-stone-600' :
                                        'bg-red-500/10 text-red-700'
                                    }`}>
                                    {course.status === 'open' ? 'Publicado' : course.status === 'draft' ? 'Rascunho' : course.status}
                                </div>

                                {/* Aspect Ratio Image */}
                                <div className="aspect-video bg-stone-100 relative overflow-hidden">
                                    {course.coverImage ? (
                                        <img src={course.coverImage} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                                            <Calendar size={32} />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
                                </div>

                                <div className="p-6 flex-1 flex flex-col">
                                    <h3 className="font-serif text-xl text-stone-800 mb-2 line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
                                    <p className="text-sm text-stone-500 line-clamp-2 mb-4 flex-1">{course.subtitle || course.description || 'Sem descrição.'}</p>

                                    <div className="flex items-center justify-between text-xs font-medium text-stone-400 border-t border-stone-50 pt-4 mt-auto">
                                        <span>{course.details?.duration || (course.createdAt as any)?.toDate ? (course.createdAt as any).toDate().toLocaleDateString() : 'Sem data'}</span>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={(e) => handleDelete(e, course.id)}
                                                className="p-2 hover:bg-red-50 hover:text-red-500 rounded-lg transition-colors z-20"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                            <div className="p-2 bg-stone-50 text-stone-600 rounded-lg group-hover:bg-primary group-hover:text-white transition-colors">
                                                <Edit size={16} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}

