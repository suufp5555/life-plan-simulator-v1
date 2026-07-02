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

// presets.json の先頭ペルソナ（共働き・子育て世帯）と同内容。読込失敗時のフォールバック
const DEFAULT_DATA: AppData = {
  global: { initialPrincipal: 300, initialProfit: 0, endAge: 100 },
  periods: [
    { id: generateId(), startAge: 35, annualRate: 4, monthlyAmount: 5,   annualAmount: 0, memo: '夫婦2人でNISA月5万' },
    { id: generateId(), startAge: 45, annualRate: 4, monthlyAmount: 3,   annualAmount: 0, memo: '教育費ピークで積立抑制' },
    { id: generateId(), startAge: 55, annualRate: 4, monthlyAmount: 8,   annualAmount: 0, memo: '教育費卒業・老後準備加速' },
    { id: generateId(), startAge: 65, annualRate: 3, monthlyAmount: -13, annualAmount: 0, memo: 'ゆとりある生活費35万−年金(2人分)22万＝取崩13万' },
  ],
  lifeEvents: [
    { id: generateId(), age: 40, amount: -300, memo: '住宅購入頭金' },
    { id: generateId(), age: 48, amount: -150, memo: '子①大学入学' },
    { id: generateId(), age: 50, amount: -150, memo: '子②大学入学' },
    { id: generateId(), age: 55, amount: -200, memo: '車買い替え' },
    { id: generateId(), age: 55, amount: -100, memo: '子①結婚援助' },
    { id: generateId(), age: 57, amount: -100, memo: '子②結婚援助' },
    { id: generateId(), age: 60, amount: 1500, memo: '退職金（2人分）' },
    { id: generateId(), age: 68, amount: -250, memo: '車買い替え' },
    { id: generateId(), age: 75, amount: -400, memo: '住宅リフォーム' },
    { id: generateId(), age: 85, amount: -800, memo: '介護費用（2人分）' },
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
              <p className="text-xs text-gray-400 px-2 pt-1">
                ※ 設定した利回りが毎年一定で続く前提の月次複利計算です。税金・手数料・物価上昇（インフレ）は考慮していません。
              </p>
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

      <footer className="px-4 py-6 text-center text-xs text-gray-400 space-y-1">
        <p>本シミュレーションは簡易的な試算であり、将来の運用成果を保証するものではありません。</p>
        <p>特定の金融商品の推奨や投資助言を行うものではありません。投資の判断はご自身の責任でお願いします。</p>
      </footer>
    </div>
  );
}
