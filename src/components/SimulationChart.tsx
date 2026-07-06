import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceArea, ReferenceLine,
} from 'recharts';
import type { LifeEvent, Period, SimulationRow } from '../types';
import { fmt } from '../lib/utils';

interface Props {
  rows: SimulationRow[];
  periods: Period[];
  lifeEvents: LifeEvent[];
  id?: string;
}

// 両グラフの Y 軸に割り当てる幅。
// 上グラフ（資産額）と下グラフ（年間収支）の tick ラベルの桁数が異なると
// Recharts が内部で異なる描画幅を使用し X 軸位置がずれるため、
// 十分大きな固定値を指定して両グラフのプロット領域左端を揃える。
const YAXIS_W = 72;

// 両グラフで同一の margin を使用することで X 軸の位置を揃える。
// top はラベル（期・イベント）用の余白として各グラフで上書きする（X 軸位置には影響しない）。
const CHART_MARGIN = { top: 4, right: 16, left: 8, bottom: 0 } as const;

// 期の背景帯とイベント縦線のラベル色・線色
const PERIOD_FILLS = ['#3b82f6', '#f59e0b'] as const;
const EVENT_COLOR = '#8b5cf6';

const truncate = (s: string, max: number) =>
  s.length > max ? s.slice(0, max) + '…' : s;

const eventLabel = (evs: LifeEvent[]) => {
  const first = truncate(evs[0].memo || 'イベント', 6);
  return evs.length > 1 ? `${first} 他${evs.length - 1}件` : first;
};

const AssetTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded shadow-md p-2 text-xs space-y-1 min-w-[130px]">
      <p className="font-semibold">{label}歳</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}：{fmt(p.value)} 万円
        </p>
      ))}
    </div>
  );
};

const BarTooltip = ({ active, payload, label, eventsByAge }: any) => {
  if (!active || !payload?.length) return null;
  const events: LifeEvent[] = eventsByAge?.get(label) ?? [];
  return (
    <div className="bg-white border border-gray-200 rounded shadow-md p-2 text-xs space-y-1 min-w-[130px]">
      <p className="font-semibold">{label}歳</p>
      {payload.map((p: any) => {
        const v = p.name === '取崩額' ? fmt(Math.abs(p.value)) : fmt(p.value);
        return (
          <p key={p.name} style={{ color: p.color }}>
            {p.name}：{v} 万円
          </p>
        );
      })}
      {events.length > 0 && (
        <div className="border-t border-gray-100 pt-1 space-y-1">
          {events.map(e => (
            <p key={e.id} style={{ color: EVENT_COLOR }}>
              {e.memo || 'イベント'}：{e.amount > 0 ? '+' : ''}{fmt(e.amount)} 万円
            </p>
          ))}
        </div>
      )}
    </div>
  );
};

export function SimulationChart({ rows, periods, lifeEvents, id = 'simulation-chart' }: Props) {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400 text-sm">
        期の設定を入力するとグラフが表示されます
      </div>
    );
  }

  const hasDepletion = rows.some(r => r.isDepleted);

  const chartData = rows.map(r => ({
    ...r,
    withdrawalBar: r.withdrawal > 0 ? -r.withdrawal : 0,
  }));

  const tickAges = rows
    .filter((_, i) => rows.length <= 20 || i % Math.ceil(rows.length / 20) === 0)
    .map(r => r.age);

  const minAge = rows[0].age;
  const maxAge = rows[rows.length - 1].age;

  // 期の区間（上段の背景帯）。期番号は PeriodsForm と同じく開始年齢昇順の順位
  const ranked = [...periods].sort((a, b) => a.startAge - b.startAge);
  const periodAreas = ranked
    .map((p, i) => ({
      rank: i + 1,
      memo: p.memo,
      x1: Math.max(p.startAge, minAge),
      x2: ranked[i + 1] ? Math.min(ranked[i + 1].startAge, maxAge) : maxAge,
    }))
    .filter(a => a.x1 < a.x2);

  // イベント縦線（下段）。グラフ範囲外の年齢は描画しない
  const eventsByAge = new Map<number, LifeEvent[]>();
  for (const e of lifeEvents) {
    if (e.age < minAge || e.age > maxAge) continue;
    const list = eventsByAge.get(e.age);
    if (list) list.push(e);
    else eventsByAge.set(e.age, [e]);
  }
  const eventLines = [...eventsByAge.entries()].sort(([a], [b]) => a - b);

  return (
    <div id={id} className="bg-white p-2 space-y-1">
      {hasDepletion && (
        <p className="text-xs text-red-600 font-medium">
          ⚠ {rows.find(r => r.isDepleted)?.age}歳で資産が枯渇します
        </p>
      )}

      {/* 上段：資産額（折れ線）＋期の区間帯 */}
      <p className="text-xs text-gray-500 font-medium pl-1">資産額（万円）</p>
      <ResponsiveContainer width="100%" height={384}>
        <ComposedChart data={chartData} margin={{ ...CHART_MARGIN, top: 20, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          {periodAreas.map((a, i) => (
            <ReferenceArea
              key={a.rank}
              x1={a.x1}
              x2={a.x2}
              fill={PERIOD_FILLS[i % 2]}
              fillOpacity={0.05}
              stroke="none"
              label={{
                value: `第${a.rank}期${a.memo ? ' ' + truncate(a.memo, 8) : ''}`,
                position: 'insideTop',
                fontSize: 10,
                fill: '#6b7280',
                dy: i % 2 === 0 ? 0 : 12,
              }}
            />
          ))}
          <XAxis
            dataKey="age"
            type="number"
            domain={['dataMin', 'dataMax']}
            ticks={tickAges}
            tickFormatter={v => `${v}歳`}
            tick={{ fontSize: 11 }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis tickFormatter={v => fmt(v, 0)} tick={{ fontSize: 11 }} width={YAXIS_W} />
          <Tooltip content={<AssetTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine y={0} stroke="#aaa" strokeDasharray="3 3" />
          <Line
            dataKey="asset"
            name="資産額"
            stroke="#f59e0b"
            strokeWidth={2.5}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>

      {/* 下段：利益額・投資額・取崩額（棒グラフ）＋ライフイベント縦線 */}
      <p className="text-xs text-gray-500 font-medium pl-1">年間収支（万円）</p>
      <ResponsiveContainer width="100%" height={312}>
        <ComposedChart data={chartData} margin={{ ...CHART_MARGIN, top: 38, bottom: 4 }} barGap={-8}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="age"
            type="number"
            domain={['dataMin', 'dataMax']}
            ticks={tickAges}
            tickFormatter={v => `${v}歳`}
            tick={{ fontSize: 11 }}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis tickFormatter={v => fmt(v, 0)} tick={{ fontSize: 11 }} width={YAXIS_W} />
          <Tooltip content={<BarTooltip eventsByAge={eventsByAge} />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine y={0} stroke="#aaa" strokeDasharray="3 3" />
          {eventLines.map(([age, evs], i) => (
            <ReferenceLine
              key={age}
              x={age}
              stroke={EVENT_COLOR}
              strokeDasharray="4 2"
              label={{
                value: eventLabel(evs),
                position: 'top',
                fontSize: 10,
                fill: EVENT_COLOR,
                dy: (i % 3) * 11 - 22,
              }}
            />
          ))}
          <Bar dataKey="investment"    name="投資額" stackId="pos" fill="#3b82f6" barSize={8} />
          <Bar dataKey="profit"        name="利益額" stackId="pos" fill="#22c55e" barSize={8} />
          <Bar dataKey="withdrawalBar" name="取崩額" fill="#ef4444" barSize={8} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
