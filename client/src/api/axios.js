import axios from 'axios';

const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 
           (isLocalhost ? 'http://localhost:5000/api' : 'https://cyberxp-backend.onrender.com/api'),
});

export default API;
