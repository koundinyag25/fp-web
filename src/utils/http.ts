import axios from "axios";

// The single http client. Same-origin /api in production (App Platform ingress);
// proxied to the backend in dev. ONLY lib/services modules should import this.
export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE ?? "/api",
});
