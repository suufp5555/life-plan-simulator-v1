import type { GlobalSettings, Preset } from '../types';
import { CollapsibleCard } from './ui/card';
import { Label } from './ui/label';
import { NumericInput } from './ui/numeric-input';

interface Props {
  value: GlobalSettings;
  onChange: (v: GlobalSettings) => void;
  presets: Preset[];
  selectedPreset: string;
  onPresetSelect: (name: string) => void;
}

export function GlobalSettingsForm({ value, onChange, presets, selectedPreset, onPresetSelect }: Props) {
  return (
    <CollapsibleCard title="基本設定" contentClassName="space-y-3">
      {presets.length > 0 && (
        <div className="space-y-1">
          <Label htmlFor="preset">プリセット</Label>
          <select
            id="preset"
            value={selectedPreset}
            onChange={e => onPresetSelect(e.target.value)}
            className="w-full text-sm border border-gray-300 rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {selectedPreset === '' && (
              <option value="">（カスタム）</option>
            )}
            {presets.map(p => (
              <option key={p.name} value={p.name}>{p.name}</option>
            ))}
          </select>
        </div>
      )}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <Label htmlFor="initialPrincipal">開始時投資元本（万円）</Label>
          <NumericInput
            id="initialPrincipal"
            value={value.initialPrincipal}
            onChange={v => onChange({ ...value, initialPrincipal: v })}
          />
          <p className="text-xs text-gray-400">これまでに投資した元本の合計</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="initialProfit">開始時投資利益額（万円）</Label>
          <NumericInput
            id="initialProfit"
            value={value.initialProfit}
            onChange={v => onChange({ ...value, initialProfit: v })}
          />
          <p className="text-xs text-gray-400">現在の評価益（資産額−元本）</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="endAge">終了年齢</Label>
          <NumericInput
            id="endAge"
            value={value.endAge}
            onChange={v => onChange({ ...value, endAge: v })}
          />
        </div>
      </div>
    </CollapsibleCard>
  );
}
