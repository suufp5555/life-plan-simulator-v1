export interface GlobalSettings {
  initialPrincipal: number;
  initialProfit: number;
  endAge: number;
}

export interface Period {
  id: string;
  startAge: number;
  annualRate: number;
  monthlyAmount: number;
  annualAmount: number;
  memo: string;
}

export interface LifeEvent {
  id: string;
  age: number;
  amount: number;
  memo: string;
}

export interface SimulationRow {
  age: number;
  rate: number;
  investment: number;
  withdrawal: number;
  lifeEvent: number;
  profit: number;
  cumulativeInvestment: number;
  cumulativeWithdrawal: number;
  cumulativeProfit: number;
  asset: number;
  isDepleted: boolean;
}

export interface AppData {
  global: GlobalSettings;
  periods: Period[];
  lifeEvents: LifeEvent[];
}

export interface PresetPeriod {
  startAge: number;
  annualRate: number;
  monthlyAmount: number;
  annualAmount: number;
  memo: string;
}

export interface PresetLifeEvent {
  age: number;
  amount: number;
  memo: string;
}

export interface PresetData {
  global: GlobalSettings;
  periods: PresetPeriod[];
  lifeEvents: PresetLifeEvent[];
}

export interface Preset {
  name: string;
  data: PresetData;
}
