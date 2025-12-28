import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "./firebase";

const ALLOWED_EMAILS = [
    'liliangusmao@figuraviva.com',
    'richardsangi@figuraviva.com'
];

export const authService = {
    async login(email, password) {
        try {
            // 1. Check if email is in the allowlist BEFORE even trying to auth
            if (!ALLOWED_EMAILS.includes(email)) {
                throw new Error('Acesso restrito: Este email não tem permissão administrativa.');
            }

            // 2. Authenticate with Firebase
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            const session = {
                user: user.email,
                uid: user.uid,
                token: await user.getIdToken(),
                expiry: Date.now() + 3600000 // 1 hour (client side tracking)
            };

            localStorage.setItem('fv_auth_session', JSON.stringify(session));
            return session;

        } catch (error) {
            console.error("Login Error:", error);
            if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
                throw new Error('Credenciais inválidas.');
            }
            throw error;
        }
    },

    async logout() {
        await signOut(auth);
        localStorage.removeItem('fv_auth_session');
    },

    getSession() {
        const sessionStr = localStorage.getItem('fv_auth_session');
        if (!sessionStr) return null;
        try {
            const session = JSON.parse(sessionStr);
            if (Date.now() > session.expiry) {
                this.logout();
                return null;
            }
            return session;
        } catch (e) {
            this.logout();
            return null;
        }
    },

    isAuthenticated() {
        return !!this.getSession();
    }
};
