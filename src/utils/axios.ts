// src/utils/axios.ts

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",

  withCredentials: false,
});

// Attach JWT token automatically
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Do NOT force Content-Type here.
    //
    // Axios will automatically use:
    // application/json
    //
    // for normal JSON requests, and:
    // multipart/form-data; boundary=...
    //
    // for FormData requests.

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

export default api;
// // src/utils/axios.ts

// import axios from "axios";

// const api = axios.create({
//     baseURL: import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000",
//     headers: {
//         "Content-Type": "application/json",
//     },
//     withCredentials: false,
// });

// // Attach JWT token automatically
// api.interceptors.request.use(
//     (config) => {

//         const token = localStorage.getItem("token");

//         if (token) {

//             config.headers.Authorization = `Bearer ${token}`;
//         }

//         return config;
//     },
//     (error) => {

//         return Promise.reject(error);
//     }
// );

// export default api;
