import Link from 'next/link';

export default async function CancelPage({ params }: { params: Promise<{ courseId: string }> }) {
    const { courseId } = await params;

    return (
        <main className="min-h-screen flex items-center justify-center bg-[#FDFCF9] p-4">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 text-center shadow-sm border border-stone-100">
                <h1 className="font-serif text-2xl text-stone-800 mb-4">Pagamento Cancelado</h1>
                <p className="text-stone-500 mb-8">O processo de assinatura não foi concluído. Nenhuma cobrança foi realizada.</p>
                <Link
                    href={`/inscricao/${courseId}`}
                    className="block w-full py-3 bg-stone-100 text-stone-600 font-bold rounded-xl hover:bg-stone-200 transition-colors"
                >
                    Tentar Novamente
                </Link>
            </div>
        </main>
    );
}
