"use client";

import { createContext, useContext, useEffect, useState } from "react";
import {
    User,
    onAuthStateChanged,
    signOut as firebaseSignOut,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile as firebaseUpdateProfile,
    UserCredential
} from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { doc, getDoc } from "firebase/firestore";
import { UserRole, UserStatus } from "@/types/user";
import { useRouter } from "next/navigation";

interface AuthContextType {
    user: User | null;
    role: UserRole | null;
    status: UserStatus | null;
    isAdmin: boolean;
    loading: boolean;
    signOut: () => Promise<void>;
    signIn: (email: string, password: string) => Promise<UserCredential>;
    signUp: (email: string, password: string) => Promise<UserCredential>;
    updateProfile: (profile: { displayName?: string; photoURL?: string }) => Promise<void>;
    resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    role: null,
    status: null,
    isAdmin: false,
    loading: true,
    signOut: async () => { },
    signIn: async () => { throw new Error("Not implemented"); },
    signUp: async () => { throw new Error("Not implemented"); },
    updateProfile: async () => { throw new Error("Not implemented"); },
    resetPassword: async () => { throw new Error("Not implemented"); },
});

import { useUserSync } from "@/hooks/useUserSync";

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [role, setRole] = useState<UserRole | null>(null);
    const [status, setStatus] = useState<UserStatus | null>(null);
    const [isAdmin, setIsAdmin] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Call the sync hook
    useUserSync();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);

            if (currentUser) {
                try {
                    console.log('[AuthContext] User logged in:', currentUser.email);
                    // 1. Check Custom Claims (Fastest, good for initial check)
                    const token = await currentUser.getIdTokenResult(true);
                    const claimAdmin = !!token.claims.admin;
                    console.log('[AuthContext] Custom Claims:', { admin: token.claims.admin, role: token.claims.role });

                    // 2. Fetch Role/Status from Firestore (Source of Truth)
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userSnapshot = await getDoc(userDocRef);

                    let userRole: UserRole = 'student'; // Default
                    let userStatus: UserStatus = 'active'; // Default

                    if (userSnapshot.exists()) {
                        const data = userSnapshot.data();
                        console.log('[AuthContext] Firestore user data:', { role: data.role, status: data.status });

                        // Role Mapping
                        if (data.role) {
                            userRole = data.role as UserRole;
                        } else if (claimAdmin) {
                            userRole = 'admin';
                        }

                        // Status Mapping
                        if (data.status) {
                            userStatus = data.status as UserStatus;
                        }
                    } else {
                        console.warn('[AuthContext] No Firestore document found for user');
                        // Fallback: Use Custom Claims if no Firestore document
                        if (claimAdmin || token.claims.role === 'admin') {
                            userRole = 'admin';
                        }
                    }

                    // 3. SECURITY GUARD: Force Logout if Disabled
                    if (userStatus === 'disabled') {
                        console.warn('Account disabled. Forcing logout.');
                        await firebaseSignOut(auth);
                        setUser(null);
                        setRole(null);
                        setStatus(null);
                        setIsAdmin(false);
                        setLoading(false);
                        // Redirect to login with error (or specific disabled page)
                        router.push('/admin/login?error=disabled');
                        return;
                    }

                    setRole(userRole);
                    setStatus(userStatus);
                    setIsAdmin(userRole === 'admin' || claimAdmin);
                    console.log('[AuthContext] Final state:', { role: userRole, status: userStatus, isAdmin: userRole === 'admin' || claimAdmin });

                } catch (error) {
                    console.error("Error fetching user data:", error);
                    setRole('student');
                    setStatus('active'); // Fail safe to active unless proven disabled? Or 'disabled' for safety?
                    // Safe default: active, but if error is permission denied, they can't do much anyway.
                    setIsAdmin(false);
                }
            } else {
                setRole(null);
                setStatus(null);
                setIsAdmin(false);
            }

            setLoading(false);
        });

        return () => unsubscribe();
    }, [router]);

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            setRole(null);
            setStatus(null);
            setIsAdmin(false);
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
            setUser({ ...auth.currentUser });
        }
    };

    const resetPassword = (email: string) => {
        return sendPasswordResetEmail(auth, email);
    };

    return (
        <AuthContext.Provider value={{ user, role, status, isAdmin, loading, signOut, signIn, signUp, updateProfile, resetPassword }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
