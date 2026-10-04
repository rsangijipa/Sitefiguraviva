"use client";

import React from 'react';

export default function CourseAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // We simplified this layout because CourseEditorClient now handles 
    // its own header, tabs, and course data fetching/state.
    return (
        <div className="h-full flex flex-col">
            {children}
        </div>
    );
}
