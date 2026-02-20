
import { defineConfig } from 'vite';

export default defineConfig({
    server: {
        host: '0.0.0.0',
        port: 5173,
        // Ensure strict port to avoid confusion if port is taken
        strictPort: true,
    }
});
