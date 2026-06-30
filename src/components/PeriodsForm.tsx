import type { Period } from '../types';
import { generateId } from '../lib/utils';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { NumericInput } from './ui/numeric-input';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  periods: Period[];
  endAge: number;
  /** 入力中のリアルタイム更新（ソートなし） */
  onChange: (periods: Period[]) => void;
  /** 確定時の更新（追加・削除・startAgeのblur → ソートして表示順を整える） */
  onCommit: (periods: Period[]) => void;
  errors: string[];
}

const MAX_PERIODS = 10;

export function PeriodsForm({ periods, endAge, onChange, onCommit, errors }: Props) {
  const add = () => {
    if (periods.length >= MAX_PERIODS) return;
    const maxAge = Math.max(...periods.map(p => p.startAge), 0);
    const newPeriod: Period = {
      id: generateId(),
      startAge: maxAge + 10,
      monthlyAmount: 0,
      annualAmount: 0,
      memo: '',
    };
    onCommit([...periods, newPeriod]); // ソートして追加
  };

  const remove = (id: string) => {
    onCommit(periods.filter(p => p.id !== id)); // ソートして更新
  };

  const updateNum = (id: string, key: keyof Period, value: number) => {
    onChange(periods.map(p => p.id !== id ? p : { ...p, [key]: value }));
  };

  const updateMemo = (id: string, memo: string) => {
    onChange(periods.map(p => p.id !== id ? p : { ...p, memo }));
  };

  // startAge の編集が確定したらソート
  const commitStartAge = () => onCommit(periods);

  // 表示用：現在の配列順に番号を振る（ソートは blur 後に反映）
  return (
    <Card>
      <CardHeader>
        <CardTitle>期の設定</CardTitle>
        <Button size="sm" variant="outline" onClick={add} disabled={periods.length >= MAX_PERIODS}>
          <Plus className="w-3 h-3 mr-1" />期を追加
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {errors.length > 0 && (
          <div className="text-xs text-red-600 bg-red-50 rounded p-2 space-y-1">
            {errors.map((e, i) => <p key={i}>{e}</p>)}
          </div>
        )}
        {periods.map((p, i) => {
          const isFirst = i === 0;
          const overEnd = p.startAge >= endAge;
          return (
            <div
              key={p.id}
              className={`border rounded-md p-3 space-y-2 ${overEnd ? 'border-red-300 bg-red-50' : 'border-gray-200'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">
                  第{i + 1}期{isFirst ? '（現在）' : ''}
                </span>
                {!isFirst && (
                  <Button size="sm" variant="ghost" onClick={() => remove(p.id)}>
                    <Trash2 className="w-3 h-3 text-red-500" />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label>開始年齢</Label>
                  <NumericInput
                    key={`${p.id}-startAge`}
                    value={p.startAge}
                    onChange={v => updateNum(p.id, 'startAge', v)}
                    onBlur={commitStartAge}
                  />
                </div>
                <div className="space-y-1">
                  <Label>積立/取崩（万円/月）</Label>
                  <NumericInput
                    key={`${p.id}-monthly`}
                    value={p.monthlyAmount}
                    onChange={v => updateNum(p.id, 'monthlyAmount', v)}
                    placeholder="例：-15"
                  />
                </div>
                <div className="space-y-1">
                  <Label>追加投資/取崩（万円/年）</Label>
                  <NumericInput
                    key={`${p.id}-annual`}
                    value={p.annualAmount}
                    onChange={v => updateNum(p.id, 'annualAmount', v)}
                    placeholder="例：-100"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>メモ（想定シーン）</Label>
                <Textarea
                  rows={1}
                  placeholder="例：社会人スタート・少額積立"
                  value={p.memo}
                  onChange={e => updateMemo(p.id, e.target.value)}
                />
              </div>
              {overEnd && (
                <p className="text-xs text-red-600">開始年齢が終了年齢以上のため計算から除外されます</p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

