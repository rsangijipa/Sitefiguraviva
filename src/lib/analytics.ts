"use client";

// Simple Analytics Helper
// Can be expanded to GA4, Mixpanel, or custom Firestore logging

export async function trackEvent(eventName: string, params: Record<string, any> = {}) {
    // 1. Console Log (Dev)
    if (process.env.NODE_ENV === 'development') {
        console.group(`📊 Analytics: ${eventName}`);
        console.table(params);
        console.groupEnd();
    }

    // 2. Production Logging (e.g. Firebase Analytics or Custom Collection)
    // Uncomment to enable Firestore logging
    /*
    try {
        const { db } = await import('@/lib/firebase/client');
        const { collection, addDoc, serverTimestamp } = await import('firebase/firestore');
        await addDoc(collection(db, 'analytics_events'), {
            event: eventName,
            params,
            timestamp: serverTimestamp(),
            url: window.location.href,
            userAgent: navigator.userAgent
        });
    } catch (e) {
        console.warn('Analytics Error:', e);
    }
    */
}
