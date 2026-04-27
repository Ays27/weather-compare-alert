export default defineNuxtConfig({
  modules: ['@nuxt/ui'],
  devtools: { enabled: true },
  srcDir: 'app',
  css: ['~/assets/css/main.css'],
  future: {
    typescriptBundlerResolution: false,
  },
  vite: {
    server: {
      allowedHosts: ['sb-290zaltoi98l.vercel.run', 'localhost'],
    },
  },
})
