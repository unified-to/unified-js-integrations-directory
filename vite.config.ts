import { defineConfig } from 'vite';

// ES module + CommonJS builds of src/index.ts, for bundlers
export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            formats: ['es', 'cjs'],
            fileName: (format) => `UnifiedAPI-JS-Directory.${format === 'es' ? 'js' : 'cjs'}`,
        },
    },
});
