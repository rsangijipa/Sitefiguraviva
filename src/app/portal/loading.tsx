export default function Loading() {
    return (
        <div className="space-y-8 p-4 animate-pulse">
            <div className="h-8 bg-stone-100 rounded-lg w-1/3 mb-8"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map(i => (
                    <div key={i} className="aspect-video bg-stone-100 rounded-xl border border-stone-50"></div>
                ))}
            </div>
        </div>
    );
}
