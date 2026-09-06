import { defineConfig } from "vite";

const port = Number(process.env.PORT) || 8080;

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port,
  },
  preview: {
    host: "0.0.0.0",
    port,
    allowedHosts: true,
  },
});
