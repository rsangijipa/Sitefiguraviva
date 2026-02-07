"use client";

import React from 'react';

export default function BuilderLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex-1 flex flex-col min-h-0">
            {children}
        </div>
    );
}
