import type { SimulationRow } from '../types';

export function exportCSV(rows: SimulationRow[]): void {
  const headers = [
    '年齢',
    '利回り（%）',
    '投資額（万円）',
    '取崩額（万円）',
    'ライフイベント（万円）',
    '利益額（万円）',
    '累計投資額（万円）',
    '累計取崩額（万円）',
    '累計利益額（万円）',
    '資産額（万円）',
  ];

  const round = (v: number) => Math.round(v * 100) / 100;

  const lines = rows.map(r => [
    r.age,
    r.rate,
    round(r.investment),
    round(r.withdrawal),
    r.lifeEvent !== 0 ? round(r.lifeEvent) : '',
    round(r.profit),
    round(r.cumulativeInvestment),
    round(r.cumulativeWithdrawal),
    round(r.cumulativeProfit),
    round(r.asset),
  ].join(','));

  const csv = '﻿' + headers.join(',') + '\n' + lines.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'life-plan-simulation.csv';
  a.click();
  URL.revokeObjectURL(url);
}
