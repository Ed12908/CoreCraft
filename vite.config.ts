import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import type { Plugin } from "vite";
import { defineConfig } from "vite";

const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const escapeInlineScript = (code: string) => code.replace(/<\/script/gi, "<\\/script");

const escapeInlineStyle = (css: string) => css.replace(/<\/style/gi, "<\\/style");

const assetReferencePattern = (fileName: string) => `(?:\\.?/)?${escapeRegExp(fileName)}`;

const compactHtmlShell = (html: string) => html.replace(/>\s+</g, "><").trim();

const assetSourceToString = (source: string | Uint8Array) =>
  typeof source === "string" ? source : new TextDecoder().decode(source);

const singleChunkOutput = { codeSplitting: false } as const;

function singleFileHtml(): Plugin {
  return {
    name: "single-file-html",
    enforce: "post",
    generateBundle(_, bundle) {
      const htmlFileName = Object.keys(bundle).find((fileName) => fileName.endsWith(".html"));

      if (!htmlFileName) {
        return;
      }

      const htmlAsset = bundle[htmlFileName];

      if (htmlAsset.type !== "asset") {
        return;
      }

      let html = assetSourceToString(htmlAsset.source);

      for (const [fileName, output] of Object.entries(bundle)) {
        if (fileName === htmlFileName) {
          continue;
        }

        const reference = assetReferencePattern(fileName);

        if (output.type === "chunk") {
          const scriptTag = new RegExp(
            `<script\\b(?=[^>]*\\bsrc=["']${reference}["'])(?=[^>]*\\btype=["']module["'])[^>]*>\\s*</script>`,
            "g",
          );
          html = html.replace(scriptTag, () => `<script type="module">${escapeInlineScript(output.code)}</script>`);
          continue;
        }

        if (fileName.endsWith(".css")) {
          const linkTag = new RegExp(
            `<link\\b(?=[^>]*\\bhref=["']${reference}["'])(?=[^>]*\\brel=["']stylesheet["'])[^>]*>`,
            "g",
          );
          html = html.replace(
            linkTag,
            () => `<style>${escapeInlineStyle(assetSourceToString(output.source))}</style>`,
          );
        }
      }

      htmlAsset.source = compactHtmlShell(html);

      for (const fileName of Object.keys(bundle)) {
        if (fileName !== htmlFileName) {
          delete bundle[fileName];
        }
      }
    },
  };
}

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss(), singleFileHtml()],
  build: {
    assetsInlineLimit: Number.MAX_SAFE_INTEGER,
    cssCodeSplit: false,
    cssMinify: "lightningcss",
    minify: "oxc",
    modulePreload: false,
    rolldownOptions: {
      output: singleChunkOutput,
    },
    reportCompressedSize: false,
    sourcemap: false,
  },
});
