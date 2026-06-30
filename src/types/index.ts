export interface GlobalSettings {
  initialPrincipal: number; // 投資元本（万円）→ 累計投資額に加算
  initialProfit: number;    // 投資利益額（万円）→ 累計利益額に加算
  annualRate: number;       // %
  endAge: number;
}

export interface Period {
  id: string;
  startAge: number;
  monthlyAmount: number; // 万円/月（プラス=積立、マイナス=取崩）
  annualAmount: number;  // 万円/年（プラス=追加投資、マイナス=追加取崩）
  memo: string;
}

export interface LifeEvent {
  id: string;
  age: number;
  amount: number; // 万円（プラス=収入、マイナス=支出）
  memo: string;
}

export interface SimulationRow {
  age: number;
  investment: number;           // 投資額
  withdrawal: number;           // 支出額
  lifeEvent: number;            // ライフイベント収支
  profit: number;               // 利益額
  cumulativeInvestment: number; // 累計投資額
  cumulativeWithdrawal: number; // 累計支出額
  cumulativeProfit: number;     // 累計利益額
  asset: number;                // 資産額
  isDepleted: boolean;
}

export interface AppData {
  global: GlobalSettings;
  periods: Period[];
  lifeEvents: LifeEvent[];
}
