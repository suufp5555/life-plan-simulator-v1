import type { SimulationRow } from '../types';
import { fmt } from '../lib/utils';

interface Props {
  rows: SimulationRow[];
}

const Th = ({ children }: { children: React.ReactNode }) => (
  <th className="bg-blue-600 text-white text-xs font-medium px-2 py-2 text-right border-b border-blue-500"
    style={{ whiteSpace: 'nowrap' }}
  >
    {children}
  </th>
);

const Td = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <td className={`px-2 py-1.5 text-xs text-right border-b border-gray-100 ${className}`}
    style={{ whiteSpace: 'nowrap' }}
  >
    {children}
  </td>
);

export function SimulationTable({ rows }: Props) {
  if (rows.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        データがありません
      </div>
    );
  }

  return (
    <div id="simulation-table-scroll" className="overflow-auto" style={{ maxHeight: '360px' }}>
      <table className="w-full text-xs" style={{ borderCollapse: 'separate', borderSpacing: 0, minWidth: 'max-content' }}>
        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
          <tr>
            <Th>年齢</Th>
            <Th>利回り（%）</Th>
            <Th>投資額</Th>
            <Th>取崩額</Th>
            <Th>ライフイベント</Th>
            <Th>利益額</Th>
            <Th>累計投資額</Th>
            <Th>累計取崩額</Th>
            <Th>累計利益額</Th>
            <Th>資産額</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => {
            const base = i % 2 === 0 ? 'bg-white' : 'bg-gray-50';
            const textColor = r.isDepleted ? 'text-red-600 font-medium' : 'text-gray-700';
            return (
              <tr key={r.age} className={base}>
                <Td className={`text-center font-medium ${r.isDepleted ? 'text-red-600' : 'text-gray-800'}`}>
                  {r.age}歳
                </Td>
                <Td className="text-gray-500">{r.rate}%</Td>
                <Td className={textColor}>{fmt(r.investment)}</Td>
                <Td className={textColor}>{fmt(r.withdrawal)}</Td>
                <Td className={
                  r.lifeEvent < 0 ? 'text-red-500' :
                  r.lifeEvent > 0 ? 'text-green-600' :
                  'text-gray-400'
                }>
                  {r.lifeEvent !== 0 ? fmt(r.lifeEvent) : '-'}
                </Td>
                <Td className={textColor}>{fmt(r.profit)}</Td>
                <Td className={textColor}>{fmt(r.cumulativeInvestment)}</Td>
                <Td className={textColor}>{fmt(r.cumulativeWithdrawal)}</Td>
                <Td className={textColor}>{fmt(r.cumulativeProfit)}</Td>
                <Td className={r.isDepleted ? 'text-red-600 font-bold' : 'text-gray-900 font-medium'}>
                  {fmt(r.asset)}
                </Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
