// config.js
const API_URL =
  process.env.NODE_ENV === "production"
    ? "https://your-app-name.onrender.com/api"
    : "http://localhost:5000/api";

export default API_URL;
