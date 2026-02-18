import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5000/api",
});

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle Payment Required (Pending Subscription)
        if (error.response && error.response.status === 402) {
            // Check if not already on checkout page to avoid loops
            if (!window.location.pathname.includes('/checkout')) {
                window.location.href = "/checkout";
            }
        }

        // Handle Subscription Expired
        if (error.response && error.response.status === 403 && error.response.data.code === 'SUBSCRIPTION_EXPIRED') {
            if (!window.location.pathname.includes('/renew-plan')) {
                window.location.href = "/renew-plan";
            }
        }

        return Promise.reject(error);
    }
);

export default api;
