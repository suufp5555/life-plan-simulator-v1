// エディション（無料版/開放版）の定義。ビルド時の環境変数 VITE_EDITION で決まる。
// 現在は freemium 未ロールアウトのため未設定時は full（全デプロイ先が開放版相当で動作）。
// 無料版/開放版の運用を開始する際は未設定時 free に反転させること
export const IS_FULL = import.meta.env.VITE_EDITION !== 'free';

// 無料版の上限はプリセットの最大構成（期4・イベント10）に合わせ、
// プリセット読込が無料版でも制限と矛盾しないようにする
export const MAX_PERIODS = IS_FULL ? 10 : 4;
export const MAX_EVENTS = IS_FULL ? 30 : 10;

// 設定Export/Import・PDF出力は開放版のみ（テーブルCSV出力は無料版でも可）
export const CAN_EXPORT = IS_FULL;
export const CAN_PDF = IS_FULL;

// note有料記事のURL。記事公開後にここへ設定する（空の間は案内文のみでリンクは表示しない）
export const NOTE_URL = '';
