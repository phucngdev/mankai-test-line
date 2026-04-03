// vite.config.ts
import { defineConfig, loadEnv } from "file:///C:/Users/ASUS/Desktop/Job/New%20folder%20(5)/fe_elearning_mankai/node_modules/.pnpm/vite@5.4.14_@types+node@20.17.17_sass@1.84.0/node_modules/vite/dist/node/index.js";
import react from "file:///C:/Users/ASUS/Desktop/Job/New%20folder%20(5)/fe_elearning_mankai/node_modules/.pnpm/@vitejs+plugin-react-swc@3._6c98f63a78ba9e8d4513488fbb705aa9/node_modules/@vitejs/plugin-react-swc/index.mjs";
import { resolve } from "path";
import dns from "dns";
import viteTsconfigPaths from "file:///C:/Users/ASUS/Desktop/Job/New%20folder%20(5)/fe_elearning_mankai/node_modules/.pnpm/vite-tsconfig-paths@4.3.2_t_a007f066cca5126793e4ed307067f193/node_modules/vite-tsconfig-paths/dist/index.mjs";
import svgrPlugin from "file:///C:/Users/ASUS/Desktop/Job/New%20folder%20(5)/fe_elearning_mankai/node_modules/.pnpm/vite-plugin-svgr@4.3.0_roll_e8318f1aaaa93c2689d692ebdb7bc73a/node_modules/vite-plugin-svgr/dist/index.js";
import vitePluginImp from "file:///C:/Users/ASUS/Desktop/Job/New%20folder%20(5)/fe_elearning_mankai/node_modules/.pnpm/vite-plugin-imp@2.4.0_vite@_1c90d75b74e957470e990e98e0985bbc/node_modules/vite-plugin-imp/dist/index.mjs";
import viteSentry from "file:///C:/Users/ASUS/Desktop/Job/New%20folder%20(5)/fe_elearning_mankai/node_modules/.pnpm/vite-plugin-sentry@1.4.0_vi_e20b90432425892bb3344d226fa77012/node_modules/vite-plugin-sentry/dist/index.mjs";
import envCompatible from "file:///C:/Users/ASUS/Desktop/Job/New%20folder%20(5)/fe_elearning_mankai/node_modules/.pnpm/vite-plugin-env-compatible@2.0.1/node_modules/vite-plugin-env-compatible/dist/index.mjs";
import { visualizer } from "file:///C:/Users/ASUS/Desktop/Job/New%20folder%20(5)/fe_elearning_mankai/node_modules/.pnpm/rollup-plugin-visualizer@5.14.0_rollup@4.34.4/node_modules/rollup-plugin-visualizer/dist/plugin/index.js";
import AutoImport from "file:///C:/Users/ASUS/Desktop/Job/New%20folder%20(5)/fe_elearning_mankai/node_modules/.pnpm/unplugin-auto-import@0.17.8_rollup@4.34.4/node_modules/unplugin-auto-import/dist/vite.js";
import tailwindcss from "file:///C:/Users/ASUS/Desktop/Job/New%20folder%20(5)/fe_elearning_mankai/node_modules/.pnpm/tailwindcss@3.4.17/node_modules/tailwindcss/lib/index.js";
import Pages from "file:///C:/Users/ASUS/Desktop/Job/New%20folder%20(5)/fe_elearning_mankai/node_modules/.pnpm/vite-plugin-pages@0.32.4_vi_6417b360dedf4d9757007fdb836f94f0/node_modules/vite-plugin-pages/dist/index.js";
var __vite_injected_original_dirname = "C:\\Users\\ASUS\\Desktop\\Job\\New folder (5)\\fe_elearning_mankai";
dns.setDefaultResultOrder("verbatim");
var vite_config_default = ({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return defineConfig({
    cacheDir: ".vite",
    plugins: [
      react(),
      envCompatible(),
      viteTsconfigPaths(),
      svgrPlugin(),
      Pages(),
      viteSentry({
        url: process.env.REACT_APP_SENTRY_URL,
        authToken: process.env.REACT_APP_SENTRY_AUTH_TOKEN,
        org: process.env.REACT_APP_SENTRY_ORG,
        project: process.env.REACT_APP_SENTRY_PROJECT,
        release: "1.0",
        deploy: {
          env: "staging"
        },
        setCommits: {
          auto: true
        },
        sourceMaps: {
          include: ["./build/assets"],
          ignore: ["node_modules"],
          urlPrefix: "~/assets"
        }
      }),
      vitePluginImp({
        libList: [
          {
            libName: "antd",
            style: (name) => {
              return `antd/es/${name}/style/index.js`;
            }
          }
        ]
      }),
      AutoImport({
        imports: ["vitest"],
        dts: true
      })
    ],
    css: {
      postcss: {
        plugins: [tailwindcss()]
      }
    },
    resolve: {
      alias: [{ find: "~", replacement: resolve(__vite_injected_original_dirname, "./node_modules") }]
    },
    server: {
      port: 5e3,
      open: true
    },
    optimizeDeps: {
      include: ["@ant-design/icons"],
      esbuildOptions: {
        // Node.js global to browser globalThis
        define: {
          global: "globalThis"
        }
      }
    },
    build: {
      sourcemap: false,
      outDir: "build",
      ...process.env.ANALYZE === "true" && {
        rollupOptions: {
          cache: false,
          plugins: [
            visualizer({
              open: true,
              filename: "dist/stats.html",
              gzipSize: true,
              brotliSize: true
            })
          ]
        }
      }
    }
  });
};
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCJDOlxcXFxVc2Vyc1xcXFxBU1VTXFxcXERlc2t0b3BcXFxcSm9iXFxcXE5ldyBmb2xkZXIgKDUpXFxcXGZlX2VsZWFybmluZ19tYW5rYWlcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZmlsZW5hbWUgPSBcIkM6XFxcXFVzZXJzXFxcXEFTVVNcXFxcRGVza3RvcFxcXFxKb2JcXFxcTmV3IGZvbGRlciAoNSlcXFxcZmVfZWxlYXJuaW5nX21hbmthaVxcXFx2aXRlLmNvbmZpZy50c1wiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9pbXBvcnRfbWV0YV91cmwgPSBcImZpbGU6Ly8vQzovVXNlcnMvQVNVUy9EZXNrdG9wL0pvYi9OZXclMjBmb2xkZXIlMjAoNSkvZmVfZWxlYXJuaW5nX21hbmthaS92aXRlLmNvbmZpZy50c1wiO2ltcG9ydCB7IGRlZmluZUNvbmZpZywgbG9hZEVudiB9IGZyb20gJ3ZpdGUnO1xyXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djJztcclxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnO1xyXG5pbXBvcnQgZG5zIGZyb20gJ2Rucyc7XHJcbmltcG9ydCB2aXRlVHNjb25maWdQYXRocyBmcm9tICd2aXRlLXRzY29uZmlnLXBhdGhzJztcclxuaW1wb3J0IHN2Z3JQbHVnaW4gZnJvbSAndml0ZS1wbHVnaW4tc3Zncic7XHJcbmltcG9ydCB2aXRlUGx1Z2luSW1wIGZyb20gJ3ZpdGUtcGx1Z2luLWltcCc7XHJcbmltcG9ydCB2aXRlU2VudHJ5IGZyb20gJ3ZpdGUtcGx1Z2luLXNlbnRyeSc7XHJcbmltcG9ydCBlbnZDb21wYXRpYmxlIGZyb20gJ3ZpdGUtcGx1Z2luLWVudi1jb21wYXRpYmxlJztcclxuaW1wb3J0IHsgdmlzdWFsaXplciB9IGZyb20gJ3JvbGx1cC1wbHVnaW4tdmlzdWFsaXplcic7XHJcbmltcG9ydCBBdXRvSW1wb3J0IGZyb20gJ3VucGx1Z2luLWF1dG8taW1wb3J0L3ZpdGUnO1xyXG5pbXBvcnQgdGFpbHdpbmRjc3MgZnJvbSAndGFpbHdpbmRjc3MnO1xyXG5pbXBvcnQgUGFnZXMgZnJvbSAndml0ZS1wbHVnaW4tcGFnZXMnO1xyXG5cclxuZG5zLnNldERlZmF1bHRSZXN1bHRPcmRlcigndmVyYmF0aW0nKTtcclxuXHJcbnR5cGUgdml0ZUNvbmZpZ1Byb3BzID0ge1xyXG4gIG1vZGU6IHN0cmluZztcclxufTtcclxuXHJcbmV4cG9ydCBkZWZhdWx0ICh7IG1vZGUgfTogdml0ZUNvbmZpZ1Byb3BzKSA9PiB7XHJcbiAgcHJvY2Vzcy5lbnYgPSB7IC4uLnByb2Nlc3MuZW52LCAuLi5sb2FkRW52KG1vZGUsIHByb2Nlc3MuY3dkKCkpIH07XHJcblxyXG4gIHJldHVybiBkZWZpbmVDb25maWcoe1xyXG4gICAgY2FjaGVEaXI6ICcudml0ZScsXHJcbiAgICBwbHVnaW5zOiBbXHJcbiAgICAgIHJlYWN0KCksXHJcbiAgICAgIGVudkNvbXBhdGlibGUoKSxcclxuICAgICAgdml0ZVRzY29uZmlnUGF0aHMoKSxcclxuICAgICAgc3ZnclBsdWdpbigpLFxyXG4gICAgICBQYWdlcygpLFxyXG4gICAgICB2aXRlU2VudHJ5KHtcclxuICAgICAgICB1cmw6IHByb2Nlc3MuZW52LlJFQUNUX0FQUF9TRU5UUllfVVJMLFxyXG4gICAgICAgIGF1dGhUb2tlbjogcHJvY2Vzcy5lbnYuUkVBQ1RfQVBQX1NFTlRSWV9BVVRIX1RPS0VOLFxyXG4gICAgICAgIG9yZzogcHJvY2Vzcy5lbnYuUkVBQ1RfQVBQX1NFTlRSWV9PUkcsXHJcbiAgICAgICAgcHJvamVjdDogcHJvY2Vzcy5lbnYuUkVBQ1RfQVBQX1NFTlRSWV9QUk9KRUNULFxyXG4gICAgICAgIHJlbGVhc2U6ICcxLjAnLFxyXG4gICAgICAgIGRlcGxveToge1xyXG4gICAgICAgICAgZW52OiAnc3RhZ2luZycsXHJcbiAgICAgICAgfSxcclxuICAgICAgICBzZXRDb21taXRzOiB7XHJcbiAgICAgICAgICBhdXRvOiB0cnVlLFxyXG4gICAgICAgIH0sXHJcbiAgICAgICAgc291cmNlTWFwczoge1xyXG4gICAgICAgICAgaW5jbHVkZTogWycuL2J1aWxkL2Fzc2V0cyddLFxyXG4gICAgICAgICAgaWdub3JlOiBbJ25vZGVfbW9kdWxlcyddLFxyXG4gICAgICAgICAgdXJsUHJlZml4OiAnfi9hc3NldHMnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0pLFxyXG4gICAgICB2aXRlUGx1Z2luSW1wKHtcclxuICAgICAgICBsaWJMaXN0OiBbXHJcbiAgICAgICAgICB7XHJcbiAgICAgICAgICAgIGxpYk5hbWU6ICdhbnRkJyxcclxuICAgICAgICAgICAgc3R5bGU6IG5hbWUgPT4ge1xyXG4gICAgICAgICAgICAgIHJldHVybiBgYW50ZC9lcy8ke25hbWV9L3N0eWxlL2luZGV4LmpzYDtcclxuICAgICAgICAgICAgfSxcclxuICAgICAgICAgIH0sXHJcbiAgICAgICAgXSxcclxuICAgICAgfSksXHJcbiAgICAgIEF1dG9JbXBvcnQoe1xyXG4gICAgICAgIGltcG9ydHM6IFsndml0ZXN0J10sXHJcbiAgICAgICAgZHRzOiB0cnVlLFxyXG4gICAgICB9KSxcclxuICAgIF0sXHJcbiAgICBjc3M6IHtcclxuICAgICAgcG9zdGNzczoge1xyXG4gICAgICAgIHBsdWdpbnM6IFt0YWlsd2luZGNzcygpXSxcclxuICAgICAgfSxcclxuICAgIH0sXHJcbiAgICByZXNvbHZlOiB7XHJcbiAgICAgIGFsaWFzOiBbeyBmaW5kOiAnficsIHJlcGxhY2VtZW50OiByZXNvbHZlKF9fZGlybmFtZSwgJy4vbm9kZV9tb2R1bGVzJykgfV0sXHJcbiAgICB9LFxyXG4gICAgc2VydmVyOiB7XHJcbiAgICAgIHBvcnQ6IDUwMDAsXHJcbiAgICAgIG9wZW46IHRydWUsXHJcbiAgICB9LFxyXG4gICAgb3B0aW1pemVEZXBzOiB7XHJcbiAgICAgIGluY2x1ZGU6IFsnQGFudC1kZXNpZ24vaWNvbnMnXSxcclxuICAgICAgZXNidWlsZE9wdGlvbnM6IHtcclxuICAgICAgICAvLyBOb2RlLmpzIGdsb2JhbCB0byBicm93c2VyIGdsb2JhbFRoaXNcclxuICAgICAgICBkZWZpbmU6IHtcclxuICAgICAgICAgIGdsb2JhbDogJ2dsb2JhbFRoaXMnLFxyXG4gICAgICAgIH0sXHJcbiAgICAgIH0sXHJcbiAgICB9LFxyXG4gICAgYnVpbGQ6IHtcclxuICAgICAgc291cmNlbWFwOiBmYWxzZSxcclxuICAgICAgb3V0RGlyOiAnYnVpbGQnLFxyXG4gICAgICAuLi4ocHJvY2Vzcy5lbnYuQU5BTFlaRSA9PT0gJ3RydWUnICYmIHtcclxuICAgICAgICByb2xsdXBPcHRpb25zOiB7XHJcbiAgICAgICAgICBjYWNoZTogZmFsc2UsXHJcbiAgICAgICAgICBwbHVnaW5zOiBbXHJcbiAgICAgICAgICAgIHZpc3VhbGl6ZXIoe1xyXG4gICAgICAgICAgICAgIG9wZW46IHRydWUsXHJcbiAgICAgICAgICAgICAgZmlsZW5hbWU6ICdkaXN0L3N0YXRzLmh0bWwnLFxyXG4gICAgICAgICAgICAgIGd6aXBTaXplOiB0cnVlLFxyXG4gICAgICAgICAgICAgIGJyb3RsaVNpemU6IHRydWUsXHJcbiAgICAgICAgICAgIH0pLFxyXG4gICAgICAgICAgXSxcclxuICAgICAgICB9LFxyXG4gICAgICB9KSxcclxuICAgIH0sXHJcbiAgfSk7XHJcbn07XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBd1gsU0FBUyxjQUFjLGVBQWU7QUFDOVosT0FBTyxXQUFXO0FBQ2xCLFNBQVMsZUFBZTtBQUN4QixPQUFPLFNBQVM7QUFDaEIsT0FBTyx1QkFBdUI7QUFDOUIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxtQkFBbUI7QUFDMUIsT0FBTyxnQkFBZ0I7QUFDdkIsT0FBTyxtQkFBbUI7QUFDMUIsU0FBUyxrQkFBa0I7QUFDM0IsT0FBTyxnQkFB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
