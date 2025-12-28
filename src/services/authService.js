const AUTH_KEY = 'fv_auth_session';

const ADMIN_USER = import.meta.env.VITE_ADMIN_USER || 'admin';
const ADMIN_HASH = import.meta.env.VITE_ADMIN_PASS_HASH || '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918'; // default to hash of 'admin'

async function hash(string) {
    const utf8 = new TextEncoder().encode(string);
    const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export const authService = {
    async login(username, password) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        const passwordHash = await hash(password);

        if (username === ADMIN_USER && passwordHash === ADMIN_HASH) {
            const session = {
                user: username,
                token: 'mock-jwt-token-' + Date.now(),
                expiry: Date.now() + 3600000 // 1 hour
            };
            localStorage.setItem(AUTH_KEY, JSON.stringify(session));
            return session;
        }
        throw new Error('Credenciais inválidas');
    },

    logout() {
        localStorage.removeItem(AUTH_KEY);
    },

    getSession() {
        const sessionStr = localStorage.getItem(AUTH_KEY);
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
