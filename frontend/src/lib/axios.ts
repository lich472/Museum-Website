import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" ? "http://localhost:5001/api" : "https://museum-website.onrender.com/api",
  withCredentials: true,
});

export default axiosInstance; 
