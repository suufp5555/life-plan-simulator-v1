import type { LifeEvent } from '../types';
import { generateId } from '../lib/utils';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { NumericInput } from './ui/numeric-input';
import { Plus, Trash2 } from 'lucide-react';

interface Props {
  events: LifeEvent[];
  onChange: (events: LifeEvent[]) => void;
}

const MAX_EVENTS = 10;

export function LifeEventsForm({ events, onChange }: Props) {
  const add = () => {
    if (events.length >= MAX_EVENTS) return;
    onChange([...events, { id: generateId(), age: 40, amount: -100, memo: '' }]);
  };

  const remove = (id: string) => onChange(events.filter(e => e.id !== id));

  const updateNum = (id: string, key: keyof LifeEvent, value: number) => {
    onChange(events.map(e => e.id !== id ? e : { ...e, [key]: value }));
  };

  const updateMemo = (id: string, memo: string) => {
    onChange(events.map(e => e.id !== id ? e : { ...e, memo }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>ライフイベント</CardTitle>
        <Button size="sm" variant="outline" onClick={add} disabled={events.length >= MAX_EVENTS}>
          <Plus className="w-3 h-3 mr-1" />追加
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.length === 0 && (
          <p className="text-xs text-gray-400 text-center py-2">ライフイベントがありません</p>
        )}
        {events.map(ev => (
          <div key={ev.id} className="border border-gray-200 rounded-md p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-gray-600">イベント</span>
              <Button size="sm" variant="ghost" onClick={() => remove(ev.id)}>
                <Trash2 className="w-3 h-3 text-red-500" />
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label>年齢</Label>
                <NumericInput
                  value={ev.age}
                  onChange={v => updateNum(ev.id, 'age', v)}
                />
              </div>
              <div className="space-y-1">
                <Label>収入/支出額（万円）</Label>
                <NumericInput
                  value={ev.amount}
                  onChange={v => updateNum(ev.id, 'amount', v)}
                  placeholder="例：-500"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label>メモ（ライフイベント内容）</Label>
              <Textarea
                rows={1}
                placeholder="例：住宅購入頭金"
                value={ev.memo}
                onChange={e => updateMemo(ev.id, e.target.value)}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
