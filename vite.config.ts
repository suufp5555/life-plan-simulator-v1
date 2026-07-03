import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// 秘密URL運用のデプロイ先（将来の開放版）は VITE_NOINDEX=1 を指定してインデックスさせない
function noindexMeta(): Plugin {
  return {
    name: 'noindex-meta',
    transformIndexHtml(html) {
      if (process.env.VITE_NOINDEX !== '1') return html;
      return html.replace(
        '<meta name="viewport"',
        '<meta name="robots" content="noindex, nofollow" />\n    <meta name="viewport"',
      );
    },
  };
}

// GitHub Pages デプロイ時は VITE_BASE_URL=/リポジトリ名/ を環境変数で指定
export default defineConfig({
  plugins: [react(), tailwindcss(), noindexMeta()],
  base: process.env.VITE_BASE_URL ?? '/',
});
