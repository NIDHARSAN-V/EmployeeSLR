import axios from "axios";

const api = axios.create({
<<<<<<< HEAD:frontend/src/api/api.ts
  baseURL: "http://localhost:8000",
=======
  baseURL: "http://localhost:8000/",
>>>>>>> refractor/employee-api:frontend/src/lib/api.ts
  withCredentials: true, // IMPORTANT for cookies
});

export default api;
