import { create } from "zustand";
import axios from "../lib/axios.js";
import { toast } from "react-hot-toast";
import { UserStore } from "../types/index.js";
import { AxiosError } from "axios";

export const useUserStore = create<UserStore>((set, get) => ({
	user: null,
	loading: false,
	checkingAuth: true,

	signup: async ({ name, email, address, password, confirmPassword }) => {
		set({ loading: true });

		if (password !== confirmPassword) {
			set({ loading: false });
			return toast.error("Passwords do not match");
		}

		try {
			const res = await axios.post("/auth/signup", { name, email, address, password });
			set({ user: res.data, loading: false });
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>
			set({ loading: false });
			toast.error(axiosError.response?.data?.message || "An error occurred");
		}
	},
	login: async (email, password) => {
		set({ loading: true });

		try {
			const res = await axios.post("/auth/login", { email, password });

			set({ user: res.data, loading: false });
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>
			set({ loading: false });
			toast.error(axiosError.response?.data?.message || "An error occurred");
		}
	},

	logout: async () => {
		try {
			await axios.post("/auth/logout");
			set({ user: null });
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>
			toast.error(axiosError.response?.data?.message || "An error occurred during logout");
		}
	},

	checkAuth: async () => {
		set({ checkingAuth: true });
		try {
			const response = await axios.get("/auth/profile");
			set({ user: response.data, checkingAuth: false });
		} catch (error) {
			const axiosError = error as AxiosError<{ message: string }>
			console.log(axiosError.message);
			set({ checkingAuth: false, user: null });
		}
	},

	refreshToken: async () => {
		if (get().checkingAuth) return; // prevent multiple simultaneous refresh attempts

		set({ checkingAuth: true });
		try {
			const response = await axios.post("/auth/refresh-token");
			set({ checkingAuth: false });
			return response.data;
		} catch (error) {
			set({ user: null, checkingAuth: false });
			throw error;
		}
	},
}));

// TODO: Implement the axios interceptors for refreshing access token

// Axios interceptor for token refresh
let refreshPromise: Promise<void> | null = null;

axios.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                if (!refreshPromise) {
                    refreshPromise = useUserStore.getState().refreshToken();
                }
                await refreshPromise;
                refreshPromise = null;

                return axios(originalRequest); // retry original request
            } catch (refreshError) {
                useUserStore.getState().logout(); // force logout if refresh fails
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);



