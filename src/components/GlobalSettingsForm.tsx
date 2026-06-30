import type { GlobalSettings } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { NumericInput } from './ui/numeric-input';

interface Props {
  value: GlobalSettings;
  onChange: (v: GlobalSettings) => void;
}

export function GlobalSettingsForm({ value, onChange }: Props) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>基本設定</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label htmlFor="initialPrincipal">開始時投資元本（万円）</Label>
            <NumericInput
              id="initialPrincipal"
              value={value.initialPrincipal}
              onChange={v => onChange({ ...value, initialPrincipal: v })}
            />
            <p className="text-xs text-gray-400">累計投資額に加算</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="initialProfit">開始時投資利益額（万円）</Label>
            <NumericInput
              id="initialProfit"
              value={value.initialProfit}
              onChange={v => onChange({ ...value, initialProfit: v })}
            />
            <p className="text-xs text-gray-400">累計利益額に加算</p>
          </div>
          <div className="space-y-1">
            <Label htmlFor="annualRate">投資資産利回り（%）</Label>
            <NumericInput
              id="annualRate"
              value={value.annualRate}
              onChange={v => onChange({ ...value, annualRate: v })}
            />
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
      </CardContent>
    </Card>
  );
}
