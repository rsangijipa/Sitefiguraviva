
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { db } from '@/lib/firebase/client';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

export function useUserSync() {
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            const sync = async () => {
                try {
                    await setDoc(doc(db, "users", user.uid), {
                        email: user.email,
                        displayName: user.displayName,
                        photoURL: user.photoURL,
                        lastLogin: serverTimestamp(),
                        uid: user.uid
                    }, { merge: true });
                } catch (error) {
                    console.error("Error syncing user:", error);
                }
            };
            sync();
        }
    }, [user]);
}
