import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import type { SimulationRow } from '../types';
import { fmt } from '../lib/utils';

interface Props {
  rows: SimulationRow[];
  id?: string;
}

// 両グラフの Y 軸に割り当てる幅。
// 上グラフ（資産額）と下グラフ（年間収支）の tick ラベルの桁数が異なると
// Recharts が内部で異なる描画幅を使用し X 軸位置がずれるため、
// 十分大きな固定値を指定して両グラフのプロット領域左端を揃える。
const YAXIS_W = 72;

// 両グラフで同一の margin を使用することで X 軸の位置を揃える。
const CHART_MARGIN = { top: 4, right: 16, left: 8, bottom: 0 } as const;

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

const BarTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
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
    </div>
  );
};

export function SimulationChart({ rows, id = 'simulation-chart' }: Props) {
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

  return (
    <div id={id} className="bg-white p-2 space-y-1">
      {hasDepletion && (
        <p className="text-xs text-red-600 font-medium">
          ⚠ {rows.find(r => r.isDepleted)?.age}歳で資産が枯渇します
        </p>
      )}

      {/* 上段：資産額（折れ線） */}
      <p className="text-xs text-gray-500 font-medium pl-1">資産額（万円）</p>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={chartData} margin={CHART_MARGIN}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="age"
            ticks={tickAges}
            tick={false}
            tickLine={false}
            axisLine={false}
            height={0}
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

      {/* 下段：利益額・投資額・取崩額（棒グラフ） */}
      <p className="text-xs text-gray-500 font-medium pl-1">年間収支（万円）</p>
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={chartData} margin={{ ...CHART_MARGIN, bottom: 4 }} barGap={-8}>
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
          <Tooltip content={<BarTooltip />} />
          <Legend wrapperStyle={{ fontSize: 11 }} />
          <ReferenceLine y={0} stroke="#aaa" strokeDasharray="3 3" />
          <Bar dataKey="investment"    name="投資額" stackId="pos" fill="#3b82f6" barSize={8} />
          <Bar dataKey="profit"        name="利益額" stackId="pos" fill="#22c55e" barSize={8} />
          <Bar dataKey="withdrawalBar" name="取崩額" fill="#ef4444" barSize={8} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
