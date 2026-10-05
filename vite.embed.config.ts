import { defineConfig } from 'vite';

// Self-contained <script> build of src/embed.ts, served by the API as /docs/unified.js.
// The file name must stay `unified.js`: the script finds its own <script> tag (and its query parameters) by that name.
export default defineConfig({
    build: {
        emptyOutDir: false,
        lib: {
            entry: 'src/embed.ts',
            formats: ['iife'],
            name: 'UnifiedDirectory',
            fileName: () => 'unified.js',
        },
    },
});
