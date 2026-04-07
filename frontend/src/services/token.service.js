const TOKEN_KEY = "authToken";

const tokenService = {
    set: (token) => {
        localStorage.setItem(TOKEN_KEY, token);
    },
    get: () => {
        return localStorage.getItem(TOKEN_KEY);
    },
    clear: () => {
        localStorage.removeItem(TOKEN_KEY);
    },
    isValid: () => {
        const token = localStorage.getItem(TOKEN_KEY);
        if (!token) return false;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const currentTime = Date.now() / 1000;
            return payload.exp > currentTime;
        } catch {
            return false;
        }
    }
};

export default tokenService;
