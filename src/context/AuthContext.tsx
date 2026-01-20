"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    signOut as firebaseSignOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile as firebaseUpdateProfile,
    UserCredential
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface AuthContextType {
    user: User | null;
    isAdmin: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<UserCredential>;
    signUp: (email: string, password: string) => Promise<UserCredential>;
    updateProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    isAdmin: false,
    loading: true,
    signOut: async () => { },
    signIn: async () => { throw new Error("Not implemented"); },
    signUp: async () => { throw new Error("Not implemented"); },
    updateProfile: async () => { throw new Error("Not implemented"); },
});

import { useUserSync } from "@/hooks/useUserSync";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Call the sync hook
    useUserSync();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                const token = await currentUser.getIdTokenResult(true);
                setIsAdmin(!!token.claims.admin);

                // Sync logic moved to useUserSync hook
            } else {
                setIsAdmin(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
        }
    };

    const signIn = (email: string, password: string) => {
        return signInWithEmailAndPassword(auth, email, password);
    };

    const signUp = (email: string, password: string) => {
        return createUserWithEmailAndPassword(auth, email, password);
    };

    const updateProfile = async (profile: { displayName?: string; photoURL?: string }) => {
        if (auth.currentUser) {
            await firebaseUpdateProfile(auth.currentUser, profile);
            // Force refresh user state locally if needed, but onAuthStateChanged usually handles it
            setUser({ ...auth.currentUser });
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAdmin, loading, signOut, signIn, signUp, updateProfile }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
