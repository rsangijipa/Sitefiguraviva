export default function Loading() {
    return (
        <div className="min-h-screen bg-paper p-8 flex flex-col gap-6">
            <div className="h-40 w-full bg-stone-100 animate-pulse rounded-[2.5rem]" />
            <div className="grid md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div key={i} className="h-64 bg-stone-100 animate-pulse rounded-[2rem]" />
                ))}
            </div>
        </div>
    );
}
