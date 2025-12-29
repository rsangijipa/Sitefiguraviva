import { useState } from 'react';
import { Plus, Trash2, Edit, Save, X, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { blogService } from '../../services/blogService';

export default function BlogManager() {
    const { blogPosts, refreshData, showToast } = useApp();
    const [isEditing, setIsEditing] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);

    const initialForm = {
        type: 'blog',
        title: '',
        slug: '',
        category: '',
        date: new Date().toLocaleDateString('pt-BR'),
        image: '',
        excerpt: '',
        content: '',
        reference: '',
        featured: false
    };
    const [formData, setFormData] = useState(initialForm);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentPost) {
                await blogService.update(currentPost.id, formData);
            } else {
                const dataToSave = { ...formData };
                if (!dataToSave.slug) {
                    dataToSave.slug = dataToSave.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
                }
                await blogService.create(dataToSave);
            }
            await refreshData();
            setIsEditing(false);
            setFormData(initialForm);
            setCurrentPost(null);
            showToast("Salvo com sucesso!", "success");
        } catch (error) {
            console.error(error);
            showToast("Erro ao salvar: " + error.message, "error");
        }
    };

    const startEdit = (post) => {
        setCurrentPost(post);
        setFormData(post);
        setIsEditing(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("Sim, tenho certeza.")) {
            await blogService.delete(id);
            await refreshData();
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-serif text-primary">Diário Visual & Biblioteca</h2>
                    <p className="text-sage text-sm">Gerencie artigos do Blog e itens da Biblioteca (PDFs).</p>
                </div>
                <button
                    onClick={() => { setIsEditing(true); setCurrentPost(null); setFormData(initialForm); }}
                    className="bg-accent text-white px-6 py-3 rounded-lg flex items-center gap-2 text-sm font-bold uppercase tracking-wide hover:bg-accent/90 shadow-lg transform hover:-translate-y-1 transition-all"
                >
                    <Plus size={16} /> Nova Publicação
                </button>
            </div>

            {isEditing && (
                <div className="bg-white p-6 rounded-xl shadow-xl border border-gray-100 animate-slide-in relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-accent" />
                    <div className="flex justify-between mb-6">
                        <h3 className="font-bold text-lg text-primary">{currentPost ? 'Editar Publicação' : 'Nova Publicação'}</h3>
                        <button onClick={() => setIsEditing(false)}><X size={20} className="text-gray-400 hover:text-red-500" /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Tipo de Conteúdo</label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                    <input type="radio" name="type" value="blog" checked={formData.type === 'blog'} onChange={e => setFormData({ ...formData, type: e.target.value })} className="text-accent focus:ring-accent" />
                                    <span className="text-sm font-bold text-gray-700">Blog Post</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer bg-gray-50 px-4 py-2 rounded-lg border border-gray-200">
                                    <input type="radio" name="type" value="library" checked={formData.type === 'library'} onChange={e => setFormData({ ...formData, type: e.target.value })} className="text-accent focus:ring-accent" />
                                    <span className="text-sm font-bold text-gray-700">Item da Biblioteca (PDF)</span>
                                </label>
                            </div>
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Título</label>
                            <input required className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Categoria</label>
                            <input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="Ex: Artigo Técnico" />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Data</label>
                            <input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Imagem de Capa (URL)</label>
                            <input className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" value={formData.image} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="https://..." />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Resumo (Excerpt)</label>
                            <textarea className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" rows={2} value={formData.excerpt} onChange={e => setFormData({ ...formData, excerpt: e.target.value })} />
                        </div>

                        {formData.type === 'library' && (
                            <div className="md:col-span-2">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Referência Bibliográfica</label>
                                <textarea className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none" rows={2} value={formData.reference} onChange={e => setFormData({ ...formData, reference: e.target.value })} />
                            </div>
                        )}

                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2 tracking-wide">Conteúdo HTML (Texto Completo)</label>
                            <textarea className="w-full bg-gray-50 border border-gray-200 p-3 rounded-lg focus:ring-1 focus:ring-accent outline-none font-mono text-sm" rows={10} value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })} />
                            <p className="text-[10px] text-gray-400 mt-1">Aceita tags HTML básicas (p, b, i, ul, li).</p>
                        </div>

                        <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
                            <button type="button" onClick={() => setIsEditing(false)} className="px-6 py-3 text-gray-500 hover:text-gray-800 font-medium text-sm">Cancelar</button>
                            <button type="submit" className="bg-primary text-white px-8 py-3 rounded-lg flex items-center gap-2 hover:bg-primary/90 shadow-md font-bold text-sm uppercase tracking-wide">
                                <Save size={16} /> Salvar Publicação
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid gap-4">
                {blogPosts.map(post => (
                    <div key={post.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center group hover:shadow-lg transition-all duration-300">
                        <div className="flex items-center gap-6 w-full md:w-auto mb-4 md:mb-0">
                            <div className={`shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-white text-xs ${post.type === 'library' ? 'bg-accent' : 'bg-primary'}`}>
                                {post.type === 'library' ? 'LIB' : 'BLOG'}
                            </div>
                            <div>
                                <h4 className="font-bold text-primary text-lg">{post.title}</h4>
                                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{post.category} • {post.date}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 w-full md:w-auto justify-end">
                            <button onClick={() => startEdit(post)} className="p-2 text-primary hover:bg-primary/5 rounded-lg transition-colors" title="Editar">
                                <Edit size={18} />
                            </button>
                            <button onClick={() => handleDelete(post.id)} className="p-2 text-red-400 hover:bg-red-50 rounded-lg transition-colors" title="Excluir">
                                <Trash2 size={18} />
                            </button>
                        </div>
                    </div>
                ))}
                {blogPosts.length === 0 && (
                    <div className="text-center p-12 text-gray-400">Nenhuma publicação encontrada.</div>
                )}
            </div>
        </div>
    );
}
