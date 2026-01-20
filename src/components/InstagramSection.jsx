"use client";

import React from 'react';

export default function InstagramSection() {
    React.useEffect(() => {
        const script = document.createElement('script');
        script.type = 'module';
        script.src = 'https://w.behold.so/widget.js';
        document.head.appendChild(script);

        return () => {
            if (document.head.contains(script)) {
                document.head.removeChild(script);
            }
        };
    }, []);

    return (
        <section className="py-16 md:py-24 bg-surface border-t border-stone-100">
            <div className="container mx-auto px-6 max-w-6xl text-center mb-12">
                <span className="text-xs font-bold tracking-[0.2em] uppercase text-gold mb-4 block">@institutofiguraviva</span>
                <h2 className="text-3xl md:text-4xl font-serif text-primary">Nos Acompanhe no Instagram</h2>
            </div>
            <div className="container mx-auto px-6 max-w-[1400px]">
                {/* @ts-ignore */}
                <behold-widget feed-id="e6Ie6LXMRqDXJvfkbx6U"></behold-widget>
            </div>
        </section>
    );
}
