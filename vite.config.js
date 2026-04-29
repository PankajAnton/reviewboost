import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  // So QR tests from phone on same Wi‑Fi: npm run dev -- --host
  server: {
    host: true,
  },
});
