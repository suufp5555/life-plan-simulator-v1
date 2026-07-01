import { useEffect, useMemo, useState } from 'react';
import type { AppData, GlobalSettings, LifeEvent, Period, Preset } from './types';
import { simulate } from './lib/simulation';
import { generateId } from './lib/utils';
import { GlobalSettingsForm } from './components/GlobalSettingsForm';
import { PeriodsForm } from './components/PeriodsForm';
import { LifeEventsForm } from './components/LifeEventsForm';
import { SimulationChart } from './components/SimulationChart';
import { SimulationTable } from './components/SimulationTable';
import { ActionButtons } from './components/ActionButtons';
import { Card, CardContent, CardHeader, CardTitle } from './components/ui/card';

const DEFAULT_DATA: AppData = {
  global: { initialPrincipal: 50, initialProfit: 0, endAge: 100 },
  periods: [
    { id: generateId(), startAge: 25, annualRate: 4, monthlyAmount: 3,   annualAmount: 0, memo: '社会人スタート・少額積立' },
    { id: generateId(), startAge: 35, annualRate: 4, monthlyAmount: 7,   annualAmount: 0, memo: '収入安定・積立増加' },
    { id: generateId(), startAge: 45, annualRate: 4, monthlyAmount: 3,   annualAmount: 0, memo: '教育費ピーク・積立抑制' },
    { id: generateId(), startAge: 55, annualRate: 4, monthlyAmount: 10,  annualAmount: 0, memo: '収入ピーク・老後準備加速' },
    { id: generateId(), startAge: 65, annualRate: 4, monthlyAmount: -15, annualAmount: 0, memo: 'リタイア・取崩開始' },
  ],
  lifeEvents: [
    { id: generateId(), age: 30, amount: -300, memo: '結婚・新居費用' },
    { id: generateId(), age: 40, amount: -500, memo: '住宅購入頭金' },
    { id: generateId(), age: 60, amount: 1000, memo: '退職金' },
  ],
};

function sortByAge(periods: Period[]): Period[] {
  return [...periods].sort((a, b) => a.startAge - b.startAge);
}

function validatePeriods(periods: Period[]): string[] {
  const errors: string[] = [];
  const seen = new Set<number>();
  for (const p of sortByAge(periods)) {
    if (seen.has(p.startAge)) {
      errors.push(`開始年齢 ${p.startAge}歳 の期が重複しています。`);
    }
    seen.add(p.startAge);
  }
  return errors;
}

function applyPresetData(preset: Preset): AppData {
  return {
    global: preset.data.global,
    periods: sortByAge(preset.data.periods.map(p => ({ ...p, id: generateId() }))),
    lifeEvents: preset.data.lifeEvents.map(e => ({ ...e, id: generateId() })),
  };
}

export default function App() {
  const [data, setData] = useState<AppData>(DEFAULT_DATA);
  const [presets, setPresets] = useState<Preset[]>([]);
  const [selectedPreset, setSelectedPreset] = useState('');

  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}presets.json`)
      .then(r => r.json())
      .then((loaded: Preset[]) => {
        setPresets(loaded);
        if (loaded.length > 0) {
          setSelectedPreset(loaded[0].name);
          setData(applyPresetData(loaded[0]));
        }
      })
      .catch(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePresetSelect = (name: string) => {
    const preset = presets.find(p => p.name === name);
    if (!preset) return;
    setSelectedPreset(name);
    setData(applyPresetData(preset));
  };

  const setGlobal = (global: GlobalSettings) => setData(d => ({ ...d, global }));

  const updatePeriods = (periods: Period[]) =>
    setData(d => ({ ...d, periods }));

  const commitPeriods = (periods: Period[]) =>
    setData(d => ({ ...d, periods: sortByAge(periods) }));

  const setLifeEvents = (lifeEvents: LifeEvent[]) =>
    setData(d => ({ ...d, lifeEvents }));

  const handleImport = (imported: AppData) => {
    setData({ ...imported, periods: sortByAge(imported.periods) });
    setSelectedPreset('');
  };

  const periodErrors = useMemo(
    () => validatePeriods(data.periods),
    [data.periods],
  );

  const rows = useMemo(
    () => simulate(data.global, data.periods, data.lifeEvents),
    [data],
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-blue-700 text-white px-4 py-3 shadow">
        <h1 className="text-base font-bold tracking-wide">
          ライフプラン投資資産シミュレーター
        </h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-4 p-4 max-w-screen-2xl mx-auto">
        {/* 左カラム：入力フォーム */}
        <div className="lg:w-[420px] flex-shrink-0 space-y-3">
          <GlobalSettingsForm
            value={data.global}
            onChange={setGlobal}
            presets={presets}
            selectedPreset={selectedPreset}
            onPresetSelect={handlePresetSelect}
          />
          <PeriodsForm
            periods={data.periods}
            endAge={data.global.endAge}
            onChange={updatePeriods}
            onCommit={commitPeriods}
            errors={periodErrors}
          />
          <LifeEventsForm events={data.lifeEvents} onChange={setLifeEvents} />
          <ActionButtons data={data} rows={rows} onImport={handleImport} />
        </div>

        {/* 右カラム：グラフ・テーブル */}
        <div className="flex-1 space-y-3 min-w-0">
          <Card id="pdf-chart-card">
            <CardHeader>
              <CardTitle>投資資産推移グラフ</CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <SimulationChart rows={rows} />
            </CardContent>
          </Card>

          <Card id="pdf-table-card">
            <CardHeader>
              <CardTitle>年次推移テーブル（単位：万円）</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <SimulationTable rows={rows} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
