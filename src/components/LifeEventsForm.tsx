import type { LifeEvent } from '../types';
import { generateId } from '../lib/utils';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { CollapsibleCard } from './ui/card';
import { NumericInput } from './ui/numeric-input';
import { EditionNotice } from './EditionNotice';
import { IS_FULL, MAX_EVENTS } from '../lib/edition';
import { ArrowDown, Plus, Trash2 } from 'lucide-react';

interface Props {
  events: LifeEvent[];
  onChange: (events: LifeEvent[]) => void;
}

export function LifeEventsForm({ events, onChange }: Props) {
  const add = () => {
    if (events.length >= MAX_EVENTS) return;
    onChange([{ id: generateId(), age: 40, amount: 0, memo: '' }, ...events]);
  };

  const remove = (id: string) => onChange(events.filter(e => e.id !== id));

  const updateNum = (id: string, key: keyof LifeEvent, value: number) => {
    onChange(events.map(e => e.id !== id ? e : { ...e, [key]: value }));
  };

  const updateMemo = (id: string, memo: string) => {
    onChange(events.map(e => e.id !== id ? e : { ...e, memo }));
  };

  // 安定ソートなので同年齢のイベントは元の相対順を保つ
  const sortByAge = () => onChange([...events].sort((a, b) => a.age - b.age));

  return (
    <CollapsibleCard
      title="ライフイベント"
      count={events.length}
      contentClassName="space-y-3"
      action={
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={sortByAge} disabled={events.length < 2}>
            <ArrowDown className="w-3 h-3 mr-1" />年齢順
          </Button>
          <Button size="sm" variant="outline" onClick={add} disabled={events.length >= MAX_EVENTS}>
            <Plus className="w-3 h-3 mr-1" />追加
          </Button>
        </div>
      }
    >
      <p className="text-xs text-gray-500 bg-blue-50 rounded p-2 leading-relaxed">
        一時的な収支を年齢指定で反映します。プラス＝収入（投資へ追加）、
        マイナス＝支出（資産から取崩）。指定年齢の年初に一括適用されます。
      </p>
      {!IS_FULL && events.length >= MAX_EVENTS && (
        <EditionNotice>
          無料版で設定できるライフイベントは{MAX_EVENTS}個までです。開放版では30個まで設定できます。
        </EditionNotice>
      )}
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
    </CollapsibleCard>
  );
}
