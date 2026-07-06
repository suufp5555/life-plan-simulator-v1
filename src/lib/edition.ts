// エディション（無料版/開放版）の定義。ビルド時の環境変数 VITE_EDITION で決まる。
// 現在は freemium 未ロールアウトのため未設定時は full（全デプロイ先が開放版相当で動作）。
// 無料版/開放版の運用を開始する際は未設定時 free に反転させること
export const IS_FULL = import.meta.env.VITE_EDITION !== 'free';

// 無料版は期3・イベント3まで。無料版用プリセット（presets-free.json）は
// 全件この上限内に収め、プリセット読込が制限と矛盾しないようにする
export const MAX_PERIODS = IS_FULL ? 10 : 3;
export const MAX_EVENTS = IS_FULL ? 30 : 3;

// 設定Export/Import・テーブルCSV出力・PDF出力は開放版のみ
export const CAN_EXPORT = IS_FULL;
export const CAN_PDF = IS_FULL;
export const CAN_CSV = IS_FULL;

// エディション別のプリセット定義ファイル（public/ 配下、App.tsx が fetch する）
export const PRESETS_FILE = IS_FULL ? 'presets.json' : 'presets-free.json';

// note有料記事のURL。記事公開後にここへ設定する（空の間は案内文のみでリンクは表示しない）
export const NOTE_URL = '';
