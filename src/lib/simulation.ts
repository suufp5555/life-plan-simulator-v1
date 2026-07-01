import type { GlobalSettings, Period, LifeEvent, SimulationRow } from '../types';

export function simulate(
  global: GlobalSettings,
  periods: Period[],
  lifeEvents: LifeEvent[],
): SimulationRow[] {
  const { initialPrincipal, initialProfit, endAge } = global;

  const sorted = [...periods]
    .filter(p => p.startAge < endAge)
    .sort((a, b) => a.startAge - b.startAge);

  if (sorted.length === 0) return [];

  const startAge = sorted[0].startAge;
  if (startAge >= endAge) return [];

  let asset = initialPrincipal + initialProfit;
  let cumulativeInvestment = initialPrincipal;
  let cumulativeWithdrawal = 0;
  let cumulativeProfit = initialProfit;
  let depletionRecorded = false;

  const rows: SimulationRow[] = [];

  for (let age = startAge; age <= endAge; age++) {
    const period = [...sorted].reverse().find(p => p.startAge <= age);
    const monthlyAmount = period?.monthlyAmount ?? 0;
    const annualAmount  = period?.annualAmount  ?? 0;
    const annualRate    = period?.annualRate     ?? 0;
    const monthlyRate   = Math.pow(1 + annualRate / 100, 1 / 12) - 1;

    const lifeEventAmount = lifeEvents
      .filter(e => e.age === age)
      .reduce((sum, e) => sum + e.amount, 0);

    asset += lifeEventAmount;
    asset += annualAmount;

    let yearInvestment = 0;
    let yearWithdrawal = 0;

    if (lifeEventAmount > 0) yearInvestment += lifeEventAmount;
    else if (lifeEventAmount < 0) yearWithdrawal += Math.abs(lifeEventAmount);

    if (annualAmount > 0) yearInvestment += annualAmount;
    else if (annualAmount < 0) yearWithdrawal += Math.abs(annualAmount);

    const assetBeforeMonthly = asset;
    for (let m = 0; m < 12; m++) {
      asset += monthlyAmount;
      asset = asset * (1 + monthlyRate);
    }

    const totalMonthlyContribution = monthlyAmount * 12;
    const yearProfit = asset - assetBeforeMonthly - totalMonthlyContribution;

    if (monthlyAmount > 0) yearInvestment += monthlyAmount * 12;
    else if (monthlyAmount < 0) yearWithdrawal += Math.abs(monthlyAmount) * 12;

    cumulativeInvestment += yearInvestment;
    cumulativeWithdrawal += yearWithdrawal;
    cumulativeProfit     += yearProfit;

    const isDepleted = asset < 0;
    if (isDepleted && !depletionRecorded) depletionRecorded = true;

    rows.push({
      age,
      rate: annualRate,
      investment: yearInvestment,
      withdrawal: yearWithdrawal,
      lifeEvent: lifeEventAmount,
      profit: yearProfit,
      cumulativeInvestment,
      cumulativeWithdrawal,
      cumulativeProfit,
      asset,
      isDepleted,
    });
  }

  return rows;
}

export function findDepletionAge(rows: SimulationRow[]): number | null {
  const row = rows.find(r => r.isDepleted);
  return row ? row.age : null;
}
