import Link from 'next/link';
import { FileQuestion } from 'lucide-react';
import { buttonVariants } from '@/components/ui/Button';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center">
            <div className="bg-white/50 backdrop-blur-sm p-12 rounded-[2.5rem] shadow-soft-xl max-w-lg w-full border border-stone-100">
                <div className="w-24 h-24 bg-gold/10 rounded-full flex items-center justify-center mx-auto mb-8 text-gold">
                    <FileQuestion size={48} />
                </div>

                <h1 className="font-serif text-5xl text-primary font-bold mb-4">404</h1>
                <h2 className="text-xl font-bold uppercase tracking-widest text-primary/60 mb-6">Página não encontrada</h2>

                <p className="text-primary/70 mb-10 leading-relaxed">
                    A página que você procura parece ter se perdido no caminho. Talvez ela tenha mudado de lugar ou nunca tenha existido.
                </p>

                <div className="flex flex-col gap-3">
                    <Link href="/" className={buttonVariants({ variant: 'primary', className: 'w-full justify-center' })}>
                        Voltar para o Início
                    </Link>
                    <Link href="/#instituto" className={buttonVariants({ variant: 'ghost', className: 'w-full justify-center' })}>
                        Ver Nossos Cursos
                    </Link>
                </div>
            </div>
        </div>
    );
}
