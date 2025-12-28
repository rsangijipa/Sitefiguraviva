import { auth } from './firebase';
import { 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'firebase/auth';

export const authService = {
    login: async (email, password) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error("Login error:", error);
            throw error;
        }
    },

    logout: async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error:", error);
            throw error;
        }
    },

    onAuthStateChanged: (callback) => {
        return onAuthStateChanged(auth, callback);
    }
};
