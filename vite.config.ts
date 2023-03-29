
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
    base: "",
    plugins: [
        VitePWA({
            registerType: "autoUpdate",
            includeAssets: ["vite.svg", "180.png"],
            manifest: {
                name: "5. Pk Projection",
                short_name: "Projection",
                description: "a projection comparison application",
                theme_color: "#111111",
                icons: [
                    {
                        src: "512.png",
                        sizes: "512x512",
                        type: "image/png",
                    },
                    {
                        src: "512.png",
                        sizes: "512x512",
                        type: "image/png",
                        purpose: "any maskable",
                    },
                    {
                        src: "192.png",
                        sizes: "192x192",
                        type: "image/png",
                    },
                ],
            },
            devOptions: { enabled: true },
        }),
    ]
});

