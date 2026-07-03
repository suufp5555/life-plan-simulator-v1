import type { ReactNode } from 'react';
import { NOTE_URL } from '../lib/edition';

// 無料版で機能制限に触れた箇所に出す案内。NOTE_URL 設定後は購入案内リンクも表示する
export function EditionNotice({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs text-amber-800 bg-amber-50 rounded p-2 leading-relaxed">
      {children}
      {NOTE_URL && (
        <>
          {' '}
          <a
            href={NOTE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold"
          >
            開放版のご案内はこちら
          </a>
        </>
      )}
    </p>
  );
}
