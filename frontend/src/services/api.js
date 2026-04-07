import axios from "axios"
import toast from "react-hot-toast"
import tokenService from "./token.service";

const baseURL = import.meta.env.VITE_API_URL;

if (!baseURL) {
    console.error("VITE_API_URL is not configured. API calls will fail.");
}

const REQUEST_TIMEOUT = 30000;

const api = axios.create({
    baseURL: baseURL ? `${baseURL}/api` : undefined,
    timeout: REQUEST_TIMEOUT,
})

const apiNfc = axios.create({
    baseURL: baseURL ? `${baseURL}/api` : undefined,
    timeout: 45000,
})

const apiHardware = axios.create({
    baseURL: baseURL ? `${baseURL}/api` : undefined,
    timeout: 60000,
})

// REQUEST INTERCEPTOR → attach JWT (hardware key is handled by backend)
api.interceptors.request.use(
    (config) => {
        const token = tokenService.get();
        const isPublicAuthRequest = config.url?.startsWith("/auth/") || config.url?.startsWith("/otp/")

        if (token && !isPublicAuthRequest) {
            config.headers.Authorization = `Bearer ${token}`
        }

        // Hardware bridge key is now handled by backend - removed from frontend for security

        return config
    },
    (error) => Promise.reject(error)
)

// apiNfc interceptor - JWT only; backend proxies hardware access
apiNfc.interceptors.request.use(
    (config) => {
        const token = tokenService.get();
        const isPublicAuthRequest = config.url?.startsWith("/auth/") || config.url?.startsWith("/otp/")

        if (token && !isPublicAuthRequest) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

// apiHardware interceptor - JWT only
apiHardware.interceptors.request.use(
    (config) => {
        const token = tokenService.get();
        const isPublicAuthRequest = config.url?.startsWith("/auth/") || config.url?.startsWith("/otp/")

        if (token && !isPublicAuthRequest) {
            config.headers.Authorization = `Bearer ${token}`
        }

        return config
    },
    (error) => Promise.reject(error)
)

// RESPONSE INTERCEPTOR → handle expiry / unauthorized / timeout
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const shouldSkipAuthRedirect = error.config?.skipAuthRedirect
        const status = error.response?.status
        const isPublicAuthRequest = error.config?.url?.startsWith("/auth/") || error.config?.url?.startsWith("/otp/")

        if (
            !shouldSkipAuthRedirect &&
            !isPublicAuthRequest &&
            status === 401
        ) {
            tokenService.clear();
            toast.error("Session expired. Please login again.");
            window.location.assign("/")
        }

        if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
            toast.error('Request timed out. Please try again.');
        }

        return Promise.reject(error)
    }
)

export { apiNfc, apiHardware };
export default api;
