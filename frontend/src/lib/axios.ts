import axios from "axios";

/*
 * Always the same-origin path.
 *
 * This used to be the absolute `http://localhost:5001/api` in development,
 * which bypassed the `/api` proxy in vite.config.js and made every request
 * cross-origin — so the backend's CORS allow-list had to name
 * `http://localhost:5173` exactly, and cookies were third-party. Going through
 * `/api` in both modes means the dev proxy forwards to the TypeScript backend,
 * the production build hits its own origin, and `withCredentials: true` sends
 * and stores same-origin session cookies everywhere.
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "https://museum-website.onrender.com/api",
  withCredentials: true,
});

export default axiosInstance;
