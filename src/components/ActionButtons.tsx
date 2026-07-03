import { useRef, useState } from 'react';
import type { AppData } from '../types';
import type { SimulationRow } from '../types';
import { Button } from './ui/button';
import { exportPDF } from '../lib/pdf';
import { exportCSV } from '../lib/csv';
import { EditionNotice } from './EditionNotice';
import { CAN_EXPORT, CAN_PDF } from '../lib/edition';
import { Download, Upload, FileDown, Table } from 'lucide-react';

interface Props {
  data: AppData;
  rows: SimulationRow[];
  onImport: (data: AppData) => void;
}

export function ActionButtons({ data, rows, onImport }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleExportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'life-plan.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string) as AppData;
        onImport(parsed);
      } catch {
        alert('ファイルの読み込みに失敗しました。正しいJSONファイルを選択してください。');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleExportPDF = async () => {
    setPdfLoading(true);
    try {
      await exportPDF(rows);
    } catch (err) {
      alert(`PDF出力に失敗しました:\n${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={handleExportJSON} disabled={!CAN_EXPORT}>
          <Download className="w-3 h-3 mr-1" />設定Export
        </Button>
        <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()} disabled={!CAN_EXPORT}>
          <Upload className="w-3 h-3 mr-1" />設定Import
        </Button>
        <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={handleImportJSON} />
        <Button size="sm" variant="outline" onClick={() => exportCSV(rows)} disabled={rows.length === 0}>
          <Table className="w-3 h-3 mr-1" />テーブルCSV出力
        </Button>
        <Button size="sm" variant="outline" onClick={handleExportPDF} disabled={rows.length === 0 || pdfLoading || !CAN_PDF}>
          <FileDown className="w-3 h-3 mr-1" />{pdfLoading ? 'PDF生成中...' : 'PDF出力'}
        </Button>
      </div>
      {(!CAN_EXPORT || !CAN_PDF) && (
        <EditionNotice>
          設定Export/Import・PDF出力は開放版でご利用いただけます。
        </EditionNotice>
      )}
    </div>
  );
}
